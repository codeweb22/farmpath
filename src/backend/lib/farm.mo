import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/farm";

module {
  let NS_PER_DAY : Nat = 86_400_000_000_000;

  // Comparator for the (owner, lessonId) progress-map key.
  func compareProgressKey(
    a : (Principal, Types.LessonId),
    b : (Principal, Types.LessonId),
  ) : Order.Order {
    switch (Principal.compare(a.0, b.0)) {
      case (#equal) { Nat.compare(a.1, b.1) };
      case (order) { order };
    };
  };

  // Returns the UTC day index (days since the Unix epoch) for a timestamp in ns.
  public func dayOf(timestamp : Types.Timestamp) : Nat {
    if (timestamp <= 0) { 0 } else {
      (timestamp / NS_PER_DAY.toInt()).toNat();
    };
  };

  // Returns the UTC day index for "today" at the current time.
  public func today() : Nat {
    dayOf(Time.now());
  };

  // Counts the lessons belonging to a crop.
  func lessonCountFor(
    lessons : Map.Map<Types.LessonId, Types.Lesson>,
    cropId : Types.CropId,
  ) : Nat {
    var count = 0;
    for (lesson in lessons.values()) {
      if (lesson.cropId == cropId) { count += 1 };
    };
    count;
  };

  // Counts the caller's completed lessons for a crop.
  func completedCountFor(
    progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>,
    caller : Principal,
    cropId : Types.CropId,
  ) : Nat {
    var count = 0;
    for (p in progress.values()) {
      if (p.owner == caller and p.cropId == cropId) { count += 1 };
    };
    count;
  };

  // Builds the caller-enriched view of a crop.
  func toCropView(
    crop : Types.Crop,
    lessons : Map.Map<Types.LessonId, Types.Lesson>,
    progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>,
    caller : Principal,
  ) : Types.CropView {
    {
      id = crop.id;
      name = crop.name;
      description = crop.description;
      photoUrl = crop.photoUrl;
      lessonCount = lessonCountFor(lessons, crop.id);
      completedCount = completedCountFor(progress, caller, crop.id);
    };
  };

  // Lists the crop catalog with the caller's lesson progress.
  public func listCrops(
    crops : Map.Map<Types.CropId, Types.Crop>,
    lessons : Map.Map<Types.LessonId, Types.Lesson>,
    progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>,
    caller : Principal,
  ) : [Types.CropView] {
    let views = crops.values().map(
      func(crop) = toCropView(crop, lessons, progress, caller)
    ).toArray();
    views.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  // Returns one crop with its lessons and the caller's completion flags.
  public func getCrop(
    crops : Map.Map<Types.CropId, Types.Crop>,
    lessons : Map.Map<Types.LessonId, Types.Lesson>,
    progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>,
    caller : Principal,
    id : Types.CropId,
  ) : ?Types.CropDetail {
    switch (crops.get(id)) {
      case null { null };
      case (?crop) {
        let cropLessons = lessons.values().filter(
          func(lesson) = lesson.cropId == id
        ).toArray();
        let ordered = cropLessons.sort(func(a, b) = Nat.compare(a.order, b.order));
        let lessonViews = ordered.map(
          func(lesson) {
            {
              id = lesson.id;
              cropId = lesson.cropId;
              title = lesson.title;
              description = lesson.description;
              videoUrl = lesson.videoUrl;
              order = lesson.order;
              completed = progress.get(compareProgressKey, (caller, lesson.id)) != null;
            };
          }
        );
        ?{
          crop = toCropView(crop, lessons, progress, caller);
          lessons = lessonViews;
        };
      };
    };
  };

  // Marks a lesson complete for the caller; idempotent.
  public func completeLesson(
    crops : Map.Map<Types.CropId, Types.Crop>,
    lessons : Map.Map<Types.LessonId, Types.Lesson>,
    progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>,
    caller : Principal,
    lessonId : Types.LessonId,
  ) : ?Types.CropView {
    switch (lessons.get(lessonId)) {
      case null { null };
      case (?lesson) {
        if (progress.get(compareProgressKey, (caller, lessonId)) == null) {
          progress.add(
            compareProgressKey,
            (caller, lessonId),
            {
              owner = caller;
              lessonId;
              cropId = lesson.cropId;
              completedAt = Time.now();
            },
          );
        };
        switch (crops.get(lesson.cropId)) {
          case null { null };
          case (?crop) { ?toCropView(crop, lessons, progress, caller) };
        };
      };
    };
  };

  // Removes the caller's completion of a lesson; idempotent.
  public func uncompleteLesson(
    crops : Map.Map<Types.CropId, Types.Crop>,
    lessons : Map.Map<Types.LessonId, Types.Lesson>,
    progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>,
    caller : Principal,
    lessonId : Types.LessonId,
  ) : ?Types.CropView {
    switch (lessons.get(lessonId)) {
      case null { null };
      case (?lesson) {
        progress.remove(compareProgressKey, (caller, lessonId));
        switch (crops.get(lesson.cropId)) {
          case null { null };
          case (?crop) { ?toCropView(crop, lessons, progress, caller) };
        };
      };
    };
  };

  // Overall lesson progress across the caller's selected crops.
  public func progressSummary(
    crops : Map.Map<Types.CropId, Types.Crop>,
    lessons : Map.Map<Types.LessonId, Types.Lesson>,
    progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>,
    caller : Principal,
  ) : Types.ProgressSummary {
    let cropViews = listCrops(crops, lessons, progress, caller);
    var totalLessons = 0;
    var completedLessons = 0;
    for (view in cropViews.values()) {
      totalLessons += view.lessonCount;
      completedLessons += view.completedCount;
    };
    {
      totalLessons;
      completedLessons;
      crops = cropViews;
    };
  };

  // Adds a crop to the caller's farm and returns its view.
  public func addCrop(
    crops : Map.Map<Types.CropId, Types.Crop>,
    state : { var nextCropId : Nat },
    caller : Principal,
    input : Types.CropInput,
  ) : Types.CropView {
    ignore caller;
    let id = state.nextCropId;
    state.nextCropId := id + 1;
    let crop : Types.Crop = {
      id;
      name = input.name;
      description = input.description;
      photoUrl = input.photoUrl;
    };
    crops.add(id, crop);
    {
      id;
      name = crop.name;
      description = crop.description;
      photoUrl = crop.photoUrl;
      lessonCount = 0;
      completedCount = 0;
    };
  };

  // Builds the public view of an activity, resolving its crop name.
  func toActivityView(
    activity : Types.Activity,
    crops : Map.Map<Types.CropId, Types.Crop>,
  ) : Types.ActivityView {
    let cropName = switch (crops.get(activity.cropId)) {
      case (?crop) { crop.name };
      case null { "" };
    };
    {
      id = activity.id;
      cropId = activity.cropId;
      cropName;
      kind = activity.kind;
      quantity = activity.quantity;
      unit = activity.unit;
      amount = activity.amount;
      date = activity.date;
      note = activity.note;
      createdAt = activity.createdAt;
    };
  };

  // Lists the caller's activities, optionally filtered by crop and kind.
  public func listActivities(
    activities : Map.Map<Types.ActivityId, Types.Activity>,
    crops : Map.Map<Types.CropId, Types.Crop>,
    caller : Principal,
    cropFilter : ?Types.CropId,
    kindFilter : ?Types.ActivityKind,
  ) : [Types.ActivityView] {
    let owned = activities.values().filter(
      func(activity) = activity.owner == caller
    ).toArray();
    let filtered = owned.filter(
      func(activity) {
        let cropOk = switch (cropFilter) {
          case null { true };
          case (?cropId) { activity.cropId == cropId };
        };
        let kindOk = switch (kindFilter) {
          case null { true };
          case (?kind) { activity.kind == kind };
        };
        cropOk and kindOk;
      }
    );
    let views = filtered.map(func(activity) = toActivityView(activity, crops));
    views.sort(func(a, b) = Nat.compare(b.id, a.id));
  };

  // Logs a new activity for the caller and returns its view.
  public func logActivity(
    activities : Map.Map<Types.ActivityId, Types.Activity>,
    crops : Map.Map<Types.CropId, Types.Crop>,
    state : { var nextActivityId : Nat },
    caller : Principal,
    input : Types.ActivityInput,
  ) : Types.ActivityView {
    let id = state.nextActivityId;
    state.nextActivityId := id + 1;
    let activity : Types.Activity = {
      id;
      owner = caller;
      cropId = input.cropId;
      kind = input.kind;
      quantity = input.quantity;
      unit = input.unit;
      amount = input.amount;
      date = input.date;
      note = input.note;
      createdAt = Time.now();
    };
    activities.add(id, activity);
    toActivityView(activity, crops);
  };

  // Edits an owned activity; returns the updated view or null.
  public func updateActivity(
    activities : Map.Map<Types.ActivityId, Types.Activity>,
    crops : Map.Map<Types.CropId, Types.Crop>,
    caller : Principal,
    id : Types.ActivityId,
    input : Types.ActivityInput,
  ) : ?Types.ActivityView {
    switch (activities.get(id)) {
      case null { null };
      case (?activity) {
        if (activity.owner != caller) { return null };
        let updated : Types.Activity = {
          id = activity.id;
          owner = activity.owner;
          cropId = input.cropId;
          kind = input.kind;
          quantity = input.quantity;
          unit = input.unit;
          amount = input.amount;
          date = input.date;
          note = input.note;
          createdAt = activity.createdAt;
        };
        activities.add(id, updated);
        ?toActivityView(updated, crops);
      };
    };
  };

  // Deletes an owned activity; returns whether it existed.
  public func deleteActivity(
    activities : Map.Map<Types.ActivityId, Types.Activity>,
    caller : Principal,
    id : Types.ActivityId,
  ) : Bool {
    switch (activities.get(id)) {
      case null { false };
      case (?activity) {
        if (activity.owner != caller) { return false };
        activities.remove(id);
        true;
      };
    };
  };

  // Income minus recorded costs per crop and overall.
  public func profitSummary(
    activities : Map.Map<Types.ActivityId, Types.Activity>,
    crops : Map.Map<Types.CropId, Types.Crop>,
    caller : Principal,
  ) : Types.ProfitSummary {
    var totalIncome = 0;
    var totalCost = 0;
    let incomeByCrop = Map.empty<Types.CropId, Nat>();
    let costByCrop = Map.empty<Types.CropId, Nat>();
    for (activity in activities.values()) {
      if (activity.owner == caller) {
        switch (activity.kind) {
          case (#sale) {
            totalIncome += activity.amount;
            incomeByCrop.add(
              activity.cropId,
              (incomeByCrop.get(activity.cropId) ?? 0) + activity.amount,
            );
          };
          case (#cost) {
            totalCost += activity.amount;
            costByCrop.add(
              activity.cropId,
              (costByCrop.get(activity.cropId) ?? 0) + activity.amount,
            );
          };
          case (#harvest) {};
        };
      };
    };
    let byCrop = crops.values().map(
      func(crop) {
        let income = incomeByCrop.get(crop.id) ?? 0;
        let cost = costByCrop.get(crop.id) ?? 0;
        {
          cropId = crop.id;
          cropName = crop.name;
          income;
          cost;
          profit = income.toInt() - cost.toInt();
        };
      }
    ).toArray();
    let sorted = byCrop.sort(func(a, b) = Nat.compare(a.cropId, b.cropId));
    {
      totalIncome;
      totalCost;
      totalProfit = totalIncome.toInt() - totalCost.toInt();
      byCrop = sorted;
    };
  };

  // Home dashboard summary for the caller.
  public func dashboardSummary(
    crops : Map.Map<Types.CropId, Types.Crop>,
    lessons : Map.Map<Types.LessonId, Types.Lesson>,
    progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>,
    activities : Map.Map<Types.ActivityId, Types.Activity>,
    caller : Principal,
  ) : Types.DashboardSummary {
    var activeCrops = 0;
    var upcomingTasks = 0;
    for (crop in crops.values()) {
      let total = lessonCountFor(lessons, crop.id);
      if (total > 0) { activeCrops += 1 };
      let completed = completedCountFor(progress, caller, crop.id);
      if (total > completed) { upcomingTasks += total - completed };
    };
    let recent = listActivities(activities, crops, caller, null, null);
    let recentSlice = if (recent.size() > 5) {
      recent.sliceToArray(0, 5);
    } else {
      recent;
    };
    {
      activeCrops;
      upcomingTasks;
      recentActivity = recentSlice;
      hasData = crops.size() > 0 or recent.size() > 0;
    };
  };
};

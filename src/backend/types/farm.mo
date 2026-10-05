import Common "common";

module {
  public type CropId = Common.CropId;
  public type LessonId = Common.LessonId;
  public type ActivityId = Common.ActivityId;
  public type Timestamp = Common.Timestamp;

  // A pepper variety in the crop catalog. Crops are global reference data
  // (seeded by the platform), not owned by a single principal.
  public type Crop = {
    id : CropId;
    name : Text;
    description : Text;
    photoUrl : Text;
  };

  // A lesson belonging to a crop. Lessons are global reference data.
  public type Lesson = {
    id : LessonId;
    cropId : CropId;
    title : Text;
    description : Text;
    videoUrl : Text;
    order : Nat; // display order within the crop, ascending
  };

  // A caller's completion of a single lesson.
  public type LessonProgress = {
    owner : Principal;
    lessonId : LessonId;
    cropId : CropId;
    completedAt : Timestamp;
  };

  // The kind of a logged farm activity.
  public type ActivityKind = {
    #harvest; // quantity harvested
    #sale; // quantity sold for an amount
    #cost; // money spent
  };

  // A logged farm activity owned by a single principal.
  public type Activity = {
    id : ActivityId;
    owner : Principal;
    cropId : CropId;
    kind : ActivityKind;
    quantity : Nat; // units harvested or sold; 0 for costs
    unit : Text; // e.g. "kg", "crate"
    amount : Nat; // sale income or cost in the smallest currency unit; 0 for harvest
    date : Nat; // UTC day index (days since the Unix epoch)
    note : ?Text;
    createdAt : Timestamp;
  };

  // Public view of a crop enriched with the caller's lesson progress.
  public type CropView = {
    id : CropId;
    name : Text;
    description : Text;
    photoUrl : Text;
    lessonCount : Nat;
    completedCount : Nat;
  };

  // A lesson plus whether the caller has completed it.
  public type LessonView = {
    id : LessonId;
    cropId : CropId;
    title : Text;
    description : Text;
    videoUrl : Text;
    order : Nat;
    completed : Bool;
  };

  // A crop with its full lesson list and the caller's progress.
  public type CropDetail = {
    crop : CropView;
    lessons : [LessonView];
  };

  // Overall lesson progress across the caller's selected crops.
  public type ProgressSummary = {
    totalLessons : Nat;
    completedLessons : Nat;
    crops : [CropView];
  };

  // Public view of a logged activity.
  public type ActivityView = {
    id : ActivityId;
    cropId : CropId;
    cropName : Text;
    kind : ActivityKind;
    quantity : Nat;
    unit : Text;
    amount : Nat;
    date : Nat;
    note : ?Text;
    createdAt : Timestamp;
  };

  // Income minus recorded costs for one crop.
  public type CropProfit = {
    cropId : CropId;
    cropName : Text;
    income : Nat;
    cost : Nat;
    profit : Int; // income - cost; may be negative
  };

  // Profit breakdown overall and per crop.
  public type ProfitSummary = {
    totalIncome : Nat;
    totalCost : Nat;
    totalProfit : Int;
    byCrop : [CropProfit];
  };

  // Home dashboard summary for the caller.
  public type DashboardSummary = {
    activeCrops : Nat;
    upcomingTasks : Nat;
    recentActivity : [ActivityView];
    hasData : Bool;
  };

  // Input for logging or editing an activity.
  public type ActivityInput = {
    cropId : CropId;
    kind : ActivityKind;
    quantity : Nat;
    unit : Text;
    amount : Nat;
    date : Nat;
    note : ?Text;
  };

  // Input for adding a crop to the caller's farm.
  public type CropInput = {
    name : Text;
    description : Text;
    photoUrl : Text;
  };
};

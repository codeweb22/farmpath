import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // --- New (farm) state shape, inlined ---
  type CropId = Nat;
  type LessonId = Nat;
  type ActivityId = Nat;
  type Timestamp = Int;

  type Crop = {
    id : CropId;
    name : Text;
    description : Text;
    photoUrl : Text;
  };

  type Lesson = {
    id : LessonId;
    cropId : CropId;
    title : Text;
    description : Text;
    videoUrl : Text;
    order : Nat;
  };

  type LessonProgress = {
    owner : Principal;
    lessonId : LessonId;
    cropId : CropId;
    completedAt : Timestamp;
  };

  type ActivityKind = {
    #harvest;
    #sale;
    #cost;
  };

  type Activity = {
    id : ActivityId;
    owner : Principal;
    cropId : CropId;
    kind : ActivityKind;
    quantity : Nat;
    unit : Text;
    amount : Nat;
    date : Nat;
    note : ?Text;
    createdAt : Timestamp;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    crops : Map.Map<CropId, Crop>;
    lessons : Map.Map<LessonId, Lesson>;
    progress : Map.Map<(Principal, LessonId), LessonProgress>;
    activities : Map.Map<ActivityId, Activity>;
    state : { var nextCropId : Nat; var nextActivityId : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    // Seed the built-in pepper crop catalog. This is app content, not user
    // data, so it is created once here and shared by every caller.
    let crops = Map.empty<CropId, Crop>();
    let lessons = Map.empty<LessonId, Lesson>();

    let catalog : [(Crop, [Lesson])] = [
      (
        {
          id = 0;
          name = "Bell Pepper";
          description = "Sweet, blocky peppers that thrive in warm weather and full sun.";
          photoUrl = "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800";
        },
        [
          { id = 0; cropId = 0; title = "Choosing a spot"; description = "Pick a sunny bed with well-drained soil."; videoUrl = "https://www.youtube.com/embed/1"; order = 0 },
          { id = 1; cropId = 0; title = "Planting seedlings"; description = "Transplant after the last frost, 45 cm apart."; videoUrl = "https://www.youtube.com/embed/2"; order = 1 },
          { id = 2; cropId = 0; title = "Watering & feeding"; description = "Keep soil moist and feed every two weeks."; videoUrl = "https://www.youtube.com/embed/3"; order = 2 },
          { id = 3; cropId = 0; title = "Harvesting"; description = "Cut fruit when firm and glossy."; videoUrl = "https://www.youtube.com/embed/4"; order = 3 },
        ],
      ),
      (
        {
          id = 1;
          name = "Chili Pepper";
          description = "Compact, fiery peppers ideal for containers and small plots.";
          photoUrl = "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800";
        },
        [
          { id = 4; cropId = 1; title = "Starting seeds"; description = "Sow indoors 8 weeks before the last frost."; videoUrl = "https://www.youtube.com/embed/5"; order = 0 },
          { id = 5; cropId = 1; title = "Potting up"; description = "Move to a larger pot as roots fill the tray."; videoUrl = "https://www.youtube.com/embed/6"; order = 1 },
          { id = 6; cropId = 1; title = "Heat management"; description = "Full sun and steady warmth boost pungency."; videoUrl = "https://www.youtube.com/embed/7"; order = 2 },
        ],
      ),
      (
        {
          id = 2;
          name = "Scotch Bonnet";
          description = "A hot Caribbean variety with a fruity, aromatic flavour.";
          photoUrl = "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=800";
        },
        [
          { id = 7; cropId = 2; title = "Soil preparation"; description = "Enrich with compost before planting."; videoUrl = "https://www.youtube.com/embed/8"; order = 0 },
          { id = 8; cropId = 2; title = "Supporting plants"; description = "Stake heavy branches as fruit sets."; videoUrl = "https://www.youtube.com/embed/9"; order = 1 },
          { id = 9; cropId = 2; title = "Ripening"; description = "Wait for a deep colour before picking."; videoUrl = "https://www.youtube.com/embed/10"; order = 2 },
        ],
      ),
    ];

    for ((crop, cropLessons) in catalog.values()) {
      crops.add(crop.id, crop);
      for (lesson in cropLessons.values()) {
        lessons.add(lesson.id, lesson);
      };
    };

    {
      accessControlState = AccessControl.initState();
      crops;
      lessons;
      progress = Map.empty();
      activities = Map.empty();
      state = { var nextCropId = 3; var nextActivityId = 0 };
    };
  };
};

import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import FarmLib "../lib/farm";
import Types "../types/farm";

mixin (
  accessControlState : AccessControl.AccessControlState,
  crops : Map.Map<Types.CropId, Types.Crop>,
  lessons : Map.Map<Types.LessonId, Types.Lesson>,
  progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>,
  state : { var nextCropId : Nat },
) {
  // Rejects anonymous and unregistered callers.
  func requireUser(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore AccessControl.getUserRole(accessControlState, caller);
  };

  // Lists the crop catalog with the caller's lesson progress.
  public query ({ caller }) func listCrops() : async [Types.CropView] {
    requireUser(caller);
    FarmLib.listCrops(crops, lessons, progress, caller);
  };

  // Returns one crop with its lessons and the caller's completion flags.
  public query ({ caller }) func getCrop(id : Types.CropId) : async ?Types.CropDetail {
    requireUser(caller);
    FarmLib.getCrop(crops, lessons, progress, caller, id);
  };

  // Marks a lesson complete for the caller; idempotent.
  public shared ({ caller }) func completeLesson(lessonId : Types.LessonId) : async ?Types.CropView {
    requireUser(caller);
    FarmLib.completeLesson(crops, lessons, progress, caller, lessonId);
  };

  // Removes the caller's completion of a lesson; idempotent.
  public shared ({ caller }) func uncompleteLesson(lessonId : Types.LessonId) : async ?Types.CropView {
    requireUser(caller);
    FarmLib.uncompleteLesson(crops, lessons, progress, caller, lessonId);
  };

  // Overall lesson progress across the caller's selected crops.
  public query ({ caller }) func progressSummary() : async Types.ProgressSummary {
    requireUser(caller);
    FarmLib.progressSummary(crops, lessons, progress, caller);
  };

  // Adds a crop to the caller's farm.
  public shared ({ caller }) func addCrop(input : Types.CropInput) : async Types.CropView {
    requireUser(caller);
    FarmLib.addCrop(crops, state, caller, input);
  };
};

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
  activities : Map.Map<Types.ActivityId, Types.Activity>,
  state : { var nextActivityId : Nat },
) {
  // Rejects anonymous and unregistered callers.
  func requireUserActivity(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore AccessControl.getUserRole(accessControlState, caller);
  };

  // Lists the caller's activities, optionally filtered by crop and kind.
  public query ({ caller }) func listActivities(
    cropFilter : ?Types.CropId,
    kindFilter : ?Types.ActivityKind,
  ) : async [Types.ActivityView] {
    requireUserActivity(caller);
    FarmLib.listActivities(activities, crops, caller, cropFilter, kindFilter);
  };

  // Logs a new activity for the caller.
  public shared ({ caller }) func logActivity(input : Types.ActivityInput) : async Types.ActivityView {
    requireUserActivity(caller);
    FarmLib.logActivity(activities, crops, state, caller, input);
  };

  // Edits an owned activity.
  public shared ({ caller }) func updateActivity(id : Types.ActivityId, input : Types.ActivityInput) : async ?Types.ActivityView {
    requireUserActivity(caller);
    FarmLib.updateActivity(activities, crops, caller, id, input);
  };

  // Deletes an owned activity.
  public shared ({ caller }) func deleteActivity(id : Types.ActivityId) : async Bool {
    requireUserActivity(caller);
    FarmLib.deleteActivity(activities, caller, id);
  };

  // Income minus recorded costs per crop and overall.
  public query ({ caller }) func profitSummary() : async Types.ProfitSummary {
    requireUserActivity(caller);
    FarmLib.profitSummary(activities, crops, caller);
  };

  // Home dashboard summary for the caller.
  public query ({ caller }) func dashboardSummary() : async Types.DashboardSummary {
    requireUserActivity(caller);
    FarmLib.dashboardSummary(crops, lessons, progress, activities, caller);
  };
};

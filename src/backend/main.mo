import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import CropsApi "mixins/crops-api";
import ActivityApi "mixins/activity-api";
import ApiDocMixin "mixins/api-doc";
import Types "types/farm";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let crops : Map.Map<Types.CropId, Types.Crop>;
  let lessons : Map.Map<Types.LessonId, Types.Lesson>;
  let progress : Map.Map<(Principal, Types.LessonId), Types.LessonProgress>;
  let activities : Map.Map<Types.ActivityId, Types.Activity>;
  let state : { var nextCropId : Nat; var nextActivityId : Nat };

  include CropsApi(accessControlState, crops, lessons, progress, state);
  include ActivityApi(accessControlState, crops, lessons, progress, activities, state);

  include ApiDocMixin();

  include Expose({
    entities = [
      crops.toEntityManual("crop", "Crop", "id")
        .sample({ id = 0; name = ""; description = ""; photoUrl = "" })
        .payload("id", func c = c.id)
        .payload("name", func c = c.name)
        .payload("description", func c = c.description)
        .payload("photoUrl", func c = c.photoUrl)
        .public_()
        .build(),
      lessons.toEntityManual("lesson", "Lesson", "id")
        .sample({ id = 0; cropId = 0; title = ""; description = ""; videoUrl = ""; order = 0 })
        .payload("id", func l = l.id)
        .payload("cropId", func l = l.cropId)
        .payload("title", func l = l.title)
        .payload("description", func l = l.description)
        .payload("videoUrl", func l = l.videoUrl)
        .payload("order", func l = l.order)
        .edge("cropId", "crop")
        .public_()
        .build(),
      activities.toEntityManual("activity", "Activity", "id")
        .sample({ id = 0; owner = Principal.fromText("aaaaa-aa"); cropId = 0; kind = #harvest; quantity = 0; unit = ""; amount = 0; date = 0; note = null; createdAt = 0 })
        .payload("id", func a = a.id)
        .payload("owner", func a = a.owner)
        .payload("cropId", func a = a.cropId)
        .payload("kind", func a = switch (a.kind) { case (#harvest) "harvest"; case (#sale) "sale"; case (#cost) "cost" })
        .payload("quantity", func a = a.quantity)
        .payload("unit", func a = a.unit)
        .payload("amount", func a = a.amount)
        .payload("date", func a = a.date)
        .payload("note", func a = a.note ?? "")
        .payload("createdAt", func a = a.createdAt)
        .edge("cropId", "crop")
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      progress.toEntityManual("lessonProgress", "LessonProgress", "lessonId")
        .sample({ owner = Principal.fromText("aaaaa-aa"); lessonId = 0; cropId = 0; completedAt = 0 })
        .payload("owner", func p = p.owner)
        .payload("lessonId", func p = p.lessonId)
        .payload("cropId", func p = p.cropId)
        .payload("completedAt", func p = p.completedAt)
        .edge("lessonId", "lesson")
        .edge("cropId", "crop")
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
    ];
  });
};

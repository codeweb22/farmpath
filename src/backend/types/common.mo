module {
  // Cross-cutting identifiers and time units shared across domains.
  public type CropId = Nat;
  public type LessonId = Nat;
  public type ActivityId = Nat;
  public type Timestamp = Int; // nanoseconds since epoch (Time.now())
};

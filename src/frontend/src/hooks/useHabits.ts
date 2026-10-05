/**
 * @deprecated Habit hooks were replaced by the farm domain hooks in
 * `@/hooks/useFarm`. This module is kept only so stale imports resolve; new
 * code must import from `@/hooks/useFarm`.
 */
export {
  farmKeys as habitKeys,
  useCrops as useHabits,
  useCropDetail as useHabitDetail,
  useProgressSummary as useWeeklySummary,
  useAddCrop as useCreateHabit,
  useCompleteLesson as useCheckIn,
  useUncompleteLesson as useUndoCheckIn,
  useToggleLesson as useToggleCheckIn,
} from "@/hooks/useFarm";

import type {
  ActivityInput,
  ActivityKind,
  CropInput,
  CropView,
} from "@/backend";
import { useBackendActor } from "@/lib/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const farmKeys = {
  all: ["farm"] as const,
  crops: () => [...farmKeys.all, "crops"] as const,
  crop: (id: bigint | null) =>
    [...farmKeys.all, "crop", id === null ? "none" : id.toString()] as const,
  progress: () => [...farmKeys.all, "progress"] as const,
  activities: (cropId: bigint | null, kind: ActivityKind | null) =>
    [
      ...farmKeys.all,
      "activities",
      cropId === null ? "all" : cropId.toString(),
      kind ?? "all",
    ] as const,
  profit: () => [...farmKeys.all, "profit"] as const,
  dashboard: () => [...farmKeys.all, "dashboard"] as const,
};

/** All crops on the farm with lesson counts. */
export function useCrops() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: farmKeys.crops(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCrops();
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single crop with its ordered lesson list. */
export function useCropDetail(id: bigint | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: farmKeys.crop(id),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCrop(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/** Overall lesson progress across every crop. */
export function useProgressSummary() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: farmKeys.progress(),
    queryFn: async () => {
      if (!actor) return null;
      return actor.progressSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Activity entries, optionally filtered by crop and kind. */
export function useActivities(
  cropId: bigint | null = null,
  kind: ActivityKind | null = null,
) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: farmKeys.activities(cropId, kind),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActivities(cropId, kind);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Income, cost and profit totals per crop and overall. */
export function useProfitSummary() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: farmKeys.profit(),
    queryFn: async () => {
      if (!actor) return null;
      return actor.profitSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Home dashboard counts and recent activity. */
export function useDashboardSummary() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: farmKeys.dashboard(),
    queryFn: async () => {
      if (!actor) return null;
      return actor.dashboardSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

function useInvalidateFarm() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: farmKeys.all });
  };
}

/** Add a new crop to the farm. */
export function useAddCrop() {
  const { actor } = useBackendActor();
  const invalidate = useInvalidateFarm();
  return useMutation({
    mutationFn: async (input: CropInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addCrop(input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Mark a lesson complete and refresh crop progress. */
export function useCompleteLesson() {
  const { actor } = useBackendActor();
  const invalidate = useInvalidateFarm();
  return useMutation({
    mutationFn: async (lessonId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.completeLesson(lessonId);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Revert a completed lesson. */
export function useUncompleteLesson() {
  const { actor } = useBackendActor();
  const invalidate = useInvalidateFarm();
  return useMutation({
    mutationFn: async (lessonId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.uncompleteLesson(lessonId);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Record a harvest, sale or cost entry. */
export function useLogActivity() {
  const { actor } = useBackendActor();
  const invalidate = useInvalidateFarm();
  return useMutation({
    mutationFn: async (input: ActivityInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.logActivity(input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Edit an existing activity entry. */
export function useUpdateActivity() {
  const { actor } = useBackendActor();
  const invalidate = useInvalidateFarm();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: ActivityInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateActivity(id, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Delete an activity entry. */
export function useDeleteActivity() {
  const { actor } = useBackendActor();
  const invalidate = useInvalidateFarm();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteActivity(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Convenience: toggle a lesson's completion state. */
export function useToggleLesson() {
  const complete = useCompleteLesson();
  const uncomplete = useUncompleteLesson();
  const isPending = complete.isPending || uncomplete.isPending;

  const toggle = (lessonId: bigint, completed: boolean) => {
    if (completed) {
      uncomplete.mutate(lessonId);
    } else {
      complete.mutate(lessonId);
    }
  };

  return { toggle, isPending };
}

/** Convenience: find a crop by id from the cached crop list. */
export function findCrop(
  crops: CropView[] | undefined,
  id: bigint,
): CropView | undefined {
  return crops?.find((crop) => crop.id === id);
}

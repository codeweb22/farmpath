import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Shared actor accessor. Call at hook top level only — never inside a query or
 * mutation callback.
 */
export function useBackendActor() {
  return useActor(createActor);
}

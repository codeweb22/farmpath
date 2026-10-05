import { Lesson } from "@/pages/Lesson";
import type { CropDetail, CropView, LessonView } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockActor, renderWithRouter } from "./test-utils";

const actorRef = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    isAuthenticated: true,
    isInitializing: false,
  }),
}));

vi.mock("@/lib/backend", () => ({
  useBackendActor: () => ({ actor: actorRef.current, isFetching: false }),
}));

const CROP: CropView = {
  id: 0n,
  name: "Bell Pepper",
  description: "Sweet blocky peppers",
  photoUrl: "/pepper.jpg",
  lessonCount: 2n,
  completedCount: 0n,
};

const LESSON: LessonView = {
  id: 0n,
  cropId: 0n,
  title: "Choosing a spot",
  description: "Pick a sunny bed with well-drained soil.",
  videoUrl: "https://www.youtube.com/embed/1",
  order: 0n,
  completed: false,
};

/**
 * A stateful actor whose `getCrop` reflects whatever `completeLesson` /
 * `uncompleteLesson` last recorded, so a refetch after the mutation returns the
 * updated progress exactly as the real canister would.
 */
function statefulActor(initiallyCompleted: boolean) {
  let completed = initiallyCompleted;
  const detail = (): CropDetail => ({
    crop: { ...CROP, completedCount: completed ? 1n : 0n },
    lessons: [{ ...LESSON, completed }],
  });
  return createMockActor({
    listCrops: vi.fn().mockResolvedValue([CROP]),
    getCrop: vi.fn().mockImplementation(async () => detail()),
    completeLesson: vi.fn().mockImplementation(async () => {
      completed = true;
      return { ...CROP, completedCount: 1n };
    }),
    uncompleteLesson: vi.fn().mockImplementation(async () => {
      completed = false;
      return { ...CROP, completedCount: 0n };
    }),
  });
}

beforeEach(() => {
  actorRef.current = statefulActor(false);
});

describe("Lesson", () => {
  it("shows the lesson content and marks it complete", async () => {
    const user = userEvent.setup();
    const actor = statefulActor(false);
    actorRef.current = actor;

    await renderWithRouter(
      [{ path: "/lessons/$id", component: () => <Lesson /> }],
      "/lessons/0",
    );

    // Content renders with the step label and the Mark complete action.
    expect(await screen.findByTestId("lesson.content")).toBeInTheDocument();
    expect(screen.getByText("Choosing a spot")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    const toggle = screen.getByTestId("lesson.toggle_button");
    expect(toggle).toHaveTextContent("Mark complete");

    await user.click(toggle);

    await waitFor(() => {
      expect(actor.completeLesson).toHaveBeenCalledWith(0n);
    });

    // After the mutation invalidates the crop query, the refetched detail shows
    // the lesson as complete and the action flips to the revert label.
    await waitFor(() => {
      expect(screen.getByTestId("lesson.toggle_button")).toHaveTextContent(
        "Mark as not complete",
      );
    });
  });

  it("reverts a completed lesson", async () => {
    const user = userEvent.setup();
    const actor = statefulActor(true);
    actorRef.current = actor;

    await renderWithRouter(
      [{ path: "/lessons/$id", component: () => <Lesson /> }],
      "/lessons/0",
    );

    const toggle = await screen.findByTestId("lesson.toggle_button");
    expect(toggle).toHaveTextContent("Mark as not complete");

    await user.click(toggle);

    await waitFor(() => {
      expect(actor.uncompleteLesson).toHaveBeenCalledWith(0n);
    });
    await waitFor(() => {
      expect(screen.getByTestId("lesson.toggle_button")).toHaveTextContent(
        "Mark complete",
      );
    });
  });

  it("shows a not-found state for an unknown lesson id", async () => {
    await renderWithRouter(
      [{ path: "/lessons/$id", component: () => <Lesson /> }],
      "/lessons/999",
    );

    expect(await screen.findByTestId("lesson.error_state")).toBeInTheDocument();
    expect(screen.getByText("Lesson not found")).toBeInTheDocument();
  });
});

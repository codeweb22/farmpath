import { CropDetail } from "@/pages/CropDetail";
import type {
  CropDetail as CropDetailType,
  CropView,
  LessonView,
} from "@/types";
import { screen, within } from "@testing-library/react";
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
  completedCount: 1n,
};

const LESSONS: LessonView[] = [
  {
    id: 0n,
    cropId: 0n,
    title: "Choosing a spot",
    description: "Pick a sunny bed with well-drained soil.",
    videoUrl: "https://www.youtube.com/embed/1",
    order: 0n,
    completed: true,
  },
  {
    id: 1n,
    cropId: 0n,
    title: "Planting seedlings",
    description: "Transplant after the last frost.",
    videoUrl: "https://www.youtube.com/embed/2",
    order: 1n,
    completed: false,
  },
];

beforeEach(() => {
  const detail: CropDetailType = { crop: CROP, lessons: LESSONS };
  actorRef.current = createMockActor({
    getCrop: vi.fn().mockResolvedValue(detail),
  });
});

describe("CropDetail", () => {
  it("lists the crop's lessons with a per-lesson progress indicator", async () => {
    await renderWithRouter(
      [{ path: "/crops/$id", component: () => <CropDetail /> }],
      "/crops/0",
    );

    const header = await screen.findByTestId("crop.header");
    expect(within(header).getByText("Bell Pepper")).toBeInTheDocument();
    // 1 of 2 lessons complete rounds to 50%.
    expect(within(header).getByText("50%")).toBeInTheDocument();
    expect(
      within(header).getByText("1 of 2 lessons complete"),
    ).toBeInTheDocument();

    const list = screen.getByTestId("crop.lesson_list");
    const first = within(list).getByTestId("crop.lesson_item.1");
    expect(within(first).getByText("Choosing a spot")).toBeInTheDocument();
    expect(first).toHaveAttribute("href", "/lessons/0");

    const second = within(list).getByTestId("crop.lesson_item.2");
    expect(within(second).getByText("Planting seedlings")).toBeInTheDocument();
    expect(second).toHaveAttribute("href", "/lessons/1");
  });

  it("shows a not-found state for an unknown crop id", async () => {
    actorRef.current = createMockActor({
      getCrop: vi.fn().mockResolvedValue(null),
    });

    await renderWithRouter(
      [{ path: "/crops/$id", component: () => <CropDetail /> }],
      "/crops/999",
    );

    expect(await screen.findByTestId("crop.error_state")).toBeInTheDocument();
    expect(screen.getByText("Crop not found")).toBeInTheDocument();
  });
});

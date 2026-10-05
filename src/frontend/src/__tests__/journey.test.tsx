import { Journey } from "@/pages/Journey";
import type { CropView, ProgressSummary } from "@/types";
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

const BELL: CropView = {
  id: 0n,
  name: "Bell Pepper",
  description: "Sweet blocky peppers",
  photoUrl: "/pepper.jpg",
  lessonCount: 4n,
  completedCount: 2n,
};

const CHILI: CropView = {
  id: 1n,
  name: "Chili Pepper",
  description: "Compact and fiery",
  photoUrl: "/chili.jpg",
  lessonCount: 3n,
  completedCount: 3n,
};

function progress(overrides: Partial<ProgressSummary> = {}): ProgressSummary {
  return {
    totalLessons: 7n,
    completedLessons: 5n,
    crops: [BELL, CHILI],
    ...overrides,
  };
}

beforeEach(() => {
  actorRef.current = createMockActor({
    progressSummary: vi.fn().mockResolvedValue(progress()),
    listCrops: vi.fn().mockResolvedValue([BELL, CHILI]),
  });
});

describe("Journey", () => {
  it("summarizes completed lessons and overall progress", async () => {
    await renderWithRouter(
      [{ path: "/journey", component: () => <Journey /> }],
      "/journey",
    );

    const card = await screen.findByTestId("journey.progress_card");
    // 5 of 7 lessons complete rounds to 71%.
    expect(within(card).getByText("5 of 7 lessons")).toBeInTheDocument();
    expect(within(card).getByText("71%")).toBeInTheDocument();
    expect(
      within(card).getByText("2 lessons left to finish."),
    ).toBeInTheDocument();
  });

  it("shows per-crop progress with a completion indicator", async () => {
    await renderWithRouter(
      [{ path: "/journey", component: () => <Journey /> }],
      "/journey",
    );

    const list = await screen.findByTestId("journey.crop_list");
    const bell = within(list).getByTestId("journey.crop_item.1");
    expect(within(bell).getByText("Bell Pepper")).toBeInTheDocument();
    expect(within(bell).getByText("50%")).toBeInTheDocument();
    expect(
      within(bell).getByText("2 of 4 lessons complete"),
    ).toBeInTheDocument();

    const chili = within(list).getByTestId("journey.crop_item.2");
    expect(within(chili).getByText("100%")).toBeInTheDocument();
    expect(
      within(chili).getByText("3 of 3 lessons complete"),
    ).toBeInTheDocument();
  });

  it("shows an empty state before any crop is chosen", async () => {
    actorRef.current = createMockActor({
      progressSummary: vi
        .fn()
        .mockResolvedValue(
          progress({ totalLessons: 0n, completedLessons: 0n, crops: [] }),
        ),
      listCrops: vi.fn().mockResolvedValue([]),
    });

    await renderWithRouter(
      [{ path: "/journey", component: () => <Journey /> }],
      "/journey",
    );

    expect(
      await screen.findByTestId("journey.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("journey.choose_crop_button")).toHaveAttribute(
      "href",
      "/crops",
    );
  });
});

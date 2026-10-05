import { Dashboard } from "@/pages/Dashboard";
import type { ActivityView, CropView } from "@/types";
import { ActivityKind } from "@/types";
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
  lessonCount: 4n,
  completedCount: 1n,
};

const ACTIVITY: ActivityView = {
  id: 7n,
  date: 20_000n,
  kind: ActivityKind.harvest,
  note: undefined,
  createdAt: 20_000n,
  unit: "kg",
  cropId: 0n,
  quantity: 12n,
  cropName: "Bell Pepper",
  amount: 0n,
};

function mockActor(overrides: Parameters<typeof createMockActor>[0]) {
  actorRef.current = createMockActor(overrides);
}

beforeEach(() => {
  mockActor({
    listCrops: vi.fn().mockResolvedValue([]),
    dashboardSummary: vi.fn().mockResolvedValue({
      hasData: false,
      recentActivity: [],
      activeCrops: 0n,
      upcomingTasks: 0n,
    }),
    progressSummary: vi.fn().mockResolvedValue({
      totalLessons: 0n,
      completedLessons: 0n,
      crops: [],
    }),
  });
});

describe("Dashboard", () => {
  it("prompts the user to add their first crop when the farm is empty", async () => {
    await renderWithRouter(
      [{ path: "/", component: () => <Dashboard /> }],
      "/",
    );

    expect(
      await screen.findByTestId("dashboard.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Start your first crop")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard.add_crop_button")).toHaveAttribute(
      "href",
      "/crops",
    );
  });

  it("shows the greeting, farm summary cards and quick actions once a crop exists", async () => {
    mockActor({
      listCrops: vi.fn().mockResolvedValue([CROP]),
      dashboardSummary: vi.fn().mockResolvedValue({
        hasData: true,
        recentActivity: [ACTIVITY],
        activeCrops: 1n,
        upcomingTasks: 3n,
      }),
      progressSummary: vi.fn().mockResolvedValue({
        totalLessons: 4n,
        completedLessons: 1n,
        crops: [CROP],
      }),
    });

    await renderWithRouter(
      [{ path: "/", component: () => <Dashboard /> }],
      "/",
    );

    expect(await screen.findByTestId("dashboard.greeting")).toBeInTheDocument();
    expect(screen.getByText("Pepper Farmer")).toBeInTheDocument();

    // Summary cards reflect the backend counts.
    expect(screen.getByTestId("dashboard.active_crops_card")).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId("dashboard.upcoming_tasks_card"),
    ).toHaveTextContent("3");
    expect(screen.getByTestId("dashboard.lessons_card")).toHaveTextContent(
      "1/4",
    );
    expect(screen.getByTestId("dashboard.harvest_card")).toHaveTextContent(
      "12 kg",
    );

    // Quick-action tiles link to the three destinations.
    expect(screen.getByTestId("dashboard.crops_tile")).toHaveAttribute(
      "href",
      "/crops",
    );
    expect(screen.getByTestId("dashboard.lessons_tile")).toHaveAttribute(
      "href",
      "/journey",
    );
    expect(screen.getByTestId("dashboard.activity_tile")).toHaveAttribute(
      "href",
      "/activity",
    );

    // Recent activity is listed.
    const activityList = screen.getByTestId("dashboard.activity_list");
    expect(within(activityList).getByText("Bell Pepper")).toBeInTheDocument();
    expect(within(activityList).getByText("12 kg")).toBeInTheDocument();
  });

  it("shows the recent-activity empty state when nothing has been logged", async () => {
    mockActor({
      listCrops: vi.fn().mockResolvedValue([CROP]),
      dashboardSummary: vi.fn().mockResolvedValue({
        hasData: true,
        recentActivity: [],
        activeCrops: 1n,
        upcomingTasks: 3n,
      }),
      progressSummary: vi.fn().mockResolvedValue({
        totalLessons: 4n,
        completedLessons: 1n,
        crops: [CROP],
      }),
    });

    await renderWithRouter(
      [{ path: "/", component: () => <Dashboard /> }],
      "/",
    );

    expect(
      await screen.findByTestId("dashboard.activity_empty_state"),
    ).toBeInTheDocument();
  });
});

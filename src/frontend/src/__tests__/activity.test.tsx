import { Activity } from "@/pages/Activity";
import type { ActivityView, CropView } from "@/types";
import { ActivityKind } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
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

const BELL: CropView = {
  id: 0n,
  name: "Bell Pepper",
  description: "Sweet blocky peppers",
  photoUrl: "/pepper.jpg",
  lessonCount: 4n,
  completedCount: 1n,
};

const CHILI: CropView = {
  id: 1n,
  name: "Chili Pepper",
  description: "Compact and fiery",
  photoUrl: "/chili.jpg",
  lessonCount: 3n,
  completedCount: 0n,
};

const HARVEST: ActivityView = {
  id: 10n,
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

const SALE: ActivityView = {
  id: 11n,
  date: 20_001n,
  kind: ActivityKind.sale,
  note: "market day",
  createdAt: 20_001n,
  unit: "kg",
  cropId: 1n,
  quantity: 5n,
  cropName: "Chili Pepper",
  amount: 90n,
};

const ALL = [HARVEST, SALE];

/**
 * A stateful actor whose `listActivities` applies the same crop/kind filters the
 * real canister does, so the rendered list reflects the active filter.
 */
function filteredActor() {
  const listActivities = vi
    .fn()
    .mockImplementation(
      async (cropId: bigint | null, kind: ActivityKind | null) =>
        ALL.filter(
          (entry) =>
            (cropId === null || entry.cropId === cropId) &&
            (kind === null || entry.kind === kind),
        ),
    );
  return createMockActor({
    listCrops: vi.fn().mockResolvedValue([BELL, CHILI]),
    listActivities,
    deleteActivity: vi.fn().mockResolvedValue(true),
    updateActivity: vi.fn().mockResolvedValue(SALE),
  });
}

beforeEach(() => {
  actorRef.current = filteredActor();
});

describe("Activity", () => {
  it("lists every entry and filters by activity type", async () => {
    const user = userEvent.setup();
    const actor = filteredActor();
    actorRef.current = actor;

    await renderWithRouter(
      [{ path: "/activity", component: () => <Activity /> }],
      "/activity",
    );

    const list = await screen.findByTestId("activity.list");
    expect(within(list).getByText("Bell Pepper")).toBeInTheDocument();
    expect(within(list).getByText("Chili Pepper")).toBeInTheDocument();

    await user.click(screen.getByTestId("activity.kind_filter.sale"));

    await waitFor(() => {
      expect(actor.listActivities).toHaveBeenLastCalledWith(null, "sale");
    });
    await waitFor(() => {
      const filtered = screen.getByTestId("activity.list");
      expect(
        within(filtered).queryByText("Bell Pepper"),
      ).not.toBeInTheDocument();
      expect(within(filtered).getByText("Chili Pepper")).toBeInTheDocument();
    });
  });

  it("filters by crop", async () => {
    const user = userEvent.setup();
    const actor = filteredActor();
    actorRef.current = actor;

    await renderWithRouter(
      [{ path: "/activity", component: () => <Activity /> }],
      "/activity",
    );

    await screen.findByTestId("activity.list");
    await user.click(screen.getByTestId("activity.crop_filter.0"));

    await waitFor(() => {
      expect(actor.listActivities).toHaveBeenLastCalledWith(0n, null);
    });
    await waitFor(() => {
      const filtered = screen.getByTestId("activity.list");
      expect(within(filtered).getByText("Bell Pepper")).toBeInTheDocument();
      expect(
        within(filtered).queryByText("Chili Pepper"),
      ).not.toBeInTheDocument();
    });
  });

  it("deletes an entry after confirmation", async () => {
    const user = userEvent.setup();
    const actor = filteredActor();
    actorRef.current = actor;

    await renderWithRouter(
      [{ path: "/activity", component: () => <Activity /> }],
      "/activity",
    );

    await screen.findByTestId("activity.list");
    await user.click(screen.getByTestId("activity.delete_button.1"));

    const dialog = await screen.findByTestId("activity.delete_dialog");
    await user.click(
      within(dialog).getByTestId("activity.delete_confirm_button"),
    );

    await waitFor(() => {
      expect(actor.deleteActivity).toHaveBeenCalledWith(10n);
    });
  });

  it("opens the edit form pre-filled and saves changes", async () => {
    const user = userEvent.setup();
    const actor = filteredActor();
    actorRef.current = actor;

    await renderWithRouter(
      [{ path: "/activity", component: () => <Activity /> }],
      "/activity",
    );

    await screen.findByTestId("activity.list");
    await user.click(screen.getByTestId("activity.edit_button.1"));

    const modal = await screen.findByTestId("activity.modal");
    // The form is seeded from the entry being edited.
    expect(within(modal).getByTestId("activity.quantity_input")).toHaveValue(
      12,
    );
    expect(within(modal).getByText("Edit entry")).toBeInTheDocument();

    const quantity = within(modal).getByTestId("activity.quantity_input");
    await user.clear(quantity);
    await user.type(quantity, "20");
    await user.click(within(modal).getByTestId("activity.save_button"));

    await waitFor(() => {
      expect(actor.updateActivity).toHaveBeenCalledWith(
        10n,
        expect.objectContaining({ quantity: 20n, cropId: 0n }),
      );
    });
  });

  it("prompts the user to add a crop when none exist", async () => {
    actorRef.current = createMockActor({
      listCrops: vi.fn().mockResolvedValue([]),
      listActivities: vi.fn().mockResolvedValue([]),
    });

    await renderWithRouter(
      [{ path: "/activity", component: () => <Activity /> }],
      "/activity",
    );

    expect(
      await screen.findByTestId("activity.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("activity.add_crop_button")).toHaveAttribute(
      "href",
      "/crops",
    );
  });
});

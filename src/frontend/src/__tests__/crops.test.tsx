import { Crops } from "@/pages/Crops";
import type { CropView } from "@/types";
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

const NEW_CROP: CropView = {
  id: 3n,
  name: "Habanero",
  description: "Fiery orange pepper",
  photoUrl: "/assets/images/placeholder.svg",
  lessonCount: 0n,
  completedCount: 0n,
};

beforeEach(() => {
  actorRef.current = createMockActor({
    listCrops: vi.fn().mockResolvedValue([]),
  });
});

describe("Crops", () => {
  it("shows an empty state when no crops exist", async () => {
    await renderWithRouter(
      [{ path: "/crops", component: () => <Crops /> }],
      "/crops",
    );

    expect(await screen.findByTestId("crops.empty_state")).toBeInTheDocument();
    expect(screen.getByText("No crops yet")).toBeInTheDocument();
  });

  it("adds a crop through the dialog and shows it in the list", async () => {
    const user = userEvent.setup();
    const listCrops = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValue([NEW_CROP]);
    const addCrop = vi.fn().mockResolvedValue(NEW_CROP);
    actorRef.current = createMockActor({ listCrops, addCrop });

    await renderWithRouter(
      [{ path: "/crops", component: () => <Crops /> }],
      "/crops",
    );

    await user.click(await screen.findByTestId("crops.add_button"));

    const modal = await screen.findByTestId("crops.modal");
    await user.type(within(modal).getByTestId("crops.name_input"), "Habanero");
    await user.type(
      within(modal).getByTestId("crops.description_input"),
      "Fiery orange pepper",
    );
    await user.click(within(modal).getByTestId("crops.submit_button"));

    await waitFor(() => {
      expect(addCrop).toHaveBeenCalledWith({
        name: "Habanero",
        description: "Fiery orange pepper",
        photoUrl: "/assets/images/placeholder.svg",
      });
    });

    // The mutation invalidates the crop query, which refetches the new list.
    const list = await screen.findByTestId("crops.list");
    expect(within(list).getByText("Habanero")).toBeInTheDocument();
    expect(within(list).getByText("Fiery orange pepper")).toBeInTheDocument();
  });

  it("keeps the submit button disabled until a name is entered", async () => {
    const user = userEvent.setup();
    await renderWithRouter(
      [{ path: "/crops", component: () => <Crops /> }],
      "/crops",
    );

    await user.click(await screen.findByTestId("crops.add_button"));
    const modal = await screen.findByTestId("crops.modal");
    const submit = within(modal).getByTestId("crops.submit_button");
    expect(submit).toBeDisabled();

    await user.type(within(modal).getByTestId("crops.name_input"), "Aji");
    expect(submit).toBeEnabled();
  });
});

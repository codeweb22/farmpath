import { Profit } from "@/pages/Profit";
import type { CropProfit, ProfitSummary } from "@/types";
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

const BELL: CropProfit = {
  cropId: 0n,
  cropName: "Bell Pepper",
  income: 240n,
  cost: 40n,
  profit: 200n,
};

const CHILI: CropProfit = {
  cropId: 1n,
  cropName: "Chili Pepper",
  income: 0n,
  cost: 60n,
  profit: -60n,
};

function summary(overrides: Partial<ProfitSummary> = {}): ProfitSummary {
  return {
    totalIncome: 240n,
    totalCost: 100n,
    totalProfit: 140n,
    byCrop: [BELL, CHILI],
    ...overrides,
  };
}

beforeEach(() => {
  actorRef.current = createMockActor({
    profitSummary: vi.fn().mockResolvedValue(summary()),
  });
});

describe("Profit", () => {
  it("shows the net total computed as income minus costs", async () => {
    await renderWithRouter(
      [{ path: "/profit", component: () => <Profit /> }],
      "/profit",
    );

    const card = await screen.findByTestId("profit.summary_card");
    // 240 income − 100 costs = 140 net.
    expect(within(card).getByText("+$140")).toBeInTheDocument();
    expect(within(card).getByText("$240")).toBeInTheDocument();
    expect(within(card).getByText("$100")).toBeInTheDocument();
  });

  it("breaks profit down per crop, including a loss", async () => {
    await renderWithRouter(
      [{ path: "/profit", component: () => <Profit /> }],
      "/profit",
    );

    const list = await screen.findByTestId("profit.crop_list");
    const bell = within(list).getByTestId("profit.crop_item.1");
    expect(within(bell).getByText("Bell Pepper")).toBeInTheDocument();
    expect(within(bell).getByText("+$200")).toBeInTheDocument();

    const chili = within(list).getByTestId("profit.crop_item.2");
    expect(within(chili).getByText("Chili Pepper")).toBeInTheDocument();
    // A crop whose costs exceed its income shows a negative profit.
    expect(within(chili).getByText("−$60")).toBeInTheDocument();
  });

  it("shows an empty state when no profit data exists", async () => {
    actorRef.current = createMockActor({
      profitSummary: vi.fn().mockResolvedValue(
        summary({
          totalIncome: 0n,
          totalCost: 0n,
          totalProfit: 0n,
          byCrop: [],
        }),
      ),
    });

    await renderWithRouter(
      [{ path: "/profit", component: () => <Profit /> }],
      "/profit",
    );

    expect(await screen.findByTestId("profit.empty_state")).toBeInTheDocument();
    expect(screen.getByTestId("profit.log_activity_button")).toHaveAttribute(
      "href",
      "/activity",
    );
  });
});

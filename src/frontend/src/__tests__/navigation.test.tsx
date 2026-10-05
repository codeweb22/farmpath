import { BottomNav } from "@/components/BottomNav";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithRouter } from "./test-utils";

describe("BottomNav", () => {
  it("renders the five primary destinations", async () => {
    await renderWithRouter(
      [{ path: "/", component: () => <BottomNav /> }],
      "/",
    );

    const nav = screen.getByTestId("nav.bottom");
    expect(nav).toHaveAttribute("aria-label", "Primary");
    for (const tab of ["home", "journey", "farm", "market", "more"]) {
      expect(screen.getByTestId(`nav.${tab}.tab`)).toBeInTheDocument();
    }
  });

  it("marks the tab matching the current route as active", async () => {
    await renderWithRouter(
      [{ path: "/journey", component: () => <BottomNav /> }],
      "/journey",
    );

    expect(screen.getByTestId("nav.journey.tab")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByTestId("nav.home.tab")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps the farm tab active on a nested crop route", async () => {
    await renderWithRouter(
      [{ path: "/crops/$id", component: () => <BottomNav /> }],
      "/crops/0",
    );

    expect(screen.getByTestId("nav.farm.tab")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});

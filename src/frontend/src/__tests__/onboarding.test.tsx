import { Onboarding } from "@/pages/Onboarding";
import { SignIn } from "@/pages/SignIn";
import { ONBOARDING_STEPS } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  renderWithRouter,
  signedInIdentity,
  signedOutIdentity,
} from "./test-utils";

const identity = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => identity.current,
}));

beforeEach(() => {
  identity.current = signedOutIdentity();
});

describe("Onboarding carousel", () => {
  it("advances through every step and reaches the sign-in screen", async () => {
    const user = userEvent.setup();
    const { router } = await renderWithRouter(
      [
        { path: "/", component: () => <Onboarding /> },
        { path: "/signin", component: () => <SignIn /> },
      ],
      "/",
    );

    // Step 1 is shown first.
    expect(screen.getByText(ONBOARDING_STEPS[0].title)).toBeInTheDocument();
    expect(screen.getByTestId("onboarding.next_button")).toBeInTheDocument();

    // Advance through the middle steps.
    for (let index = 1; index < ONBOARDING_STEPS.length; index += 1) {
      await user.click(screen.getByTestId("onboarding.next_button"));
      expect(
        screen.getByText(ONBOARDING_STEPS[index].title),
      ).toBeInTheDocument();
    }

    // The last step offers Get Started, which routes to sign-in.
    const getStarted = screen.getByTestId("onboarding.get_started_button");
    expect(getStarted).toBeInTheDocument();
    await user.click(getStarted);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/signin");
    });
    expect(screen.getByTestId("signin.submit_button")).toBeInTheDocument();
  });

  it("jumps directly to a step via its dot", async () => {
    const user = userEvent.setup();
    await renderWithRouter(
      [{ path: "/", component: () => <Onboarding /> }],
      "/",
    );

    await user.click(screen.getByTestId("onboarding.dot.3"));
    expect(screen.getByText(ONBOARDING_STEPS[2].title)).toBeInTheDocument();
    expect(
      screen.getByTestId("onboarding.get_started_button"),
    ).toBeInTheDocument();
  });

  it("sends an already signed-in visitor straight to the dashboard from Get Started", async () => {
    identity.current = signedInIdentity();
    const user = userEvent.setup();
    const { router } = await renderWithRouter(
      [
        { path: "/", component: () => <Onboarding /> },
        { path: "/signin", component: () => <SignIn /> },
      ],
      "/",
    );

    await user.click(screen.getByTestId("onboarding.dot.3"));
    await user.click(screen.getByTestId("onboarding.get_started_button"));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
  });
});

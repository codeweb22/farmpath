import { Profile } from "@/pages/Profile";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithRouter, signedInIdentity } from "./test-utils";

const identity = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => identity.current,
}));

const PRINCIPAL = "2vxsx-fae-2vxsx-fae-2vxsx-fae-2vxsx-fae-2vxsx-fae";

beforeEach(() => {
  identity.current = signedInIdentity({
    identity: {
      getPrincipal: () => ({ toText: () => PRINCIPAL }),
    },
  } as never);
});

describe("Profile", () => {
  it("shows the signed-in principal", async () => {
    await renderWithRouter(
      [{ path: "/profile", component: () => <Profile /> }],
      "/profile",
    );

    expect(await screen.findByTestId("profile.card")).toBeInTheDocument();
    expect(
      screen.getByText("Signed in with Internet Identity"),
    ).toBeInTheDocument();
    // The principal is shortened for display but kept in the title attribute.
    expect(screen.getByTestId("profile.principal")).toHaveAttribute(
      "title",
      PRINCIPAL,
    );
  });

  it("signs the user out and returns to the welcome route", async () => {
    const user = userEvent.setup();
    const clear = vi.fn();
    identity.current = signedInIdentity({
      clear,
      identity: {
        getPrincipal: () => ({ toText: () => PRINCIPAL }),
      },
    } as never);

    const { router } = await renderWithRouter(
      [
        { path: "/profile", component: () => <Profile /> },
        { path: "/", component: () => <p>welcome</p> },
      ],
      "/profile",
    );

    await user.click(await screen.findByTestId("profile.signout_button"));

    expect(clear).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
  });
});

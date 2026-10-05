import { RequireAuth } from "@/components/RequireAuth";
import { Dashboard } from "@/pages/Dashboard";
import { SignIn } from "@/pages/SignIn";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockActor,
  initializingIdentity,
  renderWithRouter,
  signedInIdentity,
  signedOutIdentity,
} from "./test-utils";

const identity = vi.hoisted(() => ({ current: undefined as unknown }));
const actorRef = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => identity.current,
}));

vi.mock("@/lib/backend", () => ({
  useBackendActor: () => ({ actor: actorRef.current, isFetching: false }),
}));

beforeEach(() => {
  identity.current = signedOutIdentity();
  actorRef.current = createMockActor({
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

describe("RequireAuth", () => {
  it("shows a restoring state while the stored identity is being loaded", async () => {
    identity.current = initializingIdentity();
    await renderWithRouter(
      [
        {
          path: "/",
          component: () => (
            <RequireAuth>
              <p>secret dashboard</p>
            </RequireAuth>
          ),
        },
        { path: "/signin", component: () => <SignIn /> },
      ],
      "/",
    );

    expect(screen.getByTestId("auth.loading_state")).toBeInTheDocument();
    expect(screen.queryByText("secret dashboard")).not.toBeInTheDocument();
  });

  it("redirects a signed-out visitor to the sign-in screen", async () => {
    identity.current = signedOutIdentity();
    const { router } = await renderWithRouter(
      [
        {
          path: "/",
          component: () => (
            <RequireAuth>
              <p>secret dashboard</p>
            </RequireAuth>
          ),
        },
        { path: "/signin", component: () => <SignIn /> },
      ],
      "/",
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/signin");
    });
    expect(screen.queryByText("secret dashboard")).not.toBeInTheDocument();
    expect(screen.getByTestId("signin.submit_button")).toBeInTheDocument();
  });

  it("renders protected content for a signed-in visitor", async () => {
    identity.current = signedInIdentity();
    await renderWithRouter(
      [
        {
          path: "/",
          component: () => (
            <RequireAuth>
              <p>secret dashboard</p>
            </RequireAuth>
          ),
        },
        { path: "/signin", component: () => <SignIn /> },
      ],
      "/",
    );

    expect(screen.getByText("secret dashboard")).toBeInTheDocument();
  });

  it("keeps a signed-in visitor on the dashboard after a refresh", async () => {
    // A refresh re-mounts the app with a restored identity; the guard must let
    // the dashboard render rather than bounce to sign-in.
    identity.current = signedInIdentity();
    await renderWithRouter(
      [
        {
          path: "/",
          component: () => (
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          ),
        },
        { path: "/signin", component: () => <SignIn /> },
      ],
      "/",
    );

    expect(
      await screen.findByTestId("dashboard.empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("signin.submit_button"),
    ).not.toBeInTheDocument();
  });
});

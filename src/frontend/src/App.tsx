import { RequireAuth } from "@/components/RequireAuth";
import { Activity } from "@/pages/Activity";
import { CropDetail } from "@/pages/CropDetail";
import { Crops } from "@/pages/Crops";
import { Dashboard } from "@/pages/Dashboard";
import { Farm } from "@/pages/Farm";
import { Journey } from "@/pages/Journey";
import { Lesson } from "@/pages/Lesson";
import { Market } from "@/pages/Market";
import { Onboarding } from "@/pages/Onboarding";
import { Profile } from "@/pages/Profile";
import { Profit } from "@/pages/Profit";
import { SignIn } from "@/pages/SignIn";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

/** Landing route: onboarding for visitors, dashboard for signed-in farmers. */
function HomeRoute() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div
        data-ocid="app.loading_state"
        className="flex min-h-dvh items-center justify-center bg-background"
      >
        <p className="text-sm text-muted-foreground">Loading FarmPath…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Onboarding />;
  }

  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRoute,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signin",
  component: SignIn,
});

const cropsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crops",
  component: () => (
    <RequireAuth>
      <Crops />
    </RequireAuth>
  ),
});

const cropDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crops/$id",
  component: () => (
    <RequireAuth>
      <CropDetail />
    </RequireAuth>
  ),
});

const lessonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lessons/$id",
  component: () => (
    <RequireAuth>
      <Lesson />
    </RequireAuth>
  ),
});

const journeyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/journey",
  component: () => (
    <RequireAuth>
      <Journey />
    </RequireAuth>
  ),
});

const farmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/farm",
  component: () => (
    <RequireAuth>
      <Farm />
    </RequireAuth>
  ),
});

const marketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/market",
  component: () => (
    <RequireAuth>
      <Market />
    </RequireAuth>
  ),
});

const activityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/activity",
  component: () => (
    <RequireAuth>
      <Activity />
    </RequireAuth>
  ),
});

const profitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profit",
  component: () => (
    <RequireAuth>
      <Profit />
    </RequireAuth>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  ),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  signInRoute,
  cropsRoute,
  cropDetailRoute,
  lessonRoute,
  journeyRoute,
  farmRoute,
  marketRoute,
  activityRoute,
  profitRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

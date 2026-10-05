import type { backendInterface } from "@/backend";
import type { InternetIdentityContext } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";

/**
 * A typed stand-in for the generated `Backend` actor. Every method is a
 * `vi.fn()` so tests can assert the exact call the UI made, and the object is
 * typed against the app's own `backendInterface` so a renamed or re-shaped
 * method fails the type-check rather than silently passing.
 */
export type MockActor = {
  [K in keyof backendInterface]: ReturnType<typeof vi.fn>;
};

export function createMockActor(overrides: Partial<MockActor> = {}): MockActor {
  const base: MockActor = {
    _initialize_access_control: vi.fn().mockResolvedValue(undefined),
    _internet_identity_sign_in_finish: vi
      .fn()
      .mockResolvedValue({ __kind__: "ok", ok: null }),
    _internet_identity_sign_in_start: vi
      .fn()
      .mockResolvedValue(new Uint8Array()),
    addCrop: vi.fn(),
    assignCallerUserRole: vi.fn().mockResolvedValue(undefined),
    completeLesson: vi.fn(),
    dashboardSummary: vi.fn(),
    deleteActivity: vi.fn(),
    execute: vi.fn(),
    getApiDoc: vi.fn().mockResolvedValue(""),
    getCallerUserRole: vi.fn(),
    getCrop: vi.fn(),
    isCallerAdmin: vi.fn().mockResolvedValue(false),
    listActivities: vi.fn(),
    listCrops: vi.fn(),
    logActivity: vi.fn(),
    profitSummary: vi.fn(),
    progressSummary: vi.fn(),
    schema: vi.fn().mockResolvedValue(""),
    uncompleteLesson: vi.fn(),
    updateActivity: vi.fn(),
  };
  return { ...base, ...overrides };
}

/** A fully-populated Internet Identity context for signed-in tests. */
export function signedInIdentity(
  overrides: Partial<InternetIdentityContext> = {},
): InternetIdentityContext {
  return {
    identity: undefined,
    login: vi.fn(),
    clear: vi.fn(),
    loginStatus: "idle",
    isInitializing: false,
    isLoginIdle: true,
    isLoggingIn: false,
    isLoginSuccess: false,
    isLoginError: false,
    isSessionExpired: false,
    isAuthenticated: true,
    loginError: undefined,
    ...overrides,
  };
}

/** A signed-out Internet Identity context. */
export function signedOutIdentity(
  overrides: Partial<InternetIdentityContext> = {},
): InternetIdentityContext {
  return signedInIdentity({
    isAuthenticated: false,
    isLoginIdle: true,
    ...overrides,
  });
}

/** A context still restoring a stored identity. */
export function initializingIdentity(
  overrides: Partial<InternetIdentityContext> = {},
): InternetIdentityContext {
  return signedInIdentity({
    isAuthenticated: false,
    isInitializing: true,
    isLoginIdle: false,
    ...overrides,
  });
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface RouteSpec {
  path: string;
  component: () => ReactNode;
}

/**
 * Build a router for the supplied routes. Extracted so its concrete type can be
 * captured with `ReturnType`, which the generic `ReturnType<typeof
 * createRouter>` cannot express.
 */
function createTestRouter(routes: RouteSpec[], initialPath: string) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const childRoutes = routes.map((route) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: route.path,
      component: route.component,
    }),
  );
  return createRouter({
    routeTree: rootRoute.addChildren(childRoutes),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

/**
 * Render a page inside a real TanStack Router with in-memory history, so
 * `Link`, `useNavigate`, `useParams` and `useRouterState` all behave as they do
 * in the app. Routes are supplied explicitly to keep each test's surface small.
 */
export async function renderWithRouter(
  routes: RouteSpec[],
  initialPath: string,
  options: { queryClient?: QueryClient } = {},
): Promise<RenderResult & { router: ReturnType<typeof createTestRouter> }> {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const router = createTestRouter(routes, initialPath);

  // Resolve the initial match before rendering so the first paint already shows
  // the route component rather than the router's pending state.
  await router.load();

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { ...result, router };
}

/** Render arbitrary children with a fresh query client. */
export function renderWithQueryClient(
  children: ReactNode,
  queryClient: QueryClient = createTestQueryClient(),
): RenderResult {
  return render(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  );
}

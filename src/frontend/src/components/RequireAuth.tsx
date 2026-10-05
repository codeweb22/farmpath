import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Guards signed-in routes. While the stored identity is being restored it shows
 * a loading state; once resolved, unauthenticated visitors are redirected to
 * the sign-in screen.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div
        data-ocid="auth.loading_state"
        className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background"
      >
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Restoring your session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  return <>{children}</>;
}

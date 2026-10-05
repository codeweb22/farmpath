import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Leaf, Loader2, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

export function SignIn() {
  const { login, isAuthenticated, isLoggingIn, loginError } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-5 pt-4 pb-2 safe-top">
        <Link
          to="/"
          data-ocid="signin.back_button"
          aria-label="Back to welcome"
          className="tap-target inline-flex items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-10">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elevated">
            <Leaf className="size-8" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 max-w-xs text-base text-muted-foreground">
            Sign in to pick up your pepper farming journey where you left off.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-subtle">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold text-foreground">
                Secure sign-in
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                FarmPath uses Internet Identity — no passwords, no email. Your
                farm data stays tied to your identity.
              </p>
            </div>
          </div>

          {loginError ? (
            <p
              data-ocid="signin.error_state"
              className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              We couldn't sign you in. Please try again.
            </p>
          ) : null}

          <Button
            type="button"
            data-ocid="signin.submit_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="mt-5 h-12 w-full rounded-full text-base font-semibold"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to FarmPath?{" "}
          <Link
            to="/"
            data-ocid="signin.onboarding_link"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Take the tour
          </Link>
        </p>
      </main>
    </div>
  );
}

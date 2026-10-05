import { Button } from "@/components/ui/button";
import { ONBOARDING_STEPS } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Leaf } from "lucide-react";
import { useState } from "react";

export function Onboarding() {
  const [stepIndex, setStepIndex] = useState(0);
  const { isAuthenticated } = useInternetIdentity();
  const step = ONBOARDING_STEPS[stepIndex];
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            FarmPath
          </span>
        </div>
        <Link
          to={isAuthenticated ? "/" : "/signin"}
          data-ocid="onboarding.skip_button"
          className="tap-target flex items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-6">
        <div
          data-ocid="onboarding.carousel"
          className="relative mt-2 overflow-hidden rounded-3xl bg-muted shadow-elevated"
        >
          <img
            key={step.id}
            src={step.image}
            alt={step.imageAlt}
            className="h-[46vh] max-h-[420px] min-h-[280px] w-full animate-fade-rise object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
            <p className="text-xs font-semibold tracking-wider text-accent uppercase">
              {step.eyebrow}
            </p>
            <h1 className="mt-1 font-display text-2xl leading-tight font-semibold text-white">
              {step.title}
            </h1>
          </div>
        </div>

        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          {step.body}
        </p>

        <div className="mt-5 flex items-center gap-2" role="presentation">
          {ONBOARDING_STEPS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              data-ocid={`onboarding.dot.${index + 1}`}
              aria-label={`Go to step ${index + 1}`}
              aria-current={index === stepIndex ? "step" : undefined}
              onClick={() => setStepIndex(index)}
              className={
                index === stepIndex
                  ? "h-2 w-6 rounded-full bg-primary transition-smooth"
                  : "size-2 rounded-full bg-border transition-smooth hover:bg-muted-foreground"
              }
            />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          {isLast ? (
            <Button
              asChild
              data-ocid="onboarding.get_started_button"
              className="h-12 w-full rounded-full text-base font-semibold"
            >
              <Link to={isAuthenticated ? "/" : "/signin"}>
                Get Started
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              data-ocid="onboarding.next_button"
              onClick={() => setStepIndex((current) => current + 1)}
              className="h-12 w-full rounded-full text-base font-semibold"
            >
              Next
              <ArrowRight className="size-5" />
            </Button>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Already farming with us?{" "}
            <Link
              to="/signin"
              data-ocid="onboarding.signin_link"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

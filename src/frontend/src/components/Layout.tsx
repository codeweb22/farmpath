import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import type { ReactNode } from "react";

interface LayoutProps {
  /** Page heading shown in the sticky header. */
  title: string;
  /** Optional supporting line under the title. */
  subtitle?: string;
  /** Optional control rendered on the right of the header. */
  headerAction?: ReactNode;
  /** Hide the bottom tab bar (used by onboarding and sign-in). */
  hideNav?: boolean;
  /** Widen the content column further on desktop layouts. */
  wide?: boolean;
  children: ReactNode;
}

/**
 * Content column widths. Mobile-first: a comfortable single column on phones
 * that widens at the `lg` breakpoint so desktop layouts use the available
 * space instead of staying capped at 28rem.
 */
const CONTENT_WIDTH = {
  default: "max-w-md lg:max-w-3xl",
  wide: "max-w-md lg:max-w-5xl",
} as const;

export function Layout({
  title,
  subtitle,
  headerAction,
  hideNav = false,
  wide = false,
  children,
}: LayoutProps) {
  const contentWidth = wide ? CONTENT_WIDTH.wide : CONTENT_WIDTH.default;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div
          className={cn(
            "mx-auto flex items-center justify-between gap-3 px-5 pt-3 pb-3 safe-top",
            contentWidth,
          )}
        >
          <Link
            to="/"
            data-ocid="nav.brand.link"
            className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xl leading-none font-semibold tracking-tight text-foreground">
                FarmPath
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {subtitle ?? title}
              </span>
            </span>
          </Link>
          {headerAction}
        </div>
      </header>

      <main
        className={cn(
          "mx-auto px-5 pt-5",
          hideNav ? "pb-10" : "pb-28",
          contentWidth,
        )}
      >
        {children}
      </main>

      <footer
        className={cn("mx-auto px-5", hideNav ? "pb-8" : "pb-24", contentWidth)}
      >
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 transition-smooth hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {hideNav ? null : <BottomNav />}
    </div>
  );
}

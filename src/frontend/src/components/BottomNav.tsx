import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Map as MapIcon,
  MoreHorizontal,
  Sprout,
  Store,
} from "lucide-react";
import type { ComponentType } from "react";

export type NavTab = "home" | "journey" | "farm" | "market" | "more";

interface NavItem {
  id: NavTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home, to: "/" },
  { id: "journey", label: "Journey", icon: MapIcon, to: "/journey" },
  { id: "farm", label: "Farm", icon: Sprout, to: "/farm" },
  { id: "market", label: "Market", icon: Store, to: "/market" },
  { id: "more", label: "More", icon: MoreHorizontal, to: "/profile" },
];

/** Map a pathname to the tab that should read as active. */
export function activeTabForPath(pathname: string): NavTab {
  if (pathname.startsWith("/journey") || pathname.startsWith("/lessons")) {
    return "journey";
  }
  if (pathname.startsWith("/farm") || pathname.startsWith("/crops")) {
    return "farm";
  }
  if (pathname.startsWith("/market") || pathname.startsWith("/profit")) {
    return "market";
  }
  if (pathname.startsWith("/profile") || pathname.startsWith("/activity")) {
    return "more";
  }
  return "home";
}

export function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const active = activeTabForPath(pathname);

  return (
    <nav
      aria-label="Primary"
      data-ocid="nav.bottom"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 safe-bottom lg:max-w-3xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <li key={item.id} className="flex-1">
              <Link
                to={item.to}
                data-ocid={`nav.${item.id}.tab`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "tap-target flex w-full flex-col items-center justify-center gap-1 rounded-lg px-2 pt-2 pb-1 text-xs font-medium transition-smooth",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-6 transition-smooth",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import { Layout } from "@/components/Layout";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCrops,
  useDashboardSummary,
  useProgressSummary,
} from "@/hooks/useFarm";
import { formatKg, formatTimestamp, greetingForHour } from "@/lib/format";
import {
  activityKindLabel,
  cropProgressPercent,
  overallProgressPercent,
} from "@/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Leaf,
  ListChecks,
  Sprout,
  TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";

interface QuickAction {
  id: string;
  label: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  to: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "crops",
    label: "Choose Crop",
    hint: "Pick a variety",
    icon: Sprout,
    to: "/crops",
  },
  {
    id: "lessons",
    label: "Lessons",
    hint: "Keep learning",
    icon: BookOpen,
    to: "/journey",
  },
  {
    id: "activity",
    label: "Log Activity",
    hint: "Harvest or sale",
    icon: ClipboardList,
    to: "/activity",
  },
];

export function Dashboard() {
  const dashboard = useDashboardSummary();
  const progress = useProgressSummary();
  const crops = useCrops();

  const summary = dashboard.data;
  const progressData = progress.data;
  const cropList = crops.data ?? [];
  const isLoading =
    dashboard.isLoading || progress.isLoading || crops.isLoading;

  const greeting = greetingForHour(new Date().getHours());
  const overall = progressData ? overallProgressPercent(progressData) : 0;
  const completed = progressData ? Number(progressData.completedLessons) : 0;
  const total = progressData ? Number(progressData.totalLessons) : 0;

  // Derive the active-crop count from the user's actual crop list. The backend
  // summary only counts crops that already have lessons, so a freshly added
  // crop would otherwise leave this card at 0.
  const activeCrops = cropList.length;
  const upcomingTasks = summary ? Number(summary.upcomingTasks) : 0;
  const recent = summary?.recentActivity ?? [];
  const harvestKg = recent
    .filter((entry) => entry.kind === "harvest")
    .reduce((sum, entry) => sum + entry.quantity, 0n);

  // The dashboard shows its populated view whenever the farm has any crops.
  // The empty state is reserved for a genuinely empty crop list, so adding a
  // crop always makes it appear here after refresh.
  const hasCrops = cropList.length > 0;
  const nextCrop = cropList.find((crop) => cropProgressPercent(crop) < 100);

  if (isLoading) {
    return (
      <Layout title="Home" subtitle="Your farm at a glance">
        <div data-ocid="dashboard.loading_state" className="space-y-4">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, i) => `dash-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-24 w-full rounded-2xl" />
              ),
            )}
          </div>
          <Skeleton className="h-28 w-full rounded-3xl" />
        </div>
      </Layout>
    );
  }

  if (!hasCrops) {
    return (
      <Layout title="Home" subtitle="Your farm at a glance">
        <section
          data-ocid="dashboard.empty_state"
          className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Leaf className="size-8" />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
            Start your first crop
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Add a pepper variety to unlock lessons, harvest logging and profit
            tracking for your plot.
          </p>
          <Button
            asChild
            data-ocid="dashboard.add_crop_button"
            className="mt-6 h-12 w-full max-w-xs rounded-full text-base font-semibold"
          >
            <Link to="/crops">
              Add your first crop
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </section>
      </Layout>
    );
  }

  return (
    <Layout title="Home" subtitle="Your farm at a glance">
      <section data-ocid="dashboard.greeting" className="animate-fade-rise">
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Pepper Farmer
        </h1>
      </section>

      <section
        data-ocid="dashboard.progress_card"
        className="mt-4 flex items-center gap-5 rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-elevated"
      >
        <ProgressRing
          value={overall}
          label={`${overall}%`}
          caption="Done"
          size={92}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wider text-primary-foreground/70 uppercase">
            Pepper Farming Journey
          </p>
          <p className="mt-1 font-display text-lg leading-tight font-semibold">
            {completed} of {total} lessons
          </p>
          <p className="mt-1 text-sm text-primary-foreground/80">
            {overall >= 100
              ? "Every lesson complete — well grown!"
              : "Keep going to finish your journey."}
          </p>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <StatCard
          ocid="dashboard.active_crops_card"
          icon={Sprout}
          label="Active Crops"
          value={String(activeCrops)}
        />
        <StatCard
          ocid="dashboard.upcoming_tasks_card"
          icon={ListChecks}
          label="Upcoming Tasks"
          value={String(upcomingTasks)}
        />
        <StatCard
          ocid="dashboard.harvest_card"
          icon={TrendingUp}
          label="Recent Harvest"
          value={harvestKg > 0n ? formatKg(harvestKg) : "—"}
        />
        <StatCard
          ocid="dashboard.lessons_card"
          icon={BookOpen}
          label="Lessons Done"
          value={`${completed}/${total}`}
        />
      </section>

      <section className="mt-6">
        <h2 className="font-display text-base font-semibold text-foreground">
          Quick actions
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.to}
                data-ocid={`dashboard.${action.id}_tile`}
                className="tap-target flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 text-center shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {action.label}
                </span>
                <span className="text-[0.65rem] text-muted-foreground">
                  {action.hint}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {nextCrop ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">
              Continue learning
            </h2>
            <Link
              to="/journey"
              data-ocid="dashboard.journey_link"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
          <Link
            to="/crops/$id"
            params={{ id: nextCrop.id.toString() }}
            data-ocid="dashboard.continue_card"
            className="mt-3 flex items-center gap-4 rounded-3xl border border-border bg-card p-3 shadow-subtle transition-smooth hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <img
              src={nextCrop.photoUrl}
              alt={nextCrop.name}
              className="size-16 shrink-0 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold text-foreground">
                {nextCrop.name}
              </p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {Number(nextCrop.completedCount)} of{" "}
                {Number(nextCrop.lessonCount)} lessons complete
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                  style={{ width: `${cropProgressPercent(nextCrop)}%` }}
                />
              </div>
            </div>
            <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-foreground">
            Recent activity
          </h2>
          <Link
            to="/activity"
            data-ocid="dashboard.activity_link"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p
            data-ocid="dashboard.activity_empty_state"
            className="mt-3 rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground"
          >
            No activity logged yet. Record your first harvest or sale.
          </p>
        ) : (
          <ul data-ocid="dashboard.activity_list" className="mt-3 space-y-2">
            {recent.slice(0, 4).map((entry, index) => (
              <li
                key={entry.id.toString()}
                data-ocid={`dashboard.activity_item.${index + 1}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {entry.cropName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activityKindLabel(entry.kind)} ·{" "}
                    {formatTimestamp(entry.date)}
                  </p>
                </div>
                <span className="numeral shrink-0 text-sm font-semibold text-foreground">
                  {formatKg(entry.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}

interface StatCardProps {
  ocid: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function StatCard({ ocid, icon: Icon, label, value }: StatCardProps) {
  return (
    <div
      data-ocid={ocid}
      className="rounded-2xl border border-border bg-card p-4 shadow-subtle"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="size-4" />
      </span>
      <p className="numeral mt-3 font-display text-2xl leading-none font-semibold text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

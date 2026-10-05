import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities, useCrops, useDashboardSummary } from "@/hooks/useFarm";
import { formatKg, formatNumber } from "@/lib/format";
import { activityKindLabel, cropProgressPercent } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardList,
  Sprout,
  TrendingUp,
  Wheat,
} from "lucide-react";
import type { ComponentType } from "react";

const FALLBACK_PHOTO = "/assets/images/placeholder.svg";

export function Farm() {
  const crops = useCrops();
  const dashboard = useDashboardSummary();
  const activities = useActivities();

  const cropList = crops.data ?? [];
  const entries = activities.data ?? [];
  const summary = dashboard.data;
  const isLoading =
    crops.isLoading || dashboard.isLoading || activities.isLoading;

  const harvestCount = entries.filter(
    (entry) => entry.kind === "harvest",
  ).length;
  const saleCount = entries.filter((entry) => entry.kind === "sale").length;
  const costCount = entries.filter((entry) => entry.kind === "cost").length;
  const harvestKg = entries
    .filter((entry) => entry.kind === "harvest")
    .reduce((sum, entry) => sum + entry.quantity, 0n);

  return (
    <Layout title="Farm" subtitle="Your plots & activity">
      {isLoading ? (
        <div data-ocid="farm.loading_state" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, i) => `farm-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-24 w-full rounded-2xl" />
              ),
            )}
          </div>
          <Skeleton className="h-32 w-full rounded-3xl" />
        </div>
      ) : cropList.length === 0 ? (
        <section
          data-ocid="farm.empty_state"
          className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Sprout className="size-8" />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
            No plots yet
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Add a crop to lay out your first plot and start tracking what it
            produces.
          </p>
          <Link
            to="/crops"
            data-ocid="farm.add_crop_button"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground"
          >
            Add a crop
            <ArrowRight className="size-5" />
          </Link>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3">
            <CountCard
              ocid="farm.active_crops_card"
              icon={Sprout}
              label="Active Crops"
              value={String(
                summary ? Number(summary.activeCrops) : cropList.length,
              )}
            />
            <CountCard
              ocid="farm.harvests_card"
              icon={Wheat}
              label="Harvests Logged"
              value={String(harvestCount)}
            />
            <CountCard
              ocid="farm.sales_card"
              icon={TrendingUp}
              label="Sales Logged"
              value={String(saleCount)}
            />
            <CountCard
              ocid="farm.costs_card"
              icon={ClipboardList}
              label="Costs Logged"
              value={String(costCount)}
            />
          </section>

          <section
            data-ocid="farm.harvest_total_card"
            className="mt-4 flex items-center justify-between rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-elevated"
          >
            <div>
              <p className="text-xs font-semibold tracking-wider text-primary-foreground/70 uppercase">
                Total Harvested
              </p>
              <p className="numeral mt-1 font-display text-2xl font-semibold">
                {formatKg(harvestKg)}
              </p>
            </div>
            <Wheat className="size-9 text-primary-foreground/70" />
          </section>

          <section className="mt-6">
            <h2 className="font-display text-base font-semibold text-foreground">
              Your plots
            </h2>
            <ul data-ocid="farm.plot_list" className="mt-3 space-y-3">
              {cropList.map((crop, index) => {
                const percent = cropProgressPercent(crop);
                const cropEntries = entries.filter(
                  (entry) => entry.cropId === crop.id,
                );
                const cropKg = cropEntries
                  .filter((entry) => entry.kind === "harvest")
                  .reduce((sum, entry) => sum + entry.quantity, 0n);
                return (
                  <li key={crop.id.toString()}>
                    <Link
                      to="/crops/$id"
                      params={{ id: crop.id.toString() }}
                      data-ocid={`farm.plot_item.${index + 1}`}
                      className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <img
                        src={crop.photoUrl || FALLBACK_PHOTO}
                        alt={crop.name}
                        className="size-16 shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-base font-semibold text-foreground">
                          {crop.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatNumber(cropEntries.length)} entries ·{" "}
                          {cropKg > 0n ? formatKg(cropKg) : "no harvest yet"}
                        </p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                      <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-foreground">
                Latest entries
              </h2>
              <Link
                to="/activity"
                data-ocid="farm.activity_link"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                View all
              </Link>
            </div>
            {entries.length === 0 ? (
              <p
                data-ocid="farm.activity_empty_state"
                className="mt-3 rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground"
              >
                Nothing logged yet. Record a harvest, sale or cost to see it
                here.
              </p>
            ) : (
              <ul data-ocid="farm.activity_list" className="mt-3 space-y-2">
                {entries.slice(0, 5).map((entry, index) => (
                  <li
                    key={entry.id.toString()}
                    data-ocid={`farm.activity_item.${index + 1}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {entry.cropName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activityKindLabel(entry.kind)}
                        {entry.note ? ` · ${entry.note}` : ""}
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
        </>
      )}
    </Layout>
  );
}

interface CountCardProps {
  ocid: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function CountCard({ ocid, icon: Icon, label, value }: CountCardProps) {
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

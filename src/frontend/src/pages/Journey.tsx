import { Layout } from "@/components/Layout";
import { ProgressRing } from "@/components/ProgressRing";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrops, useProgressSummary } from "@/hooks/useFarm";
import { cropProgressPercent, overallProgressPercent } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Check, Map as MapIcon } from "lucide-react";

const FALLBACK_PHOTO = "/assets/images/placeholder.svg";

export function Journey() {
  const progress = useProgressSummary();
  const crops = useCrops();

  const summary = progress.data;
  const cropList = summary?.crops ?? crops.data ?? [];
  const overall = summary ? overallProgressPercent(summary) : 0;
  const completed = summary ? Number(summary.completedLessons) : 0;
  const total = summary ? Number(summary.totalLessons) : 0;
  const isLoading = progress.isLoading || crops.isLoading;

  return (
    <Layout title="Journey" subtitle="Your learning progress">
      {isLoading ? (
        <div data-ocid="journey.loading_state" className="space-y-4">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      ) : cropList.length === 0 ? (
        <section
          data-ocid="journey.empty_state"
          className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <MapIcon className="size-8" />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
            Your journey starts here
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Choose a pepper variety to unlock its lesson path and start tracking
            your progress.
          </p>
          <Link
            to="/crops"
            data-ocid="journey.choose_crop_button"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground"
          >
            Choose a crop
            <ArrowRight className="size-5" />
          </Link>
        </section>
      ) : (
        <>
          <section
            data-ocid="journey.progress_card"
            className="flex items-center gap-5 rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-elevated"
          >
            <ProgressRing
              value={overall}
              label={`${overall}%`}
              caption="Overall"
              size={104}
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
                  ? "Journey complete — every lesson done."
                  : `${total - completed} lessons left to finish.`}
              </p>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-base font-semibold text-foreground">
              Progress by crop
            </h2>
            <ul data-ocid="journey.crop_list" className="mt-3 space-y-3">
              {cropList.map((crop, index) => {
                const percent = cropProgressPercent(crop);
                const done = Number(crop.completedCount);
                const count = Number(crop.lessonCount);
                return (
                  <li key={crop.id.toString()}>
                    <Link
                      to="/crops/$id"
                      params={{ id: crop.id.toString() }}
                      data-ocid={`journey.crop_item.${index + 1}`}
                      className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <img
                        src={crop.photoUrl || FALLBACK_PHOTO}
                        alt={crop.name}
                        className="size-14 shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-display text-base font-semibold text-foreground">
                            {crop.name}
                          </p>
                          <span className="numeral shrink-0 text-sm font-semibold text-primary">
                            {percent}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          {percent >= 100 ? (
                            <Check className="size-3.5 text-primary" />
                          ) : (
                            <BookOpen className="size-3.5" />
                          )}
                          {done} of {count} lessons complete
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </Layout>
  );
}

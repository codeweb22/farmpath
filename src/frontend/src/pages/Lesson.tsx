import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCropDetail, useCrops, useToggleLesson } from "@/hooks/useFarm";
import type { CropDetail as CropDetailType } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Loader2,
  RotateCcw,
} from "lucide-react";

/** Maximum number of crops scanned when resolving a lesson id. */
const MAX_CROPS = 8;

export function Lesson() {
  const { id } = useParams({ from: "/lessons/$id" });
  const lessonId = BigInt(id);

  const cropsQuery = useCrops();
  const cropIds = (cropsQuery.data ?? []).map((crop) => crop.id);
  const details = useCropDetails(cropIds);

  const detail = details.find((item) =>
    item.lessons.some((lesson) => lesson.id === lessonId),
  );
  const lesson = detail?.lessons.find((item) => item.id === lessonId) ?? null;
  const crop = detail?.crop ?? null;
  const siblings = detail?.lessons ?? [];
  const currentIndex = siblings.findIndex((item) => item.id === lessonId);
  const nextLesson = currentIndex >= 0 ? siblings[currentIndex + 1] : undefined;

  const { toggle, isPending } = useToggleLesson();
  const isLoading =
    cropsQuery.isLoading || details.some((item) => item.loading);

  return (
    <Layout
      title={lesson?.title ?? "Lesson"}
      subtitle={crop?.name ?? "Lesson"}
      headerAction={
        <Link
          to={crop ? "/crops/$id" : "/journey"}
          params={crop ? { id: crop.id.toString() } : undefined}
          data-ocid="lesson.back_button"
          aria-label="Back"
          className="tap-target flex items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
      }
    >
      {isLoading ? (
        <div data-ocid="lesson.loading_state" className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      ) : !lesson ? (
        <section
          data-ocid="lesson.error_state"
          className="rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
        >
          <h2 className="font-display text-lg font-semibold text-foreground">
            Lesson not found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This lesson is no longer available. Head back to your journey to
            pick up where you left off.
          </p>
          <Link
            to="/journey"
            data-ocid="lesson.journey_link"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Back to journey
          </Link>
        </section>
      ) : (
        <>
          <section
            data-ocid="lesson.video"
            className="overflow-hidden rounded-3xl border border-border bg-card shadow-subtle"
          >
            <div className="aspect-video w-full bg-secondary">
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            </div>
          </section>

          <section
            data-ocid="lesson.content"
            className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-subtle"
          >
            <div className="flex items-center gap-2">
              <span
                className={
                  lesson.completed
                    ? "flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground"
                    : "flex size-7 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                }
              >
                {lesson.completed ? (
                  <Check className="size-4" />
                ) : (
                  <Circle className="size-3.5" />
                )}
              </span>
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Step {Number(lesson.order) + 1}
              </span>
            </div>
            <h1 className="mt-3 font-display text-xl font-semibold text-foreground">
              {lesson.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {lesson.description}
            </p>
          </section>

          <div className="mt-5 flex flex-col gap-3">
            <Button
              type="button"
              data-ocid="lesson.toggle_button"
              disabled={isPending}
              onClick={() => toggle(lesson.id, lesson.completed)}
              className="h-12 w-full rounded-full text-base font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Saving…
                </>
              ) : lesson.completed ? (
                <>
                  <RotateCcw className="size-5" />
                  Mark as not complete
                </>
              ) : (
                <>
                  <Check className="size-5" />
                  Mark complete
                </>
              )}
            </Button>

            {nextLesson ? (
              <Button
                asChild
                variant="outline"
                data-ocid="lesson.next_button"
                className="h-12 w-full rounded-full text-base font-semibold"
              >
                <Link
                  to="/lessons/$id"
                  params={{ id: nextLesson.id.toString() }}
                >
                  Next lesson
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                data-ocid="lesson.finish_button"
                className="h-12 w-full rounded-full text-base font-semibold"
              >
                <Link to="/journey">
                  Back to journey
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}

interface CropDetailResult {
  loading: boolean;
  crop: CropDetailType["crop"] | null;
  lessons: CropDetailType["lessons"];
}

/**
 * The backend exposes lessons only through `getCrop`, so a lesson id is
 * resolved by loading the (small, stable) crop catalog and scanning each
 * crop's lesson list. Hook calls are fixed-length to satisfy the rules of
 * hooks; the catalog is seeded with three crops.
 */
function useCropDetails(ids: bigint[]): CropDetailResult[] {
  const slots = Array.from(
    { length: MAX_CROPS },
    (_, index) => ids[index] ?? null,
  );
  const q0 = useCropDetail(slots[0]);
  const q1 = useCropDetail(slots[1]);
  const q2 = useCropDetail(slots[2]);
  const q3 = useCropDetail(slots[3]);
  const q4 = useCropDetail(slots[4]);
  const q5 = useCropDetail(slots[5]);
  const q6 = useCropDetail(slots[6]);
  const q7 = useCropDetail(slots[7]);

  return [q0, q1, q2, q3, q4, q5, q6, q7].map((query) => ({
    loading: query.isLoading,
    crop: query.data?.crop ?? null,
    lessons: query.data?.lessons ?? [],
  }));
}

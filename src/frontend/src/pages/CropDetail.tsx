import { Layout } from "@/components/Layout";
import { ProgressRing } from "@/components/ProgressRing";
import { Skeleton } from "@/components/ui/skeleton";
import { useCropDetail } from "@/hooks/useFarm";
import { cropProgressPercent } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Circle, PlayCircle } from "lucide-react";

const FALLBACK_PHOTO = "/assets/images/placeholder.svg";

export function CropDetail() {
  const { id } = useParams({ from: "/crops/$id" });
  const cropId = BigInt(id);
  const detail = useCropDetail(cropId);

  const data = detail.data;
  const crop = data?.crop;
  const lessons = data?.lessons ?? [];
  const percent = crop ? cropProgressPercent(crop) : 0;

  return (
    <Layout
      title={crop?.name ?? "Crop"}
      subtitle="Lessons & progress"
      headerAction={
        <Link
          to="/crops"
          data-ocid="crop.back_button"
          aria-label="Back to crops"
          className="tap-target flex items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-5" />
          Crops
        </Link>
      }
    >
      {detail.isLoading ? (
        <div data-ocid="crop.loading_state" className="space-y-4">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : !crop ? (
        <section
          data-ocid="crop.error_state"
          className="rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
        >
          <h2 className="font-display text-lg font-semibold text-foreground">
            Crop not found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This crop may have been removed. Pick another variety to continue.
          </p>
          <Link
            to="/crops"
            data-ocid="crop.browse_link"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Browse crops
          </Link>
        </section>
      ) : (
        <>
          <section
            data-ocid="crop.header"
            className="overflow-hidden rounded-3xl border border-border bg-card shadow-subtle"
          >
            <img
              src={crop.photoUrl || FALLBACK_PHOTO}
              alt={crop.name}
              className="h-44 w-full object-cover"
            />
            <div className="flex items-center gap-4 p-5">
              <ProgressRing
                value={percent}
                label={`${percent}%`}
                size={72}
                strokeWidth={7}
                className="text-foreground"
              />
              <div className="min-w-0">
                <h1 className="font-display text-xl font-semibold text-foreground">
                  {crop.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {crop.description}
                </p>
                <p className="numeral mt-2 text-xs font-semibold text-primary">
                  {Number(crop.completedCount)} of {Number(crop.lessonCount)}{" "}
                  lessons complete
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-base font-semibold text-foreground">
              Lessons
            </h2>
            {lessons.length === 0 ? (
              <p
                data-ocid="crop.lessons_empty_state"
                className="mt-3 rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground"
              >
                No lessons have been published for this crop yet.
              </p>
            ) : (
              <ol data-ocid="crop.lesson_list" className="mt-3 space-y-2">
                {lessons.map((lesson, index) => (
                  <li key={lesson.id.toString()}>
                    <Link
                      to="/lessons/$id"
                      params={{ id: lesson.id.toString() }}
                      data-ocid={`crop.lesson_item.${index + 1}`}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span
                        className={
                          lesson.completed
                            ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
                            : "flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                        }
                      >
                        {lesson.completed ? (
                          <Check className="size-5" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {lesson.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {lesson.description}
                        </p>
                      </div>
                      <PlayCircle className="size-5 shrink-0 text-primary" />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}

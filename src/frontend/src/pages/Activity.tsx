import { ActivityForm } from "@/components/ActivityForm";
import { Layout } from "@/components/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useActivities,
  useCrops,
  useDeleteActivity,
  useLogActivity,
  useUpdateActivity,
} from "@/hooks/useFarm";
import { formatCurrency, formatKg, formatTimestamp } from "@/lib/format";
import {
  type ActivityInput,
  ActivityKind,
  type ActivityView,
  activityKindLabel,
} from "@/types";
import { Link } from "@tanstack/react-router";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type KindFilter = "all" | ActivityKind;

const KIND_FILTERS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: ActivityKind.harvest, label: "Harvest" },
  { id: ActivityKind.sale, label: "Sale" },
  { id: ActivityKind.cost, label: "Cost" },
];

export function Activity() {
  const crops = useCrops();
  const [cropFilter, setCropFilter] = useState<bigint | null>(null);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

  const activities = useActivities(
    cropFilter,
    kindFilter === "all" ? null : kindFilter,
  );
  const logActivity = useLogActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityView | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ActivityView | null>(null);

  const cropList = crops.data ?? [];
  const entries = activities.data ?? [];
  const isLoading = crops.isLoading || activities.isLoading;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (entry: ActivityView) => {
    setEditing(entry);
    setFormOpen(true);
  };

  const handleSubmit = (input: ActivityInput) => {
    if (editing) {
      updateActivity.mutate(
        { id: editing.id, input },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      logActivity.mutate(input, { onSuccess: () => setFormOpen(false) });
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteActivity.mutate(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <Layout
      title="Activity"
      subtitle="Harvests, sales & costs"
      headerAction={
        <Button
          type="button"
          size="icon"
          data-ocid="activity.open_modal_button"
          aria-label="Log activity"
          onClick={openCreate}
          disabled={cropList.length === 0}
          className="size-10 rounded-full"
        >
          <Plus className="size-5" />
        </Button>
      }
    >
      {cropList.length === 0 && !isLoading ? (
        <section
          data-ocid="activity.empty_state"
          className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <ClipboardList className="size-8" />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
            Add a crop first
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Activity entries are tied to a crop. Add a pepper variety, then log
            your harvests, sales and costs.
          </p>
          <Link
            to="/crops"
            data-ocid="activity.add_crop_button"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground"
          >
            Add a crop
            <Plus className="size-5" />
          </Link>
        </section>
      ) : (
        <>
          <section className="space-y-3">
            <div
              data-ocid="activity.kind_filter.tabs"
              role="tablist"
              aria-label="Filter by activity type"
              className="flex gap-2 overflow-x-auto pb-1"
            >
              {KIND_FILTERS.map((filter) => {
                const isActive = kindFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-ocid={`activity.kind_filter.${filter.id}`}
                    onClick={() => setKindFilter(filter.id)}
                    className={
                      isActive
                        ? "tap-target shrink-0 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-smooth"
                        : "tap-target shrink-0 rounded-full border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
                    }
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                data-ocid="activity.crop_filter.all"
                onClick={() => setCropFilter(null)}
                className={
                  cropFilter === null
                    ? "tap-target shrink-0 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition-smooth"
                    : "tap-target shrink-0 rounded-full border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
                }
              >
                All crops
              </button>
              {cropList.map((crop) => {
                const isActive = cropFilter === crop.id;
                return (
                  <button
                    key={crop.id.toString()}
                    type="button"
                    data-ocid={`activity.crop_filter.${crop.id.toString()}`}
                    onClick={() => setCropFilter(crop.id)}
                    className={
                      isActive
                        ? "tap-target shrink-0 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition-smooth"
                        : "tap-target shrink-0 rounded-full border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
                    }
                  >
                    {crop.name}
                  </button>
                );
              })}
            </div>
          </section>

          {isLoading ? (
            <div data-ocid="activity.loading_state" className="mt-4 space-y-2">
              {Array.from(
                { length: 4 },
                (_, i) => `activity-skeleton-${i}`,
              ).map((id) => (
                <Skeleton key={id} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div
              data-ocid="activity.list_empty_state"
              className="mt-4 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <ClipboardList className="size-7" />
              </span>
              <p className="mt-4 font-display text-base font-semibold text-foreground">
                No entries match
              </p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Try a different filter, or log a new harvest, sale or cost.
              </p>
              <Button
                type="button"
                data-ocid="activity.log_button"
                onClick={openCreate}
                className="mt-5 h-11 rounded-full font-semibold"
              >
                <Plus className="size-4" />
                Log activity
              </Button>
            </div>
          ) : (
            <ul data-ocid="activity.list" className="mt-4 space-y-2">
              {entries.map((entry, index) => (
                <li
                  key={entry.id.toString()}
                  data-ocid={`activity.item.${index + 1}`}
                  className="rounded-2xl border border-border bg-card p-4 shadow-subtle"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-secondary-foreground uppercase">
                          {activityKindLabel(entry.kind)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(entry.date)}
                        </span>
                      </div>
                      <p className="mt-1.5 truncate font-display text-base font-semibold text-foreground">
                        {entry.cropName}
                      </p>
                      <p className="numeral mt-0.5 text-sm text-muted-foreground">
                        {formatKg(entry.quantity)}
                        {entry.kind === ActivityKind.sale ||
                        entry.kind === ActivityKind.cost
                          ? ` · ${formatCurrency(entry.amount)}`
                          : ""}
                      </p>
                      {entry.note ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {entry.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        data-ocid={`activity.edit_button.${index + 1}`}
                        aria-label={`Edit ${entry.cropName} entry`}
                        onClick={() => openEdit(entry)}
                        className="size-9 rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        data-ocid={`activity.delete_button.${index + 1}`}
                        aria-label={`Delete ${entry.cropName} entry`}
                        onClick={() => setPendingDelete(entry)}
                        className="size-9 rounded-full text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ActivityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        crops={cropList}
        entry={editing}
        isPending={logActivity.isPending || updateActivity.isPending}
        isError={logActivity.isError || updateActivity.isError}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent
          data-ocid="activity.delete_dialog"
          className="rounded-3xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">
              Delete this entry?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `The ${activityKindLabel(pendingDelete.kind).toLowerCase()} for ${pendingDelete.cropName} will be removed. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              data-ocid="activity.delete_cancel_button"
              className="h-11 rounded-full"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="activity.delete_confirm_button"
              onClick={confirmDelete}
              className="h-11 rounded-full bg-destructive font-semibold text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

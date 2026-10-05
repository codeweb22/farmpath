import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAddCrop, useCrops } from "@/hooks/useFarm";
import { cropProgressPercent } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Sprout } from "lucide-react";
import { useState } from "react";

const FALLBACK_PHOTO = "/assets/images/placeholder.svg";

export function Crops() {
  const crops = useCrops();
  const addCrop = useAddCrop();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const cropList = crops.data ?? [];
  const canSubmit = name.trim().length > 0 && !addCrop.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const input = {
      name: name.trim(),
      description: description.trim(),
      photoUrl: photoUrl.trim() || FALLBACK_PHOTO,
    };
    setName("");
    setDescription("");
    setPhotoUrl("");
    setOpen(false);
    addCrop.mutate(input);
  };

  return (
    <Layout
      title="Crops"
      subtitle="Choose a pepper variety"
      headerAction={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              size="icon"
              data-ocid="crops.open_modal_button"
              aria-label="Add a crop"
              className="size-10 rounded-full"
            >
              <Plus className="size-5" />
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="crops.modal" className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Add a crop
              </DialogTitle>
              <DialogDescription>
                Add a pepper variety to your farm catalog. You can log harvests
                and sales against it right away.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crop-name">Crop name</Label>
                <Input
                  id="crop-name"
                  data-ocid="crops.name_input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Habanero"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crop-description">Short description</Label>
                <Textarea
                  id="crop-description"
                  data-ocid="crops.description_input"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What makes this variety worth growing?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crop-photo">Photo URL (optional)</Label>
                <Input
                  id="crop-photo"
                  data-ocid="crops.photo_input"
                  value={photoUrl}
                  onChange={(event) => setPhotoUrl(event.target.value)}
                  placeholder="https://…"
                  inputMode="url"
                />
              </div>
              {addCrop.isError ? (
                <p
                  data-ocid="crops.error_state"
                  className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  We couldn't add that crop. Please try again.
                </p>
              ) : null}
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    data-ocid="crops.cancel_button"
                    className="h-11 rounded-full"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  data-ocid="crops.submit_button"
                  disabled={!canSubmit}
                  className="h-11 rounded-full font-semibold"
                >
                  {addCrop.isPending ? "Adding…" : "Add crop"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {crops.isLoading ? (
        <div data-ocid="crops.loading_state" className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => `crop-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-28 w-full rounded-3xl" />
            ),
          )}
        </div>
      ) : cropList.length === 0 ? (
        <section
          data-ocid="crops.empty_state"
          className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Sprout className="size-8" />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
            No crops yet
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Add your first pepper variety to start tracking lessons and
            harvests.
          </p>
          <Button
            type="button"
            data-ocid="crops.add_button"
            onClick={() => setOpen(true)}
            className="mt-6 h-12 w-full max-w-xs rounded-full text-base font-semibold"
          >
            <Plus className="size-5" />
            Add a crop
          </Button>
        </section>
      ) : (
        <ul data-ocid="crops.list" className="space-y-3">
          {cropList.map((crop, index) => {
            const percent = cropProgressPercent(crop);
            return (
              <li key={crop.id.toString()}>
                <Link
                  to="/crops/$id"
                  params={{ id: crop.id.toString() }}
                  data-ocid={`crops.item.${index + 1}`}
                  className="flex items-center gap-4 rounded-3xl border border-border bg-card p-3 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <img
                    src={crop.photoUrl || FALLBACK_PHOTO}
                    alt={crop.name}
                    className="size-20 shrink-0 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold text-foreground">
                      {crop.name}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {crop.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="numeral shrink-0 text-xs font-semibold text-muted-foreground">
                        {percent}%
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}

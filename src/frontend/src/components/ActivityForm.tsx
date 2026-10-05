import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  dateKey,
  dateToTimestamp,
  parseDateKey,
  timestampToDate,
} from "@/lib/format";
import { ActivityKind, activityKindHint, activityKindLabel } from "@/types";
import type { ActivityInput, ActivityView, CropView } from "@/types";
import { useEffect, useState } from "react";

const KIND_OPTIONS: ActivityKind[] = [
  ActivityKind.harvest,
  ActivityKind.sale,
  ActivityKind.cost,
];

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crops: CropView[];
  /** Existing entry when editing; omit to create a new entry. */
  entry?: ActivityView | null;
  isPending: boolean;
  isError: boolean;
  onSubmit: (input: ActivityInput) => void;
}

/** Shared create/edit form for harvest, sale and cost entries. */
export function ActivityForm({
  open,
  onOpenChange,
  crops,
  entry,
  isPending,
  isError,
  onSubmit,
}: ActivityFormProps) {
  const [kind, setKind] = useState<ActivityKind>(ActivityKind.harvest);
  const [cropId, setCropId] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(dateKey(new Date()));
  const [note, setNote] = useState("");

  // Seed the draft when the dialog opens for a specific entry.
  useEffect(() => {
    if (!open) return;
    if (entry) {
      setKind(entry.kind);
      setCropId(entry.cropId.toString());
      setQuantity(entry.quantity.toString());
      setUnit(entry.unit);
      setAmount(entry.amount.toString());
      setDate(dateKey(timestampToDate(entry.date) ?? new Date()));
      setNote(entry.note ?? "");
    } else {
      setKind(ActivityKind.harvest);
      setCropId(crops[0] ? crops[0].id.toString() : "");
      setQuantity("");
      setUnit("kg");
      setAmount("");
      setDate(dateKey(new Date()));
      setNote("");
    }
  }, [open, entry, crops]);

  const isSale = kind === ActivityKind.sale;
  const isCost = kind === ActivityKind.cost;
  const needsAmount = isSale || isCost;
  const parsedQuantity = Number.parseInt(quantity, 10);
  const parsedAmount = Number.parseInt(amount, 10);
  const parsedDate = parseDateKey(date);

  // Costs are pure expenses and are modelled with quantity 0, so only
  // harvest and sale entries require a positive quantity.
  const quantityValid = isCost
    ? Number.isFinite(parsedQuantity) && parsedQuantity >= 0
    : Number.isFinite(parsedQuantity) && parsedQuantity > 0;

  const canSubmit =
    cropId !== "" &&
    quantityValid &&
    parsedDate !== null &&
    (!needsAmount || (Number.isFinite(parsedAmount) && parsedAmount >= 0)) &&
    !isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !parsedDate) return;
    onSubmit({
      kind,
      cropId: BigInt(cropId),
      quantity: BigInt(parsedQuantity),
      unit: unit.trim() || "kg",
      amount: needsAmount ? BigInt(parsedAmount) : 0n,
      date: dateToTimestamp(parsedDate),
      note: note.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="activity.modal" className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {entry ? "Edit entry" : "Log activity"}
          </DialogTitle>
          <DialogDescription>
            {entry
              ? "Update the details of this farm entry."
              : "Record a harvest, sale or cost against one of your crops."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity-kind">Type</Label>
            <Select
              value={kind}
              onValueChange={(value) => setKind(value as ActivityKind)}
            >
              <SelectTrigger
                id="activity-kind"
                data-ocid="activity.kind_select"
                className="h-11 w-full rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {activityKindLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {activityKindHint(kind)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-crop">Crop</Label>
            <Select value={cropId} onValueChange={setCropId}>
              <SelectTrigger
                id="activity-crop"
                data-ocid="activity.crop_select"
                className="h-11 w-full rounded-xl"
              >
                <SelectValue placeholder="Select a crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem
                    key={crop.id.toString()}
                    value={crop.id.toString()}
                  >
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="activity-quantity">Quantity</Label>
              <Input
                id="activity-quantity"
                data-ocid="activity.quantity_input"
                type="number"
                min={isCost ? "0" : "1"}
                inputMode="numeric"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="0"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-unit">Unit</Label>
              <Input
                id="activity-unit"
                data-ocid="activity.unit_input"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="kg"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {needsAmount ? (
            <div className="space-y-2">
              <Label htmlFor="activity-amount">
                {isSale ? "Sale amount" : "Cost amount"}
              </Label>
              <Input
                id="activity-amount"
                data-ocid="activity.amount_input"
                type="number"
                min="0"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                className="h-11 rounded-xl"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="activity-date">Date</Label>
            <Input
              id="activity-date"
              data-ocid="activity.date_input"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-note">Note (optional)</Label>
            <Textarea
              id="activity-note"
              data-ocid="activity.note_input"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Anything worth remembering about this entry"
              rows={2}
            />
          </div>

          {isError ? (
            <p
              data-ocid="activity.error_state"
              className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              We couldn't save that entry. Please try again.
            </p>
          ) : null}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                data-ocid="activity.cancel_button"
                className="h-11 rounded-full"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              data-ocid="activity.save_button"
              disabled={!canSubmit}
              className="h-11 rounded-full font-semibold"
            >
              {isPending ? "Saving…" : entry ? "Save changes" : "Log entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { ActivityKind } from "@/backend";
import type {
  ActivityInput,
  ActivityView,
  CropDetail,
  CropInput,
  CropProfit,
  CropView,
  DashboardSummary,
  LessonView,
  ProfitSummary,
  ProgressSummary,
} from "@/backend";

export { ActivityKind };
export type {
  ActivityInput,
  ActivityView,
  CropDetail,
  CropInput,
  CropProfit,
  CropView,
  DashboardSummary,
  LessonView,
  ProfitSummary,
  ProgressSummary,
};

/** Activity kinds that represent money coming in. */
export const INCOME_KINDS: ActivityKind[] = [ActivityKind.sale];

/** Activity kinds that represent money going out. */
export const COST_KINDS: ActivityKind[] = [ActivityKind.cost];

/** Human-readable label for an activity kind. */
export function activityKindLabel(kind: ActivityKind): string {
  switch (kind) {
    case ActivityKind.harvest:
      return "Harvest";
    case ActivityKind.sale:
      return "Sale";
    case ActivityKind.cost:
      return "Cost";
    default:
      return "Activity";
  }
}

/** Short description of what an activity kind records. */
export function activityKindHint(kind: ActivityKind): string {
  switch (kind) {
    case ActivityKind.harvest:
      return "Crop pulled from the field";
    case ActivityKind.sale:
      return "Crop sold at market";
    case ActivityKind.cost:
      return "Input or expense paid";
    default:
      return "";
  }
}

/** Percentage of lessons completed for a crop, clamped to 0–100. */
export function cropProgressPercent(crop: CropView): number {
  const total = Number(crop.lessonCount);
  if (total <= 0) return 0;
  const done = Number(crop.completedCount);
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

/** Percentage of all lessons completed across the farm, clamped to 0–100. */
export function overallProgressPercent(summary: ProgressSummary): number {
  const total = Number(summary.totalLessons);
  if (total <= 0) return 0;
  const done = Number(summary.completedLessons);
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

/** A single step in the onboarding carousel. */
export interface OnboardingStep {
  /** Stable key for the step. */
  id: string;
  /** Short eyebrow label above the headline. */
  eyebrow: string;
  /** Headline shown on the step. */
  title: string;
  /** Supporting copy describing the step. */
  body: string;
  /** Path to the pepper-farming photograph. */
  image: string;
  /** Accessible description of the photograph. */
  imageAlt: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "grow",
    eyebrow: "Welcome to FarmPath",
    title: "Grow peppers with a plan",
    body: "Follow a guided journey from nursery bed to harvest, with every step mapped out for your plot.",
    image: "/assets/generated/onboarding-seedlings.dim_1024x1280.jpg",
    imageAlt: "Young pepper seedlings sprouting in rows of dark soil",
  },
  {
    id: "learn",
    eyebrow: "Learn as you farm",
    title: "Lessons that match your crop",
    body: "Short, practical lessons teach you what to do next — then mark them complete as you go.",
    image: "/assets/generated/onboarding-peppers.dim_1024x1280.jpg",
    imageAlt: "Ripe red chili peppers growing on a leafy green plant",
  },
  {
    id: "track",
    eyebrow: "Track every harvest",
    title: "Know your real profit",
    body: "Log harvests, sales and costs, then see exactly what each crop earns you at market.",
    image: "/assets/generated/onboarding-harvest.dim_1024x1280.jpg",
    imageAlt:
      "A farmer holding freshly harvested red chili peppers over a basket",
  },
];

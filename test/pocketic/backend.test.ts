import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

/** A caller that has been registered with the access-control mixin. */
async function registeredActor(seed: string): Promise<Actor<_SERVICE>> {
  const identity = createIdentity(seed);
  const caller = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  caller.setIdentity(identity);
  await caller._initialize_access_control();
  return caller;
}

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
  // The farm API rejects anonymous callers, so the default actor must call as a
  // real identity before registering. The first registered caller becomes admin;
  // register the default actor so every farm method below is reachable.
  actor.setIdentity(createIdentity("default"));
  await actor._initialize_access_control();
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  // The migration seeds a shared pepper catalog, so the crop list is never
  // empty; the caller's own activity and progress state starts empty.
  const crops = await actor.listCrops();
  expect(crops).toHaveLength(3);
  expect(crops.map((crop) => crop.name)).toEqual([
    "Bell Pepper",
    "Chili Pepper",
    "Scotch Bonnet",
  ]);
  expect(crops.every((crop) => crop.completedCount === 0n)).toBe(true);

  await expect(actor.listActivities([], [])).resolves.toEqual([]);
  await expect(actor.progressSummary()).resolves.toMatchObject({
    totalLessons: 10n,
    completedLessons: 0n,
  });
  await expect(actor.profitSummary()).resolves.toMatchObject({
    totalIncome: 0n,
    totalCost: 0n,
    totalProfit: 0n,
  });
  await expect(actor.dashboardSummary()).resolves.toMatchObject({
    activeCrops: 3n,
    upcomingTasks: 10n,
    recentActivity: [],
    hasData: true,
  });
});

it("round-trips a crop through the real canister", async () => {
  const created = await actor.addCrop({
    name: "Habanero",
    description: "Fiery orange pepper",
    photoUrl: "https://example.test/habanero.jpg",
  });
  expect(created).toMatchObject({
    name: "Habanero",
    description: "Fiery orange pepper",
    photoUrl: "https://example.test/habanero.jpg",
    lessonCount: 0n,
    completedCount: 0n,
  });

  const crops = await actor.listCrops();
  expect(crops).toContainEqual(expect.objectContaining({ id: created.id, name: "Habanero" }));

  const detail = await actor.getCrop(created.id);
  expect(detail).toHaveLength(1);
  expect(detail[0]?.crop.name).toBe("Habanero");
  expect(detail[0]?.lessons).toEqual([]);
});

it("logs a harvest and a sale and computes profit from them", async () => {
  const crop = await actor.addCrop({
    name: "Jalapeno",
    description: "Medium heat",
    photoUrl: "",
  });

  const harvest = await actor.logActivity({
    cropId: crop.id,
    kind: { harvest: null },
    quantity: 12n,
    unit: "kg",
    amount: 0n,
    date: 20_000n,
    note: [],
  });
  expect(harvest).toMatchObject({
    cropId: crop.id,
    cropName: "Jalapeno",
    quantity: 12n,
    amount: 0n,
  });

  const sale = await actor.logActivity({
    cropId: crop.id,
    kind: { sale: null },
    quantity: 10n,
    unit: "kg",
    amount: 240n,
    date: 20_001n,
    note: ["market day"],
  });
  expect(sale).toMatchObject({ amount: 240n, note: ["market day"] });

  const cost = await actor.logActivity({
    cropId: crop.id,
    kind: { cost: null },
    quantity: 0n,
    unit: "kg",
    amount: 40n,
    date: 20_002n,
    note: [],
  });
  expect(cost.amount).toBe(40n);

  const profit = await actor.profitSummary();
  expect(profit.totalIncome).toBe(240n);
  expect(profit.totalCost).toBe(40n);
  expect(profit.totalProfit).toBe(200n);
  const jalapeno = profit.byCrop.find((entry) => entry.cropId === crop.id);
  expect(jalapeno).toMatchObject({ income: 240n, cost: 40n, profit: 200n });

  const all = await actor.listActivities([], []);
  expect(all).toHaveLength(3);

  const salesOnly = await actor.listActivities([], [{ sale: null }]);
  expect(salesOnly).toHaveLength(1);
  expect(salesOnly[0]?.id).toBe(sale.id);

  const byCrop = await actor.listActivities([crop.id], []);
  expect(byCrop).toHaveLength(3);
});

it("edits and deletes an owned activity", async () => {
  const crop = await actor.addCrop({
    name: "Poblano",
    description: "Mild and smoky",
    photoUrl: "",
  });
  const entry = await actor.logActivity({
    cropId: crop.id,
    kind: { sale: null },
    quantity: 5n,
    unit: "kg",
    amount: 100n,
    date: 20_010n,
    note: [],
  });

  const updated = await actor.updateActivity(entry.id, {
    cropId: crop.id,
    kind: { sale: null },
    quantity: 7n,
    unit: "kg",
    amount: 150n,
    date: 20_011n,
    note: ["revised"],
  });
  expect(updated).toHaveLength(1);
  expect(updated[0]).toMatchObject({ quantity: 7n, amount: 150n, note: ["revised"] });

  await expect(actor.deleteActivity(entry.id)).resolves.toBe(true);
  await expect(actor.deleteActivity(entry.id)).resolves.toBe(false);
  const remaining = await actor.listActivities([crop.id], []);
  expect(remaining).toEqual([]);
});

it("completes a lesson and reflects it in progress and dashboard", async () => {
  // The migration seeds a global pepper catalog with lessons; use the first
  // seeded crop so a real lesson id exists.
  const seeded = await actor.listCrops();
  const crop = seeded.find((entry) => entry.lessonCount > 0n);
  expect(crop).toBeDefined();
  const detail = await actor.getCrop(crop!.id);
  const lesson = detail[0]?.lessons[0];
  expect(lesson).toBeDefined();

  const before = await actor.progressSummary();
  const completedBefore = before.completedLessons;

  const result = await actor.completeLesson(lesson!.id);
  expect(result).toHaveLength(1);
  expect(result[0]?.completedCount).toBe(1n);

  const after = await actor.progressSummary();
  expect(after.completedLessons).toBe(completedBefore + 1n);

  const dashboard = await actor.dashboardSummary();
  expect(dashboard.hasData).toBe(true);
  expect(dashboard.activeCrops).toBeGreaterThan(0n);

  // Idempotent: completing again does not double-count.
  await actor.completeLesson(lesson!.id);
  const idempotent = await actor.progressSummary();
  expect(idempotent.completedLessons).toBe(after.completedLessons);

  await actor.uncompleteLesson(lesson!.id);
  const reverted = await actor.progressSummary();
  expect(reverted.completedLessons).toBe(completedBefore);
});

it("does not show one caller's activities to another", async () => {
  const alice = await registeredActor("alice");
  const bob = await registeredActor("bob");

  const crop = await alice.addCrop({
    name: "Alice's Cayenne",
    description: "private plot",
    photoUrl: "",
  });
  await alice.logActivity({
    cropId: crop.id,
    kind: { harvest: null },
    quantity: 3n,
    unit: "kg",
    amount: 0n,
    date: 20_020n,
    note: [],
  });

  await expect(bob.listActivities([], [])).resolves.toEqual([]);
  await expect(bob.profitSummary()).resolves.toMatchObject({ totalIncome: 0n, totalCost: 0n });
});

it("rejects an anonymous caller", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.listCrops()).rejects.toThrow();
  await expect(guest.addCrop({ name: "x", description: "", photoUrl: "" })).rejects.toThrow();
});

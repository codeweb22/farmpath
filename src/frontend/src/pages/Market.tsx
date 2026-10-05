import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities, useProfitSummary } from "@/hooks/useFarm";
import {
  formatCurrency,
  formatKg,
  formatSignedCurrency,
  formatTimestamp,
} from "@/lib/format";
import { activityKindLabel } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Store, TrendingUp, Wallet } from "lucide-react";

export function Market() {
  const profit = useProfitSummary();
  const activities = useActivities();

  const summary = profit.data;
  const sales = (activities.data ?? []).filter(
    (entry) => entry.kind === "sale",
  );
  const isLoading = profit.isLoading || activities.isLoading;

  const totalIncome = summary?.totalIncome ?? 0n;
  const totalCost = summary?.totalCost ?? 0n;
  const totalProfit = summary?.totalProfit ?? 0n;
  const byCrop = summary?.byCrop ?? [];

  return (
    <Layout title="Market" subtitle="Sales & earnings">
      {isLoading ? (
        <div data-ocid="market.loading_state" className="space-y-4">
          <Skeleton className="h-36 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      ) : (
        <>
          <section
            data-ocid="market.earnings_card"
            className="rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-elevated"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider text-primary-foreground/70 uppercase">
                Total Profit
              </p>
              <Wallet className="size-5 text-primary-foreground/70" />
            </div>
            <p className="numeral mt-2 font-display text-3xl font-semibold">
              {formatSignedCurrency(totalProfit)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-primary-foreground/20 pt-4">
              <div>
                <p className="text-xs text-primary-foreground/70">Income</p>
                <p className="numeral mt-0.5 text-base font-semibold">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-foreground/70">Costs</p>
                <p className="numeral mt-0.5 text-base font-semibold">
                  {formatCurrency(totalCost)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-foreground">
                Profit by crop
              </h2>
              <Link
                to="/profit"
                data-ocid="market.profit_link"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Full breakdown
              </Link>
            </div>
            {byCrop.length === 0 ? (
              <p
                data-ocid="market.profit_empty_state"
                className="mt-3 rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground"
              >
                No sales or costs recorded yet. Log a sale to see your margins.
              </p>
            ) : (
              <ul data-ocid="market.profit_list" className="mt-3 space-y-2">
                {byCrop.map((crop, index) => (
                  <li
                    key={crop.cropId.toString()}
                    data-ocid={`market.profit_item.${index + 1}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {crop.cropName}
                      </p>
                      <p className="numeral text-xs text-muted-foreground">
                        {formatCurrency(crop.income)} in ·{" "}
                        {formatCurrency(crop.cost)} out
                      </p>
                    </div>
                    <span
                      className={
                        crop.profit >= 0n
                          ? "numeral shrink-0 text-sm font-semibold text-primary"
                          : "numeral shrink-0 text-sm font-semibold text-destructive"
                      }
                    >
                      {formatSignedCurrency(crop.profit)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-foreground">
                Recent sales
              </h2>
              <Link
                to="/activity"
                data-ocid="market.activity_link"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Log a sale
              </Link>
            </div>
            {sales.length === 0 ? (
              <div
                data-ocid="market.sales_empty_state"
                className="mt-3 flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-8 text-center shadow-subtle"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <Store className="size-7" />
                </span>
                <p className="mt-4 font-display text-base font-semibold text-foreground">
                  No sales yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Record what you sell at market to track your income.
                </p>
                <Link
                  to="/activity"
                  data-ocid="market.log_sale_button"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
                >
                  Log a sale
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <ul data-ocid="market.sales_list" className="mt-3 space-y-2">
                {sales.slice(0, 6).map((entry, index) => (
                  <li
                    key={entry.id.toString()}
                    data-ocid={`market.sale_item.${index + 1}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <TrendingUp className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {entry.cropName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activityKindLabel(entry.kind)} ·{" "}
                          {formatTimestamp(entry.date)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="numeral text-sm font-semibold text-primary">
                        {formatCurrency(entry.amount)}
                      </p>
                      <p className="numeral text-xs text-muted-foreground">
                        {formatKg(entry.quantity)}
                      </p>
                    </div>
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

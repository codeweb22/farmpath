import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfitSummary } from "@/hooks/useFarm";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coins,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export function Profit() {
  const profit = useProfitSummary();
  const summary = profit.data;

  const totalIncome = summary?.totalIncome ?? 0n;
  const totalCost = summary?.totalCost ?? 0n;
  const totalProfit = summary?.totalProfit ?? 0n;
  const byCrop = summary?.byCrop ?? [];

  const maxMagnitude = byCrop.reduce((max, crop) => {
    const magnitude = crop.income > crop.cost ? crop.income : crop.cost;
    return magnitude > max ? magnitude : max;
  }, 0n);

  return (
    <Layout title="Profit" subtitle="Income minus costs">
      {profit.isLoading ? (
        <div data-ocid="profit.loading_state" className="space-y-4">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      ) : (
        <>
          <section
            data-ocid="profit.summary_card"
            className="rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-elevated"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider text-primary-foreground/70 uppercase">
                Net Profit
              </p>
              <Wallet className="size-5 text-primary-foreground/70" />
            </div>
            <p className="numeral mt-2 font-display text-4xl font-semibold">
              {formatSignedCurrency(totalProfit)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-primary-foreground/20 pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary-foreground/70" />
                <div>
                  <p className="text-xs text-primary-foreground/70">Income</p>
                  <p className="numeral mt-0.5 text-base font-semibold">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="size-4 text-primary-foreground/70" />
                <div>
                  <p className="text-xs text-primary-foreground/70">Costs</p>
                  <p className="numeral mt-0.5 text-base font-semibold">
                    {formatCurrency(totalCost)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-base font-semibold text-foreground">
              Per crop
            </h2>
            {byCrop.length === 0 ? (
              <div
                data-ocid="profit.empty_state"
                className="mt-3 flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <Coins className="size-7" />
                </span>
                <p className="mt-4 font-display text-base font-semibold text-foreground">
                  No profit data yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Log sales and costs against your crops to see income, expenses
                  and profit here.
                </p>
                <Link
                  to="/activity"
                  data-ocid="profit.log_activity_button"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
                >
                  Log activity
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <ul data-ocid="profit.crop_list" className="mt-3 space-y-3">
                {byCrop.map((crop, index) => {
                  const incomeWidth =
                    maxMagnitude > 0n
                      ? Number((crop.income * 100n) / maxMagnitude)
                      : 0;
                  const costWidth =
                    maxMagnitude > 0n
                      ? Number((crop.cost * 100n) / maxMagnitude)
                      : 0;
                  return (
                    <li
                      key={crop.cropId.toString()}
                      data-ocid={`profit.crop_item.${index + 1}`}
                      className="rounded-3xl border border-border bg-card p-4 shadow-subtle"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-display text-base font-semibold text-foreground">
                          {crop.cropName}
                        </p>
                        <span
                          className={
                            crop.profit >= 0n
                              ? "numeral shrink-0 text-base font-semibold text-primary"
                              : "numeral shrink-0 text-base font-semibold text-destructive"
                          }
                        >
                          {formatSignedCurrency(crop.profit)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-14 shrink-0 text-xs text-muted-foreground">
                            Income
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                              style={{ width: `${incomeWidth}%` }}
                            />
                          </div>
                          <span className="numeral w-16 shrink-0 text-right text-xs font-medium text-foreground">
                            {formatCurrency(crop.income)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-14 shrink-0 text-xs text-muted-foreground">
                            Costs
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-destructive/70 transition-[width] duration-700 ease-out"
                              style={{ width: `${costWidth}%` }}
                            />
                          </div>
                          <span className="numeral w-16 shrink-0 text-right text-xs font-medium text-foreground">
                            {formatCurrency(crop.cost)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}

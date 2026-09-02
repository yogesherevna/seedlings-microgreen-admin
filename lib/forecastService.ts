import type { Product } from "@/types/catalog";
import type { Order } from "@/types/order";
import type { GrowingBatch } from "@/types/growingBatch";
import type { ForecastRow } from "@/types/forecast";
import type { Subscription } from "@/types/subscription";

const FULFILLED = new Set(["delivered"]);
const COMMITTED = new Set([
  "paid", "confirmed", "preparing", "ready_for_handover",
  "handed_to_delivery", "out_for_delivery"
]);

function timestampDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const fn = (value as {toDate?: unknown}).toDate;
    if (typeof fn === "function") {
      const d = (fn as () => Date)();
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function itemWeightGrams(item: { unit?: string; quantity?: number }, product?: Product) {
  const unit = String(item.unit ?? "").toLowerCase().replace(/\s/g, "");
  const match = unit.match(/([\d.]+)\s*(kg|g)/);
  if (match) {
    const n = Number(match[1]);
    return Math.round((match[2] === "kg" ? n * 1000 : n) * Number(item.quantity ?? 0));
  }
  const option = product?.sellingOptions?.find(o => o.active && o.weightGrams > 0);
  return option ? Math.round(option.weightGrams * Number(item.quantity ?? 0)) : 0;
}

function orderGrams(order: Order, product: Product) {
  return order.items
    .filter(i => i.productId === product.id)
    .reduce((sum, i) => sum + itemWeightGrams(i, product), 0);
}

export function buildForecast(
  products: Product[],
  orders: Order[],
  batches: GrowingBatch[],
  historicalDays: number,
  asOf = new Date(),
  subscriptions: Subscription[] = []
): ForecastRow[] {
  const since = new Date(asOf);
  since.setDate(since.getDate() - historicalDays);

  return products
    .filter(p => p.status !== "inactive")
    .map(product => {
      const cycleDays = Math.max(1, Math.round(Number(product.growingCycleDays ?? 0)));
      const yieldPerTray = Math.max(0, Math.round(Number(product.expectedYieldGramsPerTray ?? 0)));
      const minimumPerTray = Math.max(0, Math.round(Number(product.minimumYieldGramsPerTray ?? 0)));
      const safetyStock = Math.max(0, Math.round(Number(product.safetyStockGrams ?? 0)));
      const currentStock = Math.max(0, Math.round(Number(product.stockGrams ?? product.stock ?? 0)));

      const historicalDemand = orders.reduce((sum, order) => {
        const d = timestampDate(order.createdAt);
        if (!d || d < since || d > asOf || !FULFILLED.has(String(order.status))) return sum;
        return sum + orderGrams(order, product);
      }, 0);

      const recurringWeeklyDemand = subscriptions
        .filter(sub => sub.status === "active" && sub.productId === product.id)
        .reduce((sum, sub) => sum + Number(sub.weightGrams ?? 0) * Number(sub.quantity ?? 0), 0);

      const committedDemand = orders.reduce((sum, order) => {
        const d = timestampDate(order.createdAt);
        if (!d || d > asOf || !COMMITTED.has(String(order.status))) return sum;
        return sum + orderGrams(order, product);
      }, 0);

      const averageDaily = historicalDemand / historicalDays;
      const cycleForecast = Math.ceil(averageDaily * cycleDays);

      const inProduction = batches.reduce((sum, batch) => {
        if (batch.status === "completed") return sum;
        return sum + batch.items
          .filter(item => item.productId === product.id && !["harvested", "failed"].includes(item.status))
          .reduce((n, item) => n + Math.max(0, Number(item.expectedUsableYieldGrams ?? 0)), 0);
      }, 0);

      // Subscription demand is recurring future demand; include the number of weekly deliveries
      // that fit inside the product's growing cycle.
      const subscriptionCycleDemand = recurringWeeklyDemand * Math.ceil(cycleDays / 7);
      // Conservative planning: historical cycle demand + committed orders + recurring subscriptions + safety stock.
      const projectedNeed = cycleForecast + committedDemand + subscriptionCycleDemand + safetyStock;
      const projectedAvailable = currentStock + inProduction;
      const additional = Math.max(0, projectedNeed - projectedAvailable);
      const recommendedTrays = yieldPerTray > 0 ? Math.ceil(additional / yieldPerTray) : 0;
      const coverageDays = averageDaily > 0 ? Math.floor(currentStock / averageDaily) : null;

      let confidence: ForecastRow["confidence"] = "Low";
      if (historicalDemand >= 500 && historicalDays >= 30) confidence = "Medium";
      if (historicalDemand >= 1500 && historicalDays >= 60) confidence = "Good";

      return {
        productId: product.id,
        productName: product.name,
        cycleDays,
        expectedYieldPerTrayGrams: yieldPerTray,
        minimumYieldPerTrayGrams: minimumPerTray,
        safetyStockGrams: safetyStock,
        currentStockGrams: currentStock,
        inProductionGrams: inProduction,
        historicalDemandGrams: Math.round(historicalDemand),
        averageDailyDemandGrams: Math.round(averageDaily),
        cycleDemandForecastGrams: cycleForecast,
        committedOrderGrams: Math.round(committedDemand + subscriptionCycleDemand),
        projectedNeedGrams: Math.round(projectedNeed),
        projectedAvailableGrams: Math.round(projectedAvailable),
        additionalGramsNeeded: Math.round(additional),
        recommendedTrays,
        coverageDays,
        confidence,
      };
    })
    .filter(row => row.cycleDays > 0 || row.currentStockGrams > 0 || row.historicalDemandGrams > 0);
}

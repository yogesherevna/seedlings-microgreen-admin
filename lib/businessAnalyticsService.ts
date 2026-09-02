import type { Order } from "@/types/order";
import type { Product } from "@/types/catalog";
import type { Subscription } from "@/types/subscription";
import type { GrowingBatch } from "@/types/growingBatch";

export type BusinessMetrics = {
  orders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  openOrders: number;
  grossSales: number;
  deliveredSales: number;
  averageOrderValue: number;
  activeSubscriptions: number;
  subscriptionValuePerDelivery: number;
  stockGrams: number;
  lowStockProducts: number;
  growingBatches: number;
  growingTrays: number;
  expectedUsableGrowingGrams: number;
  actualUsableHarvestGrams: number;
  actualLossGrams: number;
};

const delivered = (s?: string) => s === "delivered";
const cancelled = (s?: string) => s === "cancelled";

export function buildBusinessMetrics(
  orders: Order[],
  products: Product[],
  subscriptions: Subscription[],
  batches: GrowingBatch[],
  startDate?: string,
): BusinessMetrics {
  const scopedOrders = orders.filter(o => !startDate || String(o.createdAt ?? "").slice(0,10) >= startDate);
  const deliveredOrders = scopedOrders.filter(o => delivered(o.status));
  const cancelledOrders = scopedOrders.filter(o => cancelled(o.status));
  const openOrders = scopedOrders.filter(o => !delivered(o.status) && !cancelled(o.status));
  const grossSales = scopedOrders.filter(o => !cancelled(o.status)).reduce((s,o)=>s+Number(o.total||0),0);
  const deliveredSales = deliveredOrders.reduce((s,o)=>s+Number(o.total||0),0);
  const activeSubs = subscriptions.filter(s=>s.status==="active");
  const subscriptionValuePerDelivery = activeSubs.reduce((s,x)=>s+Number(x.unitPrice||0)*Number(x.quantity||0),0);
  const stockGrams = products.reduce((s,p)=>s+Number(p.stockGrams ?? p.stock ?? 0),0);
  const lowStockProducts = products.filter(p=>p.status!=="inactive" && Number(p.stockGrams ?? p.stock ?? 0) <= Number(p.lowStockThresholdGrams ?? p.lowStockThreshold ?? 0)).length;
  const scopedBatches = batches.filter(b=>!startDate || b.startDate>=startDate);
  const growingTrays = scopedBatches.reduce((s,b)=>s+b.items.reduce((n,i)=>n+Number(i.trayCount||0),0),0);
  const expectedUsableGrowingGrams = scopedBatches.reduce((s,b)=>s+b.items.reduce((n,i)=>n+Number(i.expectedUsableYieldGrams||0),0),0);
  const actualUsableHarvestGrams = scopedBatches.reduce((s,b)=>s+b.items.reduce((n,i)=>n+Number(i.actualYieldGrams||0),0),0);
  const actualLossGrams = scopedBatches.reduce((s,b)=>s+b.items.reduce((n,i)=>n+Number(i.wastageGrams||0),0),0);
  return {
    orders: scopedOrders.length,
    deliveredOrders: deliveredOrders.length,
    cancelledOrders: cancelledOrders.length,
    openOrders: openOrders.length,
    grossSales, deliveredSales,
    averageOrderValue: scopedOrders.length ? grossSales/scopedOrders.length : 0,
    activeSubscriptions: activeSubs.length,
    subscriptionValuePerDelivery,
    stockGrams, lowStockProducts,
    growingBatches: scopedBatches.length,
    growingTrays,
    expectedUsableGrowingGrams,
    actualUsableHarvestGrams,
    actualLossGrams,
  };
}

export function topProductSales(orders: Order[]) {
  const map = new Map<string,{productId:string;productName:string;orders:number;quantity:number;sales:number}>();
  for(const order of orders) {
    if(order.status==="cancelled") continue;
    for(const item of order.items??[]) {
      const key=item.productId;
      const r=map.get(key)??{productId:key,productName:item.productName,orders:0,quantity:0,sales:0};
      r.orders += 1; r.quantity += Number(item.quantity||0); r.sales += Number(item.lineTotal||0);
      map.set(key,r);
    }
  }
  return [...map.values()].sort((a,b)=>b.sales-a.sales);
}

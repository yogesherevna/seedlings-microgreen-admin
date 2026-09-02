import type { Customer } from "@/types/customer";
import type { Order } from "@/types/order";
import type { Subscription } from "@/types/subscription";
import type { CustomerGrowthMetrics, CustomerGrowthRow, CustomerSegment } from "@/types/customerGrowth";

function dateOf(v: unknown) {
  if (!v) return "";
  if (typeof v === "string") return v.slice(0,10);
  if (typeof v === "object" && v !== null && "toDate" in v && typeof (v as {toDate?:unknown}).toDate === "function") {
    return ((v as {toDate:()=>Date}).toDate()).toISOString().slice(0,10);
  }
  return "";
}

export function buildCustomerGrowth(customers: Customer[], orders: Order[], subscriptions: Subscription[], startDate?: string) {
  const rows = new Map<string, CustomerGrowthRow>();

  for (const c of customers) {
    rows.set(c.id, {
      customerId:c.id, name:c.name?.trim()||"Unnamed customer", mobile:c.mobileNumber||c.phone,
      orders:0, deliveredOrders:0, revenue:0, activeSubscriptions:0, lastOrderDate:"",
      segment:"new",
    });
  }

  for (const o of orders) {
    if (startDate && dateOf(o.createdAt) < startDate) continue;
    if (!o.customerId || o.status==="cancelled") continue;
    const r=rows.get(o.customerId) ?? {
      customerId:o.customerId,name:o.customerName||"Unknown customer",mobile:o.customerMobile,
      orders:0,deliveredOrders:0,revenue:0,activeSubscriptions:0,lastOrderDate:"",segment:"new" as CustomerSegment
    };
    r.orders++;
    if(o.status==="delivered") r.deliveredOrders++;
    r.revenue+=Number(o.total||0);
    const d=dateOf(o.createdAt);
    if(d>r.lastOrderDate!) r.lastOrderDate=d;
    rows.set(o.customerId,r);
  }

  for(const s of subscriptions) {
    if(s.status!=="active") continue;
    const r=rows.get(s.customerId);
    if(r) r.activeSubscriptions++;
  }

  const list=[...rows.values()].map(r=>({
    ...r,
    segment:r.activeSubscriptions>0?"subscription":r.orders>1?"repeat":r.orders===1?"new":"inactive"
  } as CustomerGrowthRow));

  const totalRevenue=list.reduce((n,r)=>n+r.revenue,0);
  const repeat=list.filter(r=>r.orders>1).length;
  const active=list.filter(r=>r.orders>0).length;
  const activeSubs=list.filter(r=>r.activeSubscriptions>0).length;
  const subscriptionRevenuePerDelivery=subscriptions.filter(s=>s.status==="active")
    .reduce((n,s)=>n+Number(s.unitPrice||0)*Number(s.quantity||0),0);

  const metrics:CustomerGrowthMetrics={
    totalCustomers:customers.length,
    activeCustomers:active,
    newCustomers:list.filter(r=>r.segment==="new").length,
    repeatCustomers:repeat,
    subscriptionCustomers:activeSubs,
    inactiveCustomers:list.filter(r=>r.segment==="inactive").length,
    totalRevenue,
    averageCustomerValue:active?totalRevenue/active:0,
    repeatRatePercent:active?repeat/active*100:0,
    activeSubscriptionRevenuePerDelivery:subscriptionRevenuePerDelivery
  };
  return {metrics,rows:list.sort((a,b)=>b.revenue-a.revenue)};
}

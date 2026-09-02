export type DeliveryChargeScope = "one_time_order" | "subscription";
export type DeliveryChargeMode = "flat" | "free";

export type DeliveryCharge = {
  id: string;
  name: string;
  scope: DeliveryChargeScope;
  mode: DeliveryChargeMode;
  amount: number;
  active: boolean;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export function deliveryScopeLabel(s: DeliveryChargeScope) {
  return s === "subscription" ? "Subscription" : "One-time Order";
}

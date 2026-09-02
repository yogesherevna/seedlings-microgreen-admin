export type CustomerSegment = "new" | "repeat" | "subscription" | "inactive";

export type CustomerGrowthMetrics = {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  subscriptionCustomers: number;
  inactiveCustomers: number;
  totalRevenue: number;
  averageCustomerValue: number;
  repeatRatePercent: number;
  activeSubscriptionRevenuePerDelivery: number;
};

export type CustomerGrowthRow = {
  customerId: string;
  name: string;
  mobile?: string;
  orders: number;
  deliveredOrders: number;
  revenue: number;
  activeSubscriptions: number;
  lastOrderDate?: string;
  segment: CustomerSegment;
};

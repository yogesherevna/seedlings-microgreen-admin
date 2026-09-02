export type NotificationRuleType =
  | "new_order"
  | "order_status"
  | "subscription_due"
  | "low_stock"
  | "harvest_due"
  | "system";

export type NotificationChannel = "in_app" | "email" | "sms";

export type NotificationRecord = {
  id: string;
  recipientUid?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channel: NotificationChannel;
  type: NotificationRuleType;
  title: string;
  message: string;
  status: "queued" | "sent" | "failed" | "read";
  relatedId?: string;
  createdAt?: unknown;
  sentAt?: unknown;
};

export type NotificationPreferences = {
  lowStockEnabled: boolean;
  newOrderEnabled: boolean;
  subscriptionDueEnabled: boolean;
  harvestDueEnabled: boolean;
  orderStatusEnabled: boolean;
};

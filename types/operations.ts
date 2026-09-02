export type NotificationChannel = "email" | "sms" | "push";
export type NotificationStatus = "queued" | "sent" | "failed" | "read";
export type NotificationType = "order_created" | "order_status" | "delivery_assigned" | "low_stock" | "system";
export type Notification = { id:string; recipientUid:string; recipientEmail?:string; recipientPhone?:string; channel:NotificationChannel; type:NotificationType; title:string; message:string; status:NotificationStatus; relatedOrderId?:string; createdAt?:unknown; sentAt?:unknown };
export type AuditEvent = { id:string; action:string; entityType:string; entityId?:string; summary:string; actorUid:string; actorEmail?:string; createdAt?:unknown };

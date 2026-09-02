export type AdminRole = "ADMIN" | "SUPER_ADMIN" | "OPERATIONS";
export type UserStatus = "active" | "inactive" | "suspended";
export type AdminUser = {
  id: string;
  email?: string;
  displayName?: string;
  role: AdminRole;
  status: UserStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};
export type AuditEvent = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  actorUid: string;
  actorEmail?: string;
  createdAt?: unknown;
};

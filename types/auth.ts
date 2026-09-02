export type AdminRole = "ADMIN";

export type UserProfile = {
  role?: string;
  status?: "active" | "inactive";
  displayName?: string;
  email?: string;
};
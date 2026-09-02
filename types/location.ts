export type LocationType = "rack" | "room" | "tray_area" | "storage" | "other";
export type Location = {
  id: string;
  name: string;
  type: LocationType;
  active: boolean;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

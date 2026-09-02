export type PackingStatus = "pending" | "packed";

/** One row in the manual packing worksheet. Box grams must match the salable product recipe total. */
export type PackingLine = {
  salableProductId: string;
  boxGrams: number;
  quantityPacked: number;
};

export type PackingItem = {
  productId: string;
  productName: string;
  quantityGrams: number;
  totalGrams: number;
};

export type Fulfilment = {
  id: string;
  salableProductId: string;
  salableProductName: string;
  salableProductSku?: string;
  boxGrams?: number;
  quantityPacked: number;
  items: PackingItem[];
  totalGramsConsumed: number;
  status: PackingStatus;
  packedAt?: unknown;
  packedByUid?: string;
  packedByEmail?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

/** Historical order fulfilment fields are retained for compatibility only. */
export type LegacyOrderFulfilment = Fulfilment & {
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  scheduledDeliveryDate?: string;
  totalGramsRequired?: number;
};

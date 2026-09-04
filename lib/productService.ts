import {
  collection,
  doc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { auditEvent } from "./firestore";
import type { InventoryAdjustmentType, Product } from "@/types/catalog";

export async function adjustProductStock(
  product: Product,
  type: InventoryAdjustmentType,
  quantity: number,
  reason: string,
  uid: string,
  email?: string
) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive whole number.");
  }
  if (!reason.trim()) {
    throw new Error("A reason is required for every stock adjustment.");
  }

  const delta =
    type === "receive" || type === "add"
      ? quantity
      : -quantity;

  const productRef = doc(db, "products", product.id);
  const adjustmentRef = doc(collection(db, "inventoryAdjustments"));

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(productRef);
    if (!snapshot.exists()) throw new Error("Product no longer exists.");

    const current = snapshot.data() as Product;
    const previousStock = Number(current.stockGrams ?? current.stock ?? 0);
    const newStock = previousStock + delta;

    if (newStock < 0) {
      throw new Error("Stock cannot become negative.");
    }

    transaction.update(productRef, {
      stockGrams: newStock,
      stock: newStock,
      status:
        newStock === 0 && current.status === "active"
          ? "out_of_stock"
          : current.status === "out_of_stock" && newStock > 0
            ? "active"
            : current.status,
      updatedAt: serverTimestamp()
    });

    transaction.set(adjustmentRef, {
      productId: product.id,
      productName: current.name,
      type,
      quantity,
      unit: "g",
      previousStock,
      newStock,
      reason: reason.trim(),
      createdByUid: uid,
      createdByEmail: email ?? "",
      createdAt: serverTimestamp()
    });
  });
  await auditEvent("stock_adjustment", "products", product.id, `${type} stock adjustment: ${quantity} g — ${reason.trim()}`);
}
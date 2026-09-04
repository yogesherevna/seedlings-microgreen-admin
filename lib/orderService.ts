import {
  arrayUnion,
  doc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import type { Order, OrderStatus } from "@/types/order";
import { auditEvent } from "./firestore";
import { canTransitionOrderStatus } from "@/types/order";

export async function updateOrderStatus(
  order: Order,
  nextStatus: OrderStatus,
  uid: string,
  email?: string,
  note?: string
) {
  if (!canTransitionOrderStatus(order.status, nextStatus)) {
    throw new Error(`Invalid order status transition: ${order.status} → ${nextStatus}`);
  }

  const orderRef = doc(db, "orders", order.id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error("Order no longer exists.");

    const current = snapshot.data() as Order;
    if (!canTransitionOrderStatus(current.status, nextStatus)) {
      throw new Error(`Order has changed. Refresh and try again.`);
    }

    transaction.update(orderRef, {
      status: nextStatus,
      updatedAt: serverTimestamp(),
      statusHistory: arrayUnion({
        status: nextStatus,
        changedByUid: uid,
        changedByEmail: email ?? "",
        note: note?.trim() || "",
        changedAt: new Date()
      })
    });
  });
  await auditEvent("update", "orders", order.id, `Order status changed to ${nextStatus}`);
}


export async function refundOrderPayment(
  order: Order,
  uid: string,
  email?: string,
  reason?: string,
) {
  if (order.paymentStatus !== "paid") {
    throw new Error("Only successfully paid orders can be refunded.");
  }
  const amount = Number(order.paidAmount ?? order.total);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Refund amount is invalid.");
  }
  const orderRef = doc(db, "orders", order.id);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error("Order no longer exists.");
    const current = snapshot.data() as Order;
    if (current.paymentStatus !== "paid") {
      throw new Error("Payment has already been refunded or is no longer refundable.");
    }
    transaction.update(orderRef, {
      paymentStatus: "refunded",
      refundAmount: amount,
      refundedAt: serverTimestamp(),
      refundedByUid: uid,
      refundedByEmail: email ?? "",
      refundReason: reason?.trim() || "",
      updatedAt: serverTimestamp(),
    });
  });
  await auditEvent("refund", "orders", order.id, `Order payment refunded: ${amount}`);
}

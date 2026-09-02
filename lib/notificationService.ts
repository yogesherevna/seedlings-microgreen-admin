import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { NotificationRecord, NotificationRuleType } from "@/types/notifications";

export async function queueNotification(input: Omit<NotificationRecord, "id"|"createdAt"|"status">) {
  return addDoc(collection(db,"notifications"), {
    ...input,
    status:"queued",
    createdAt:serverTimestamp(),
  });
}

export async function queueAdminNotification(args:{
  type:NotificationRuleType;
  title:string;
  message:string;
  relatedId?:string;
}) {
  return queueNotification({
    type:args.type,
    channel:"in_app",
    title:args.title,
    message:args.message,
    relatedId:args.relatedId,
  });
}

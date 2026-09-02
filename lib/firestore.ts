import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "./firebase";

export async function listCollection<T>(
  name: string,
  orderField = "updatedAt"
): Promise<(T & { id: string })[]> {
  const snapshot = await getDocs(
    query(collection(db, name), orderBy(orderField, "desc"))
  );
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as T)
  }));
}

export async function listCollectionByField<T>(
  name: string,
  field: string,
  value: string
): Promise<(T & { id: string })[]> {
  const snapshot = await getDocs(
    query(collection(db, name), where(field, "==", value), limit(100))
  );
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as T)
  }));
}

export async function createRecord<T extends Record<string, unknown>>(
  name: string,
  data: T
) {
  return addDoc(collection(db, name), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateRecord<T extends Record<string, unknown>>(
  name: string,
  id: string,
  data: T
) {
  return updateDoc(doc(db, name, id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteRecord(name: string, id: string) {
  return deleteDoc(doc(db, name, id));
}
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { app } from "./firebase";
import type { CommentRecord } from "../types";

const db = getFirestore(app);

export interface AddCommentInput {
  cardId: string;
  userId: string;
  text: string;
  createdAt: number;
}

export async function addComment({ cardId, userId, text, createdAt }: AddCommentInput): Promise<void> {
  const trimmed = (text || "").trim();
  if (!cardId || !userId || trimmed.length === 0) return;
  await addDoc(collection(db, "cards", cardId, "comments"), {
    cardId,
    userId,
    text: trimmed,
    createdAt,
  });
}

export async function getCommentsByCard(cardId: string): Promise<CommentRecord[]> {
  const snap = await getDocs(collection(db, "cards", cardId, "comments"));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}



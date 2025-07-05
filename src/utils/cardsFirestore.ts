import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, DocumentReference } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

export async function addCard(card: { id: string; createdAt: number; creator: string; title: string; description?: string }) {
  await setDoc(doc(db, "cards", card.id), card);
}

export async function addCardWithRandomId(card: { title: string; description?: string; creator: string; createdAt: number; }) {
  // id field is initially empty
  return await addDoc(collection(db, "cards"), { ...card, id: '' });
}

export async function updateCardId(docId: string, cardId: string) {
  await updateDoc(doc(db, "cards", docId), { id: cardId });
}

export async function getCard(docId: string) {
  const docSnap = await getDoc(doc(db, "cards", docId));
  return docSnap.exists() ? { ...docSnap.data(), docId } : null;
}

export async function getAllCards() {
  const querySnapshot = await getDocs(collection(db, "cards"));
  return querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
} 
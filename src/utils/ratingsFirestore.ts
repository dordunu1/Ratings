import { getFirestore, doc, setDoc, getDoc, collection, getDocs, increment, updateDoc } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

export interface Rating {
  userId: string;
  rating: number;
  createdAt: number;
  cardId: string;
}

// Add or update a rating (by cardId and userId)
export async function addRating({ cardId, userId, rating, createdAt }: Rating): Promise<void> {
  await setDoc(doc(db, "cards", cardId, "ratings", userId), {
    userId,
    rating,
    createdAt,
    cardId,
  });
  // Optionally increment the count in reviewCounts
  const countRef = doc(db, "reviewCounts", cardId);
  await updateDoc(countRef, { count: increment(1) }).catch(async () => {
    await setDoc(countRef, { count: 1 });
  });
}

// Get a single rating by cardId and userId
export async function getRating(cardId: string, userId: string): Promise<Rating | null> {
  const docSnap = await getDoc(doc(db, "cards", cardId, "ratings", userId));
  return docSnap.exists() ? (docSnap.data() as Rating) : null;
}

// Get all ratings for a cardId
export async function getRatingsByCard(cardId: string): Promise<Rating[]> {
  const q = collection(db, "cards", cardId, "ratings");
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Rating);
}

// Get the count of ratings for a cardId (using reviewCounts collection)
export async function getRatingCount(cardId: string): Promise<number> {
  const docSnap = await getDoc(doc(db, "reviewCounts", cardId));
  return docSnap.exists() ? docSnap.data().count : 0;
} 
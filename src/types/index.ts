export interface ReviewCard {
  id: string;
  title: string; // For backward compatibility; will mirror kolName
  description?: string;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  creator: string; // Address of the card creator
  revealed?: boolean; // Whether ratings have been revealed
  decryptionPending?: boolean; // Whether decryption is pending
  isDecrypting?: boolean;
  decryptionError?: boolean;
  // KOL specific fields
  kolName?: string;
  twitterHandle?: string; // handle without @
  twitterAvatarUrl?: string;
}

export interface CreateCardData {
  // Using kolName as the main title going forward
  kolName: string;
  twitterHandle: string;
  description?: string;
}

export interface Review {
  id: string;
  cardId: string;
  rating: number;
  createdAt: Date;
  encrypted: boolean; // Indicates if this review is encrypted
}

export interface SubmitReviewData {
  rating: number;
  comment?: string;
}

export interface CommentRecord {
  id: string;
  cardId: string;
  userId: string;
  text: string;
  createdAt: number;
}
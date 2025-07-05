export interface ReviewCard {
  id: string;
  title: string;
  description?: string;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  creator: string; // Address of the card creator
  revealed?: boolean; // Whether ratings have been revealed
  decryptionPending?: boolean; // Whether decryption is pending
  isDecrypting?: boolean;
  decryptionError?: boolean;
}

export interface CreateCardData {
  title: string;
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
}
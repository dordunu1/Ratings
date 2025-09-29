import React, { useState } from 'react';
import { X, Star, Shield, Send } from 'lucide-react';
import { ReviewCard, SubmitReviewData } from '../types';
import StarRating from './StarRating';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitReviewData) => void;
  card: ReviewCard | null;
  isLoading: boolean;
  reviewStatus?: 'idle' | 'encrypting' | 'reviewing';
  hasVoted?: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  card,
  isLoading,
  reviewStatus = 'idle',
  hasVoted = false,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = comment.trim();
    // Allow rating when not voted; allow comment-only when already voted
    const canSubmitRating = !hasVoted && rating > 0;
    const canSubmitCommentOnly = hasVoted && trimmed.length > 0;
    if (canSubmitRating || canSubmitCommentOnly) {
      onSubmit({ rating: canSubmitRating ? rating : 0, comment: trimmed || undefined });
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    onClose();
  };

  if (!isOpen || !card) return null;

  let submitText = hasVoted ? 'Submit Comment' : 'Submit Rating';
  if (isLoading) {
    if (!hasVoted) {
      if (reviewStatus === 'encrypting') submitText = 'Encrypting...';
      else if (reviewStatus === 'reviewing') submitText = 'Rating...';
      else submitText = 'Submitting...';
    } else {
      submitText = 'Submitting...';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen">
      <div className="fixed inset-0 transition-opacity" style={{backgroundColor: 'rgba(0,0,0,0.3)'}} onClick={handleClose} />
      <div className="relative w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform rounded-2xl" style={{backgroundColor: 'var(--sepia-50)', border: '1px solid var(--border-dark)', boxShadow: '0 10px 0 0 #C4843C'}}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border" style={{backgroundColor: 'var(--sepia-300)', borderColor: 'var(--border-dark)'}}>
              <Star className="w-6 h-6" style={{color: '#3B2F2F'}} />
            </div>
            <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary-dark)'}}>
              Submit Rating
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full transition-colors duration-200"
            style={{color: 'var(--text-secondary)'}}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: 'var(--sepia-100)', border: '1px solid var(--border-dark)'}}>
          <h4 className="font-semibold mb-2" style={{color: 'var(--text-primary-dark)'}}>
            {card.title}
          </h4>
          {card.description && (
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
              {card.description}
            </p>
          )}
          <div className="flex items-center space-x-2 mt-3">
            <StarRating rating={card.averageRating ?? 0} size="sm" />
              <span className="text-sm font-medium" style={{color: 'var(--text-primary-dark)'}}>
              {(card.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
              ({card.totalReviews ?? 0} ratings)
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: 'var(--sepia-100)', border: '1px solid var(--border-dark)'}}>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 mt-0.5" style={{color: 'var(--sepia-600)'}} />
            <div>
              <p className="text-sm font-medium" style={{color: '#5B4A3A'}}>
                Your Rating is Private
              </p>
              <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                Your rating is encrypted and anonymous. Only the average rating is visible to others.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3" style={{color: 'var(--text-primary-dark)'}}>
              Your Rating *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 rounded-full transition-colors duration-200"
                  disabled={hasVoted}
                >
                  <Star className={`w-8 h-8 transition-colors duration-200 ${star <= (hoveredRating || rating) ? '' : ''}`} style={{color: star <= (hoveredRating || rating) ? '#E8BF6B' : '#B8A68C', fill: star <= (hoveredRating || rating) ? '#E8BF6B' : 'transparent'}} />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-lg font-semibold" style={{color: 'var(--text-primary-dark)'}}>
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {hasVoted && (
              <div className="mt-2 text-sm font-semibold" style={{color: '#2f855a'}}>
                You have already submitted a rating for this card.
              </div>
            )}
          </div>
          {/* Comment box removed for clean "Rate only" flow */}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded-lg transition-colors duration-200 sepia-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (!(!hasVoted && rating > 0) && !(hasVoted && comment.trim().length > 0))}
              className="flex-1 px-4 py-2 font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sepia-button"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor: '#3B2F2F'}} />
              ) : null}
              <Send className="w-4 h-4" />
              <span>{submitText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
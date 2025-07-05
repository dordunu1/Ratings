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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit({ rating });
      setRating(0);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    onClose();
  };

  if (!isOpen || !card) return null;

  let submitText = 'Submit Rating';
  if (isLoading) {
    if (reviewStatus === 'encrypting') submitText = 'Encrypting...';
    else if (reviewStatus === 'reviewing') submitText = 'Rating...';
    else submitText = 'Submitting...';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen">
      <div className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-xl rounded-2xl border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full">
              <Star className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Submit Rating
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            {card.title}
          </h4>
          {card.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {card.description}
            </p>
          )}
          <div className="flex items-center space-x-2 mt-3">
            <StarRating rating={card.averageRating ?? 0} size="sm" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {(card.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({card.totalReviews ?? 0} ratings)
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Your Rating is Private
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your rating is encrypted and anonymous. Only the average rating is visible to others.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  disabled={hasVoted}
                >
                  <Star
                    className={`w-8 h-8 transition-colors duration-200 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {hasVoted && (
              <div className="mt-2 text-sm text-green-700 dark:text-green-300 font-semibold">
                You have already submitted a rating for this card.
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 backdrop-blur-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || rating === 0 || hasVoted}
              className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-black font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
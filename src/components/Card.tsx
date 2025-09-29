import React from 'react';
import { Lock, Users } from 'lucide-react';
import { ReviewCard } from '../types';
import StarRating from './StarRating';
import CommentsInline from './CommentsInline';
import { formatAverageRating } from '../utils/fheInstance';

interface CardProps {
  card: ReviewCard;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative sticky-note hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      <div className="sticky-pin" />
      
      <div className="relative p-7">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {card.twitterHandle && (
              <div className="w-12 h-12 rounded-full border" style={{borderColor: 'var(--border-dark)', overflow: 'hidden', backgroundColor: 'var(--sepia-100)'}}>
                <img src={`https://unavatar.io/twitter/${card.twitterHandle}`} alt={card.kolName || card.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold transition-colors duration-200 group-hover:opacity-80" style={{color: 'var(--text-primary-dark)'}}>
                {card.kolName || card.title}
              </h3>
              {card.twitterHandle && (
                <p className="text-xs" style={{color: 'var(--text-secondary)'}}>@{card.twitterHandle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1" style={{color: 'var(--text-secondary)'}}>
            <Lock className="w-4 h-4" />
          </div>
        </div>
        
        {card.description && (
          <p className="text-sm mb-4 line-clamp-2" style={{color: 'var(--text-secondary)'}}>
            {card.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
            <StarRating rating={card.averageRating ?? 0} />
              {card.isDecrypting ? (
              <span className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full" style={{borderColor: 'var(--sepia-500)'}}></span>
            ) : card.decryptionError ? (
              <span style={{color: 'var(--sepia-700)'}} title="Decryption relayer is down for maintenance. Ratings will be visible once service is restored.">
                <Lock className="inline w-5 h-5" />
              </span>
              ) : (card.totalReviews ?? 0) > 0 ? (
                <span className="text-base font-semibold" style={{color: 'var(--text-primary-dark)'}}>
                  {formatAverageRating(card.averageRating ?? 0, card.totalReviews)}
                </span>
              ) : null}
            </div>
            <span className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>
              {(card.totalReviews ?? 0) === 0 ? 'No ratings yet' : `${card.totalReviews} ${card.totalReviews === 1 ? 'rating' : 'ratings'}`}
            </span>
          </div>
          
          <div className="flex items-center space-x-2" style={{color: 'var(--text-secondary)'}}>
            <button className="px-3 py-1 text-xs sepia-button" onClick={(e) => { e.stopPropagation(); onClick(); }}>
              Rate
            </button>
            {card.id && (
              <a className="px-3 py-1 text-xs sepia-button" href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); (window as any).dispatchEvent(new CustomEvent('open-comments', { detail: { cardId: card.id } })); }}>
                Comments
              </a>
            )}
          </div>
        </div>
      </div>
      {card.id && (
        <CommentsInline cardId={card.id} />
      )}
    </div>
  );
};

export default Card;
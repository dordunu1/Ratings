import React from 'react';
import { Lock, Users } from 'lucide-react';
import { ReviewCard } from '../types';
import StarRating from './StarRating';
import { formatAverageRating } from '../utils/fheInstance';

interface CardProps {
  card: ReviewCard;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border group overflow-hidden bg-white/10 border-white/20 hover:border-yellow-400/50"
    >
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br pointer-events-none from-white/5 to-transparent" />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold transition-colors duration-200 text-white group-hover:text-yellow-400">
            {card.title}
          </h3>
          <div className="flex items-center space-x-1 text-gray-400">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        
        {card.description && (
          <p className="text-sm mb-4 line-clamp-2 text-gray-300">
            {card.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StarRating rating={card.averageRating ?? 0} />
            {card.isDecrypting ? (
              <span className="animate-spin w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full"></span>
            ) : card.decryptionError ? (
              <span className="text-yellow-400" title="Decryption relayer is down for maintenance. Ratings will be visible once service is restored.">
                <Lock className="inline w-5 h-5" />
              </span>
            ) : (
              <span className="text-lg font-bold text-white">
                {formatAverageRating(card.averageRating ?? 0, card.totalReviews)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{card.totalReviews ?? 0} ratings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
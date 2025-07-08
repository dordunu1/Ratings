import React from 'react';
import { ReviewCard } from '../types';
import Card from './Card';

interface CardGridProps {
  cards: ReviewCard[];
  onCardClick: (card: ReviewCard) => void;
  loading?: boolean;
}

const SkeletonCard: React.FC = () => (
  <div className="relative backdrop-blur-md rounded-xl shadow-lg border group overflow-hidden bg-white/10 border-white/20 animate-pulse">
    <div className="p-6">
      <div className="h-6 w-1/2 bg-gray-700 rounded mb-4"></div>
      <div className="h-4 w-3/4 bg-gray-800 rounded mb-2"></div>
      <div className="h-4 w-2/3 bg-gray-800 rounded mb-6"></div>
      <div className="flex items-center space-x-2 mb-2">
        <div className="h-6 w-24 bg-gray-700 rounded"></div>
        <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
    </div>
  </div>
);

const CardGrid: React.FC<CardGridProps> = ({ cards, onCardClick, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-yellow-900/30">
            <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">
            No cards yet
          </h3>
          <p className="text-gray-400">
            Create your first review card to get started with community feedback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <Card
          key={card.id || idx}
          card={card}
          onClick={() => onCardClick(card)}
        />
      ))}
    </div>
  );
};

export default CardGrid;
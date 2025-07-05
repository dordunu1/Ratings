import React from 'react';
import { ReviewCard } from '../types';
import Card from './Card';

interface CardGridProps {
  cards: ReviewCard[];
  onCardClick: (card: ReviewCard) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ cards, onCardClick }) => {
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
      {cards.map((card) => (
        <Card
          key={card.docId}
          card={card}
          onClick={() => onCardClick(card)}
        />
      ))}
    </div>
  );
};

export default CardGrid;
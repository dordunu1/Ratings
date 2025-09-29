import React from 'react';
import { ReviewCard } from '../types';
import Card from './Card';

interface CardGridProps {
  cards: ReviewCard[];
  onCardClick: (card: ReviewCard) => void;
  loading?: boolean;
}

const SkeletonCard: React.FC = () => (
  <div className="relative sticky-note animate-pulse">
    <div className="p-6">
      <div className="h-6 w-1/2 rounded mb-4" style={{backgroundColor: 'var(--sepia-200)'}}></div>
      <div className="h-4 w-3/4 rounded mb-2" style={{backgroundColor: 'var(--sepia-200)'}}></div>
      <div className="h-4 w-2/3 rounded mb-6" style={{backgroundColor: 'var(--sepia-200)'}}></div>
      <div className="flex items-center space-x-2 mb-2">
        <div className="h-6 w-24 rounded" style={{backgroundColor: 'var(--sepia-200)'}}></div>
        <div className="h-6 w-6 rounded-full" style={{backgroundColor: 'var(--sepia-200)'}}></div>
      </div>
      <div className="h-4 w-1/3 rounded" style={{backgroundColor: 'var(--sepia-200)'}}></div>
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
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'var(--sepia-300)'}}>
            <div className="w-8 h-8 rounded-full" style={{backgroundColor: 'var(--sepia-500)'}}></div>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary-dark)'}}>
            No cards yet
          </h3>
          <p style={{color: 'var(--text-secondary)'}}>
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
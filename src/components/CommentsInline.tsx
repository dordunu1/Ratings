import React, { useEffect, useState } from 'react';
import { getCommentsByCard } from '../utils/commentsFirestore';

interface CommentsInlineProps {
  cardId: string;
}

const CommentsInline: React.FC<CommentsInlineProps> = ({ cardId }) => {
  const [comments, setComments] = useState<any[]>([]);
  useEffect(() => {
    getCommentsByCard(cardId).then(setComments);
    const onNew = (e: any) => {
      if (e.detail.cardId !== cardId) return;
      setComments(prev => [{ id: String(e.detail.createdAt), cardId, userId: e.detail.userId, text: e.detail.text, createdAt: e.detail.createdAt }, ...prev]);
    };
    (window as any).addEventListener('new-comment', onNew);
    return () => (window as any).removeEventListener('new-comment', onNew);
  }, [cardId]);

  if (comments.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {comments.slice(0, 3).map((c) => (
        <div key={c.id} className="flex items-start space-x-2">
          <img
            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(c.userId || 'anon')}`}
            className="w-6 h-6 rounded-full"
          />
          <div className="text-xs" style={{color:'var(--text-secondary)'}}>{c.text}</div>
        </div>
      ))}
      {comments.length > 3 && (
        <div className="text-xs" style={{color:'var(--text-secondary)'}}>and {comments.length - 3} more…</div>
      )}
    </div>
  );
};

export default CommentsInline;



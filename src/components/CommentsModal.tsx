import React, { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { getCommentsByCard, addComment } from '../utils/commentsFirestore';
import { useAccount } from 'wagmi';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string | null;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, cardId }) => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const { address } = useAccount();

  useEffect(() => {
    if (!isOpen || !cardId) return;
    setLoading(true);
    getCommentsByCard(cardId).then(list => setComments(list)).finally(() => setLoading(false));
  }, [isOpen, cardId]);

  if (!isOpen || !cardId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen">
      <div className="fixed inset-0 transition-opacity" style={{backgroundColor: 'rgba(0,0,0,0.3)'}} onClick={onClose} />
      <div className="relative w-full max-w-2xl p-8 overflow-hidden text-left align-middle transition-all transform rounded-2xl" style={{backgroundColor: 'var(--sepia-50)', border: '1px solid var(--border-dark)', boxShadow: '0 10px 0 0 #C4843C'}}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6" style={{color:'#3B2F2F'}} />
            <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary-dark)'}}>Comments</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{color:'var(--text-secondary)'}}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-sm" style={{color:'var(--text-secondary)'}}>Loading...</div>
        ) : comments.length === 0 ? (
          <div className="text-sm" style={{color:'var(--text-secondary)'}}>No comments yet.</div>
        ) : (
          <ul className="space-y-4 max-h-[28rem] overflow-auto pr-2">
            {comments.map((c) => (
              <li key={c.id} className="flex items-start space-x-3">
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(c.userId || 'anon')}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="text-sm" style={{color:'var(--text-primary-dark)'}}>{c.text}</div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Composer */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1" style={{color:'var(--text-primary-dark)'}}>
            Add a comment
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 sepia-input min-h-[70px]"
            placeholder="Write your comment (anonymous)"
          />
          <div className="mt-2 flex justify-end">
            <button
              className="px-4 py-2 sepia-button"
              onClick={async () => {
                const t = text.trim();
                if (!cardId || !address || t.length === 0) return;
                const createdAt = Date.now();
                await addComment({ cardId, userId: address, text: t, createdAt });
                setComments([{ id: String(createdAt), cardId, userId: address, text: t, createdAt }, ...comments]);
                setText('');
                (window as any).dispatchEvent(new CustomEvent('new-comment', { detail: { cardId, userId: address, text: t, createdAt } }));
              }}
            >
              Submit Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;



import React, { useState } from 'react';
import { X, Plus, Shield } from 'lucide-react';
// import { CreateCardData } from '../types';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; twitterHandle: string; twitterAvatarUrl?: string }) => void;
  isLoading: boolean;
  creationFee?: string; // in ETH
  ethBalance?: string; // in ETH
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  creationFee,
  ethBalance
}) => {
  const [kolName, setKolName] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [description, setDescription] = useState('');
  const avatarUrl = twitterHandle ? `https://unavatar.io/twitter/${twitterHandle.replace('@','')}` : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kolName.trim() && twitterHandle.trim()) {
      onSubmit({ title: kolName, description, twitterHandle: twitterHandle.replace('@',''), twitterAvatarUrl: avatarUrl });
      setKolName('');
      setTwitterHandle('');
      setDescription('');
    }
  };

  const creationFeeNum = parseFloat(creationFee || '0.005');
  const ethBalanceNum = parseFloat(ethBalance || '0');
  const skipOnchain = import.meta.env.VITE_SKIP_ONCHAIN === 'true';
  const hasEnoughEth = skipOnchain ? true : ethBalanceNum >= creationFeeNum;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity" style={{backgroundColor: 'rgba(0,0,0,0.3)'}} onClick={onClose} />
      <div className="relative w-full max-w-xl p-8 overflow-hidden text-left align-middle transition-all transform rounded-2xl" style={{backgroundColor: 'var(--sepia-50)', border: '1px solid var(--border-dark)', boxShadow: '0 10px 0 0 #C4843C'}}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border" style={{backgroundColor: 'var(--sepia-300)', borderColor: 'var(--border-dark)'}}>
                <Plus className="w-6 h-6" style={{color: '#3B2F2F'}} />
              </div>
              <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary-dark)'}}>
              Create Rating Card
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors duration-200"
              style={{color: 'var(--text-secondary)'}}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {(creationFee || "0.005") && (
          <div className="mb-2 flex justify-end">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{backgroundColor: 'var(--sepia-100)', color: '#5B4A3A', border: '1px solid var(--border-dark)'}}>
              Card creation fee: {creationFee || "0.005"} ETH
            </span>
          </div>
        )}

          <div className="mb-3 p-3 rounded-lg" style={{backgroundColor: 'var(--sepia-100)', border: '1px solid var(--border-dark)'}}>
            <div className="text-sm" style={{color: 'var(--text-secondary)'}}>
              {twitterHandle ? (
                <>You are creating a rating card for <span className="font-semibold" style={{color:'#5B4A3A'}}>@{twitterHandle.replace('@','')}</span>.</>
              ) : (
                <>Enter the name and X handle to create a rating card (works for creators, KOLs, influencers, or any X profile).</>
              )}
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: 'var(--sepia-100)', border: '1px solid var(--border-dark)'}}>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 mt-0.5" style={{color: 'var(--sepia-600)'}} />
              <div>
                <p className="text-sm font-medium" style={{color: '#5B4A3A'}}>
                  Privacy First
                </p>
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                All ratings are encrypted and anonymous. Only average ratings are visible.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="kolName" className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary-dark)'}}>
                  Name or Profile Title *
                </label>
                <input
                  type="text"
                  id="kolName"
                  required
                  value={kolName}
                  onChange={(e) => setKolName(e.target.value)}
                  className="w-full px-3 py-2 sepia-input"
                  placeholder="e.g. John Doe or Project Alpha"
                />
              </div>
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary-dark)'}}>
                  X handle (username) *
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    id="twitter"
                    required
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    className="flex-1 px-3 py-2 sepia-input"
                    placeholder="username (without @)"
                  />
                  <div className="w-14 h-14 rounded-full border" style={{borderColor: 'var(--border-dark)', backgroundColor: 'var(--sepia-100)', overflow: 'hidden'}}>
                    {avatarUrl && (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary-dark)'}}>
              Description
              </label>
              <textarea
                id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 sepia-input min-h-[60px]"
              placeholder="Add more context or details (optional)"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg transition-colors duration-200 sepia-button"
              >
                Cancel
              </button>
              <button
                type="submit"
              disabled={isLoading || !kolName.trim() || !twitterHandle.trim() || !hasEnoughEth}
                className="flex-1 px-4 py-2 font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed sepia-button"
              >
                {isLoading ? 'Creating...' : 'Create Card'}
              </button>
            </div>

            {/* Live Preview */}
            <div className="mt-6">
              <p className="text-sm mb-2" style={{color:'var(--text-secondary)'}}>Preview</p>
              <div className="sticky-note p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-full border" style={{borderColor: 'var(--border-dark)', overflow:'hidden', backgroundColor: 'var(--sepia-100)'}}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <div className="text-base font-semibold" style={{color:'var(--text-primary-dark)'}}>{kolName || 'Name / Profile'}</div>
                    <div className="text-xs" style={{color:'var(--text-secondary)'}}>{twitterHandle ? `@${twitterHandle.replace('@','')}` : '@handle'}</div>
                  </div>
                </div>
                <div className="text-sm" style={{color:'var(--text-secondary)'}}>
                  {description || 'Short description about the person/profile or what to rate.'}
                </div>
              </div>
            </div>
          </form>

        {!hasEnoughEth && !skipOnchain && (
          <div className="text-xs mt-2 text-center" style={{color: '#e53e3e'}}>
            Insufficient ETH to pay the creation fee.
        </div>
        )}
      </div>
    </div>
  );
};

export default CreateCardModal;
import React, { useState } from 'react';
import { X, Plus, Shield } from 'lucide-react';
import { CreateCardData } from '../types';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string }) => void;
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({ title, description });
      setTitle('');
      setDescription('');
    }
  };

  const creationFeeNum = parseFloat(creationFee || '0.15');
  const ethBalanceNum = parseFloat(ethBalance || '0');
  const hasEnoughEth = ethBalanceNum >= creationFeeNum;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-xl rounded-2xl border border-white/20 dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full">
                <Plus className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create Rating Card
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {(creationFee || "0.15") && (
          <div className="mb-2 flex justify-end">
            <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-semibold border border-yellow-300 dark:border-yellow-700">
              Card creation fee: {creationFee || "0.15"} ETH
            </span>
          </div>
        )}

          <div className="mb-6 p-4 bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Privacy First
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                All ratings are encrypted and anonymous. Only average ratings are visible.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Title *
              </label>
              <input
                type="text"
                id="title"
                required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/80 dark:bg-black/40 dark:text-white backdrop-blur-sm"
                placeholder="What would you like feedback on?"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
              </label>
              <textarea
                id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/80 dark:bg-black/40 dark:text-white backdrop-blur-sm min-h-[60px]"
              placeholder="Add more context or details (optional)"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
              disabled={isLoading || !title.trim() || !hasEnoughEth}
                className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-black font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Card'}
              </button>
            </div>
          </form>

        {!hasEnoughEth && (
          <div className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
            Insufficient ETH to pay the creation fee.
        </div>
        )}
      </div>
    </div>
  );
};

export default CreateCardModal;
import React from 'react';
import { X, Shield, Lock } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen">
      <div className="fixed inset-0 transition-opacity" style={{backgroundColor: 'rgba(0,0,0,0.3)'}} onClick={onClose} />
      <div className="relative w-full max-w-xl p-8 overflow-hidden text-left align-middle transition-all transform rounded-2xl sticky-note">
        <div className="sticky-pin" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border" style={{backgroundColor: 'var(--sepia-300)', borderColor: 'var(--border-dark)'}}>
              <Lock className="w-6 h-6" style={{color: '#3B2F2F'}} />
            </div>
            <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary-dark)'}}>
              Connect Wallet to Continue
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

        <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: 'var(--sepia-100)', border: '1px solid var(--border-dark)'}}>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 mt-0.5" style={{color: 'var(--sepia-600)'}} />
            <div>
              <p className="text-sm font-medium" style={{color: '#5B4A3A'}}>
                Private Ratings Require Wallet
              </p>
              <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                Connect your wallet to view decrypted ratings and submit anonymous reviews powered by ZAMA FHE.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg transition-colors duration-200 sepia-button"
          >
            Browse Cards
          </button>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="flex-1 px-4 py-2 font-medium rounded-lg transition-colors duration-200 sepia-button"
              >
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionModal;

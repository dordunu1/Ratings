import React from 'react';
import { Shield, Plus } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface HeaderProps {
  onCreateCard: () => void;
  totalCards: number;
}

const Header: React.FC<HeaderProps> = ({ onCreateCard, totalCards }) => {
  const { isConnected } = useAccount();
  return (
    <header className="shadow-sm border-b transition-colors duration-300" style={{backgroundColor: 'var(--sepia-200)', borderColor: 'var(--border-dark)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border" style={{backgroundColor: 'var(--sepia-300)', borderColor: 'var(--border-dark)'}}>
              <Shield className="w-6 h-6" style={{color: '#3B2F2F'}} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{color: 'var(--text-primary-dark)'}}>
                Rate KOLs, X Profiles & Influencers
              </h1>
              <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                Private, on-chain ratings · {totalCards} cards
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, authenticationStatus, mounted }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready && account && chain &&
                  (authenticationStatus === undefined || authenticationStatus === 'authenticated');
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="sepia-button text-lg"
                    >
                      Connect Wallet
                    </button>
                  );
                }
                // Fallback to default ConnectButton for connected state
                return <ConnectButton />;
              }}
            </ConnectButton.Custom>
            {isConnected && (
              <button
                onClick={onCreateCard}
                className="inline-flex items-center sepia-button font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Card
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
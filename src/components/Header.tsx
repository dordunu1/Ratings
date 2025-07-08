import React from 'react';
import { Shield, Plus } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface HeaderProps {
  onCreateCard: () => void;
  totalCards: number;
}

const Header: React.FC<HeaderProps> = ({ onCreateCard, totalCards }) => {
  const { address, isConnected } = useAccount();
  // Helper to shorten address
  const shortenAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  return (
    <header className="backdrop-blur-md shadow-sm border-b transition-colors duration-300 bg-black/80 border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Private Ratings
              </h1>
              <p className="text-sm text-gray-400">
                {totalCards} active cards
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
                      className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg text-lg shadow transition-colors duration-200"
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
                className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
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
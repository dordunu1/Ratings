import React, { useState, useEffect, useRef } from 'react';
import { Shield, Plus, ChevronDown, LogOut } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

interface HeaderProps {
  onCreateCard: () => void;
  totalCards: number;
}

const Header: React.FC<HeaderProps> = ({ onCreateCard, totalCards }) => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
          <div className="flex items-center space-x-8">
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
                // Custom connected state with dropdown
                return (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="sepia-button text-sm flex items-center space-x-2"
                    >
                      <span>{account.displayName}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50" style={{backgroundColor: 'var(--sepia-50)', border: '1px solid var(--border-dark)'}}>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              disconnect();
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-sm flex items-center space-x-2 hover:bg-opacity-80 transition-colors"
                            style={{color: 'var(--text-primary-dark)'}}
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Disconnect</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
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
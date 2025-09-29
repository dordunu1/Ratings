import React from 'react';
import { Shield, Lock, Users, ArrowRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center transition-all duration-300 p-4" style={{backgroundColor: 'var(--sepia-100)'}}>
      <div className="max-w-2xl w-full rounded-3xl p-8 flex flex-col items-center animate-in" style={{backgroundColor: 'var(--sepia-50)', border: '1px solid var(--border-dark)', boxShadow: '0 10px 0 0 #C4843C'}}>
        <div className="flex items-center gap-3 mb-4">
          <Shield size={36} style={{color: '#3B2F2F'}} />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{color: 'var(--text-primary-dark)'}}>Rate KOLs & X Influencers</h1>
        </div>
        <p className="text-lg sm:text-xl mb-6 text-center font-medium" style={{color: 'var(--text-secondary)'}}>
          Anonymous, on-chain ratings for your favorite creators — powered by <span className="font-bold" style={{color: 'var(--sepia-600)'}}>ZAMA FHE</span>
        </p>

        <div className="space-y-6 w-full mb-8">
          <div className="flex items-start gap-4">
            <Lock className="flex-shrink-0 mt-1.5" size={28} style={{color: 'var(--sepia-600)'}} />
            <div>
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-2" style={{color: 'var(--text-primary-dark)'}}>
                Why privacy matters for KOL ratings <Sparkles className="text-yellow-400" size={18} />
              </h2>
              <p style={{color: 'var(--text-secondary)'}}>
                Public scores invite bias and retaliation. Here, your vote stays <span className="font-bold" style={{color: 'var(--sepia-600)'}}>fully confidential</span> while aggregates remain verifiable.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Shield className="flex-shrink-0 mt-1.5" size={28} style={{color: 'var(--sepia-600)'}} />
            <div>
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-2" style={{color: 'var(--text-primary-dark)'}}>
                What is ZAMA FHE?
              </h2>
              <p style={{color: 'var(--text-secondary)'}}>
                <span className="font-bold">Fully Homomorphic Encryption (FHE)</span> lets us compute on encrypted data directly on-chain. Ratings are encrypted end‑to‑end and only revealed as aggregates.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Users className="flex-shrink-0 mt-1.5" size={28} style={{color: 'var(--sepia-600)'}} />
            <div>
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-2" style={{color: 'var(--text-primary-dark)'}}>
                Why we chose ZAMA
              </h2>
              <p style={{color: 'var(--text-secondary)'}}>
                ZAMA’s FHEVM enables <span className="font-bold text-primary">confidential, on‑chain ratings</span> without sacrificing transparency or security.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onEnter}
          className="flex items-center gap-2 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 sepia-button"
        >
          Enter Ratings <ArrowRight size={22} />
        </button>
      </div>
      <div className="mt-8 text-center text-xs" style={{color: 'var(--text-secondary)'}}>
        Powered by <a href="https://zama.ai" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{color: 'var(--sepia-600)'}}>ZAMA FHE</a> · <a href="https://docs.zama.ai" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{color: 'var(--sepia-600)'}}>Learn More</a>
      </div>
    </div>
  );
};

export default LandingPage;
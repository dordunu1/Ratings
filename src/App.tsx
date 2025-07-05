import React, { useState, useEffect, useMemo } from 'react';
import { ReviewCard, CreateCardData } from './types';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CardGrid from './components/CardGrid';
import CreateCardModal from './components/CreateCardModal';
import ReviewModal from './components/ReviewModal';
import Toast from './components/Toast';
import { useTheme } from './hooks/useTheme';
import { initializeFheInstance, getDecryptedStats } from './utils/fheInstance';
import { addCardWithRandomId, updateCardId, getAllCards } from './utils/cardsFirestore';
import { addRating, getRatingCount } from './utils/ratingsFirestore';
import { useAccount, useConnect } from 'wagmi';
import LandingPage from './components/LandingPage';
import { ethers } from 'ethers';
import { REVIEW_CONTRACT_ABI, REVIEW_CONTRACT_ADDRESS, createReviewCardOnChain, submitEncryptedRatingOnChain, encryptReviewRating } from './utils/reviewContract';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Set your contract address here or from env
const CONTRACT_ADDRESS = import.meta.env.VITE_REVIEW_CARDS_CONTRACT;

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ReviewCard | null>(null);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const { theme } = useTheme();
  const { address, } = useAccount();
  const { connect, connectors } = useConnect();
  const [showMain, setShowMain] = useState(false);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);
  const [creationFee, setCreationFee] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'encrypting' | 'reviewing'>('idle');
  const [ethBalance, setEthBalance] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  // Add a flag to indicate relayer is down (since decryption is disabled)
  const relayerDown = true;

  useEffect(() => {
    initializeFheInstance();
  }, []);

  // Fetch cards on mount and after creation
  const fetchCards = async () => {
    const all = await getAllCards();
    
    // Create contract instance for decryption
    let contract: any = null;
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        contract = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_CONTRACT_ABI, provider);
      }
    } catch (error) {
      console.error('Error creating contract instance:', error);
    }
    
    // Fetch review count and decrypted stats for each card in parallel
    const cardsWithStats = await Promise.all(
      (all as any[]).filter(card => card.docId && card.title && card.createdAt).map(async card => {
        const totalReviews = (card.id !== undefined) ? await getRatingCount(card.id) : 0;

        let averageRating = 0;
        let isDecrypting = false;
        if (card.id !== undefined && contract) {
          try {
            isDecrypting = true;
            const stats = await getDecryptedStats(parseInt(card.id), contract);
            averageRating = stats.average;
            isDecrypting = false;
          } catch (error: any) {
            // If relayer is down, keep isDecrypting true
            if (error?.message?.includes('Decryption service is temporarily unavailable') || error?.message?.includes('Failed to fetch')) {
              isDecrypting = true;
            } else {
              isDecrypting = false;
            }
            averageRating = 0;
          }
        }

        return { 
          ...card, 
          totalReviews,
          averageRating,
          isDecrypting
        };
      })
    );
    setCards(cardsWithStats);
  };
  useEffect(() => { fetchCards(); }, []);

  // Fetch creation fee from contract
  useEffect(() => {
    async function fetchFee() {
      try {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_CONTRACT_ABI, provider);
        const fee = await contract.creationFee();
        setCreationFee(ethers.formatEther(fee));
      } catch {}
    }
    fetchFee();
  }, []);

  // Fetch ETH balance for the connected wallet
  useEffect(() => {
    async function fetchEthBalance() {
      if (!address || !window.ethereum) {
        setEthBalance('');
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        setEthBalance(ethers.formatEther(balance));
      } catch {
        setEthBalance('');
      }
    }
    fetchEthBalance();
  }, [address]);

  // Check if the user has already voted for the selected card
  useEffect(() => {
    const checkHasVoted = async () => {
      if (!selectedCard || !address) {
        setHasVoted(false);
        return;
      }
      try {
        // Firestore: cards/{cardId}/ratings/{userId}
        const db = getFirestore();
        const ratingDoc = doc(db, 'cards', selectedCard.id, 'ratings', address);
        const ratingSnap = await getDoc(ratingDoc);
        setHasVoted(ratingSnap.exists());
      } catch {
        setHasVoted(false);
      }
    };
    checkHasVoted();
  }, [selectedCard, address]);

  // Handler for creating a card (Firestore first, then on-chain)
  const handleCreateCard = async ({ title, description }: { title: string; description?: string }) => {
    if (!address) {
      setToast({ message: 'Connect your wallet first!', isVisible: true });
      // Try to trigger wallet connect popup
      if (connectors && connectors.length > 0) connect({ connector: connectors[0] });
      return;
    }
    setIsCreateLoading(true);
    try {
      // 1. Create Firestore card with random doc ID
      const createdAt = Date.now();
      const docRef = await addCardWithRandomId({ title, description, creator: address, createdAt });
      setPendingDocId(docRef.id);
      setToast({ message: 'Card created! Waiting for on-chain confirmation...', isVisible: true });
      fetchCards();

      // 2. Send transaction to contract using utility
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const receipt = await createReviewCardOnChain(signer, creationFee || '0.15');

      // 3. Find CardCreated event for this user
      const contract = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_CONTRACT_ABI, provider);
      const event = receipt.logs
        ?.map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed: any) => parsed && parsed.name === 'CardCreated' && parsed.args.creator.toLowerCase() === address.toLowerCase());
      if (event) {
        const cardId = event.args.cardId.toString();
        // 4. Update Firestore doc with on-chain cardId
        await updateCardId(docRef.id, cardId);
        setToast({ message: 'Card confirmed on-chain!', isVisible: true });
        fetchCards();
        setIsCreateModalOpen(false);
      } else {
        setToast({ message: 'On-chain card creation event not found.', isVisible: true });
      }
    } catch (err: any) {
      setToast({ message: 'Error creating card: ' + (err.message || err), isVisible: true });
    } finally {
      setIsCreateLoading(false);
      setPendingDocId(null);
    }
  };

  // Handler for submitting a review/rating
  const handleSubmitReview = async ({ rating }: { rating: number }) => {
    if (!address || !selectedCard) return;
    setIsReviewLoading(true);
    setReviewStatus('encrypting');
    // Yield to event loop so UI updates before encryption
    await new Promise(resolve => setTimeout(resolve, 0));
    try {
      // 1. Encrypt the rating using FHE
      const { encryptedHex, proofHex } = await encryptReviewRating(rating, REVIEW_CONTRACT_ADDRESS, address);
      setReviewStatus('reviewing');
      // 2. Submit encrypted rating on-chain
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_CONTRACT_ABI, signer);
      const tx = await contract.submitEncryptedRating(selectedCard.id, encryptedHex, proofHex, { gasLimit: 500000 });
      console.log('Review TX:', tx);
      const receipt = await tx.wait();
      console.log('Review Receipt:', receipt);
      // 3. Write to Firestore only if on-chain tx succeeds
      const createdAt = Date.now();
      await addRating({
        cardId: selectedCard.id,
        userId: address,
        rating,
        createdAt,
      });
      setToast({ message: 'Rating submitted!', isVisible: true });
      setIsReviewModalOpen(false);
      setIsReviewLoading(false);
      fetchCards();
    } catch (err: any) {
      console.error('Review error:', err);
      setToast({ message: 'Error submitting rating: ' + (err.message || err), isVisible: true });
      setIsReviewLoading(false);
    } finally {
      setReviewStatus('idle');
    }
  };

  // Filter cards by search query
  const filteredCards = useMemo(() => {
    return cards.filter(card =>
      card.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cards, searchQuery]);

  if (!showMain) {
    return <LandingPage onEnter={() => setShowMain(true)} />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-black">
      {/* Relayer down badge */}
      {relayerDown && (
        <div className="w-full bg-yellow-400 text-black text-center py-2 font-semibold shadow-md z-50">
          Decryption relayer is down for maintenance. As soon as it comes up, ratings will be revealed.
        </div>
      )}
      <Header 
        onCreateCard={() => setIsCreateModalOpen(true)}
        totalCards={cards.length}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 transition-colors duration-300 text-white">
                Community Feedback Platform
              </h2>
              <p className="text-lg transition-colors duration-300 text-gray-300">
                Share topics for anonymous feedback. Your ratings stay 100% private.
              </p>
            </div>
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search cards..."
            />
          </div>
        </div>
        <CardGrid 
          cards={filteredCards}
          onCardClick={card => {
            setSelectedCard(card);
            setIsReviewModalOpen(true);
          }}
        />
        <CreateCardModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCard}
          isLoading={isCreateLoading}
          creationFee={creationFee}
          ethBalance={ethBalance}
        />
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedCard(null);
          }}
          onSubmit={handleSubmitReview}
          card={selectedCard}
          isLoading={isReviewLoading}
          reviewStatus={reviewStatus}
          hasVoted={hasVoted}
        />
        <Toast
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast({ message: '', isVisible: false })}
        />
      </main>
    </div>
  );
}

export default App;
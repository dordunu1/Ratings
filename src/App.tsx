import { useState, useEffect, useMemo } from 'react';
import { ReviewCard } from './types';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CardGrid from './components/CardGrid';
import CreateCardModal from './components/CreateCardModal';
import ReviewModal from './components/ReviewModal';
import CommentsModal from './components/CommentsModal';
import Toast from './components/Toast';
import { useTheme } from './hooks/useTheme';
import { initializeFheInstance, decryptStatsWithDeadline } from './utils/fheInstance';
import { addCardWithRandomId, updateCardId, getAllCards } from './utils/cardsFirestore';
import { addRating, getRatingCount } from './utils/ratingsFirestore';
import { addComment } from './utils/commentsFirestore';
import { useAccount, useConnect } from 'wagmi';
import LandingPage from './components/LandingPage';
import { ethers } from 'ethers';
import { REVIEW_CONTRACT_ABI, REVIEW_CONTRACT_ADDRESS, createReviewCardOnChain, encryptReviewRating } from './utils/reviewContract';
import { getFirestore, doc, getDoc } from 'firebase/firestore';


function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsCardId, setCommentsCardId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ReviewCard | null>(null);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const { } = useTheme();
  const { address, } = useAccount();
  const { connect, connectors } = useConnect();
  const [showMain, setShowMain] = useState(() => {
    try {
      return localStorage.getItem('rm_seenLanding') === '1';
    } catch {
      return false;
    }
  });
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [, setPendingDocId] = useState<string | null>(null);
  const [creationFee, setCreationFee] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'encrypting' | 'reviewing'>('idle');
  const [ethBalance, setEthBalance] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  // Add a flag to indicate relayer is down (since decryption is disabled)
  const [, setIsFheReady] = useState(false);
  const [isCardsLoading, setIsCardsLoading] = useState(true);

  useEffect(() => {
    const initAndFetch = async () => {
      await initializeFheInstance();
      setIsFheReady(true);
      await fetchCards();
    };
    initAndFetch();
    const handler = (e: any) => {
      setIsReviewModalOpen(false);
      setCommentsCardId(e.detail.cardId as string);
      setIsCommentsOpen(true);
    };
    (window as any).addEventListener('open-comments', handler);
    return () => (window as any).removeEventListener('open-comments', handler);
  }, []);

  // Fetch cards on mount and after creation
  const fetchCards = async () => {
    setIsCardsLoading(true);
    const all = await getAllCards();
    // Fetch totalReviews for each card immediately
    const cardsWithCounts = await Promise.all(
      (all as any[]).filter(card => card.docId && (card.kolName || card.twitterHandle || card.title) && card.createdAt).map(async card => {
        const totalReviews = (card.id && typeof card.id === 'string' && card.id.trim() !== '') ? await getRatingCount(card.id) : 0;
        return {
          ...card,
          totalReviews,
          averageRating: 0,
          isDecrypting: true,
          decryptionError: false,
        };
      })
    );
    setCards(cardsWithCounts);
    setIsCardsLoading(false);

    // Create contract instance for decryption
    let contract: any = null;
    try {
      const rpcUrl = (import.meta as any).env?.VITE_SEPOLIA_RPC_URL as string | undefined;
      if (rpcUrl && rpcUrl.length > 0) {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        contract = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_CONTRACT_ABI, provider);
      } else if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        contract = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_CONTRACT_ABI, provider);
      }
    } catch (error) {
    }

    // Decrypt stats sequentially with a small delay to avoid relayer/RPC bursts
    for (let idx = 0; idx < cardsWithCounts.length; idx++) {
      const card = cardsWithCounts[idx];
      let averageRating = 0;
      let isDecrypting = false;
      let decryptionError = false;
      if (card.id !== undefined && contract) {
        try {
          isDecrypting = true;
          const result = await decryptStatsWithDeadline(parseInt(card.id), contract, 30000);
          averageRating = result ? result.average : 0;
          isDecrypting = false;
        } catch (error: any) {
          if (error?.message?.includes('Decryption service is temporarily unavailable') || error?.message?.includes('Failed to fetch')) {
            isDecrypting = false;
            decryptionError = true;
          } else {
            isDecrypting = false;
            decryptionError = true;
          }
          averageRating = 0;
        }
      }
      setCards(prevCards => {
        const updated = [...prevCards];
        updated[idx] = {
          ...updated[idx],
          averageRating,
          isDecrypting,
          decryptionError,
        };
        return updated;
      });
      // wait ~3 seconds before the next decryption to smooth out load
      await new Promise(res => setTimeout(res, 3000));
    }
  };

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
  const handleCreateCard = async ({ title, description, twitterHandle, twitterAvatarUrl }: { title: string; description?: string; twitterHandle: string; twitterAvatarUrl?: string }) => {
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
      // Save twitterHandle also in legacy 'title' field for compatibility
      const docRef = await addCardWithRandomId({ title: twitterHandle, description, creator: address, createdAt, kolName: title, twitterHandle, twitterAvatarUrl });
      setPendingDocId(docRef.id);
      setToast({ message: 'Card created! Waiting for on-chain confirmation...', isVisible: true });
      fetchCards();

      // 2. Optionally skip on-chain for FE testing
      const skipOnchain = import.meta.env.VITE_SKIP_ONCHAIN === 'true';
      if (skipOnchain) {
        const tempCardId = Date.now().toString();
        await updateCardId(docRef.id, tempCardId);
        setToast({ message: 'Card created (FE testing mode).', isVisible: true });
        fetchCards();
        setIsCreateModalOpen(false);
        return;
      }

      // 3. Send transaction to contract using utility
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // Ensure we always send at least the on-chain fee
      const feeToPay = (creationFee && parseFloat(creationFee) > 0) ? creationFee : '0.005';
      const receipt = await createReviewCardOnChain(signer, feeToPay);

      // 4. Find CardCreated event for this user
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
        // 5. Update Firestore doc with on-chain cardId
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
  const handleSubmitReview = async ({ rating, comment }: { rating: number; comment?: string }) => {
    if (!address || !selectedCard) return;
    setIsReviewLoading(true);
    // Only encrypt/tx when submitting a new rating
    if (!(reviewStatus === 'reviewing') && !(reviewStatus === 'encrypting')) {}
    setReviewStatus('encrypting');
    // Yield to event loop so UI updates before encryption
    await new Promise(resolve => setTimeout(resolve, 0));
    try {
      const skipOnchain = import.meta.env.VITE_SKIP_ONCHAIN === 'true';
      const submittingCommentOnly = rating === 0;
      if (!skipOnchain && !submittingCommentOnly) {
        // 1. Encrypt the rating using FHE
        const { encryptedHex, proofHex } = await encryptReviewRating(rating, REVIEW_CONTRACT_ADDRESS, address);
        setReviewStatus('reviewing');
        // 2. Submit encrypted rating on-chain
        if (!window.ethereum) throw new Error('No wallet found');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_CONTRACT_ABI, signer);
        const tx = await contract.submitEncryptedRating(selectedCard.id, encryptedHex, proofHex, { gasLimit: 500000 });
        await tx.wait();
      }
      // 3. Write to Firestore
      const createdAt = Date.now();
      if (!submittingCommentOnly) {
        await addRating({
          cardId: selectedCard.id,
          userId: address,
          rating,
          createdAt,
          comment,
        });
      }
      if (comment && comment.trim().length > 0) {
        await addComment({ cardId: selectedCard.id, userId: address, text: comment, createdAt });
      }
      setToast({ message: 'Rating submitted!', isVisible: true });
      setIsReviewModalOpen(false);
      setIsReviewLoading(false);
      fetchCards();
    } catch (err: any) {
    } finally {
      setReviewStatus('idle');
    }
  };

  // Filter cards by search query
  const filteredCards = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cards.filter(card => {
      const name = (card.kolName || '').toLowerCase();
      const handle = (card.twitterHandle || card.title || '').toLowerCase();
      return name.includes(q) || handle.includes(q);
    });
  }, [cards, searchQuery]);

  if (!showMain) {
    return <LandingPage onEnter={() => { try { localStorage.setItem('rm_seenLanding', '1'); } catch {} setShowMain(true); }} />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{backgroundColor: 'var(--sepia-100)'}}>
      {/* Relayer down badge */}
      <Header 
        onCreateCard={() => setIsCreateModalOpen(true)}
        totalCards={cards.length}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 transition-colors duration-300" style={{color: 'var(--text-primary-dark)', transform: 'rotate(-0.5deg)'}}>
                Rate KOLs, X Profiles & X Influencers
              </h2>
              <p className="text-lg transition-colors duration-300" style={{color: 'var(--text-secondary)'}}>
                Anonymous, on-chain ratings powered by ZAMA FHE. Private ratings, public aggregates.
              </p>
            </div>
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search KOLs or @handles..."
            />
          </div>
        </div>
        <CardGrid 
          cards={filteredCards}
          onCardClick={card => {
            setSelectedCard(card);
            setIsReviewModalOpen(true);
          }}
          loading={isCardsLoading}
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
        <CommentsModal
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          cardId={commentsCardId}
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
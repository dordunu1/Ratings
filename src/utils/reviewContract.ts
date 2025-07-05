import { getFheInstance } from './fheInstance';
import { hexlify, ethers } from 'ethers'; // or viem/utils if using viem
import ReviewCardsFHE_ABI from '../abi/ReviewCardsFHE.json';

// Export the ABI for use in contract interactions
export const REVIEW_CONTRACT_ABI = ReviewCardsFHE_ABI.abi;

// Export the deployed contract address from .env
export const REVIEW_CONTRACT_ADDRESS = import.meta.env.VITE_REVIEW_CONTRACT_ADDRESS;

/**
 * Encrypt a review rating (1-5) for the Review contract.
 * @param rating number (1-5)
 * @param contractAddress string
 * @param userAddress string
 */
export async function encryptReviewRating(rating: number, contractAddress: string, userAddress: string) {
  const fhe = getFheInstance();
  if (!fhe) throw new Error('FHE instance not initialized');

  // Convert contract address to checksum format
  const contractAddressChecksum = ethers.getAddress(contractAddress);
  console.log('FHE encryption params:', {
    contractAddress,
    contractAddressChecksum,
    userAddress,
    rating
  });

  // Create encrypted input for the review contract
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);
  ciphertext.add64(rating); // Use add64 for 1-5 star ratings (now 64-bit)
  const { handles, inputProof } = await ciphertext.encrypt();
  const encryptedHex = hexlify(handles[0]);
  const proofHex = hexlify(inputProof);

  console.log('Encrypted review rating:', { encryptedHex, proofHex });
  return { encryptedHex, proofHex };
}

/**
 * Create a review card on-chain.
 * @param signer ethers.Signer
 * @param creationFee string (in ETH)
 * @returns transaction receipt
 */
export async function createReviewCardOnChain(signer: any, creationFee: string) {
  const contract = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_CONTRACT_ABI, signer);
  const tx = await contract.createReviewCard({ value: ethers.parseEther(creationFee) });
  return await tx.wait();
}

/**
 * Submit an encrypted rating on-chain.
 * @param signer ethers.Signer
 * @param cardId string or number
 * @param encryptedRating bytes32 or string
 * @param proofHex bytes or string
 * @returns transaction receipt
 */
export async function submitEncryptedRatingOnChain(signer: any, cardId: string | number, encryptedRating: string, proofHex: string) {
  const contract = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_CONTRACT_ABI, signer);
  console.log('Submitting encrypted rating on-chain:', {
    contractAddress: REVIEW_CONTRACT_ADDRESS,
    cardId,
    encryptedRating,
    proofHex
  });
  const tx = await contract.submitEncryptedRating(cardId, encryptedRating, proofHex);
  return await tx.wait();
}

// TODO: Add contract interaction functions (submitEncryptedRating, getEncryptedStats, etc.) after deployment 
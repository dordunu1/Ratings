import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/bundle";

let fheInstance: any = null;

export async function initializeFheInstance() {
  await initSDK(); // Loads WASM from the default path (public/tfhe_bg.wasm or similar)
  const config = { ...SepoliaConfig, network: (window as any).ethereum };
  console.log('FHE SDK config:', config);
  fheInstance = await createInstance(config);
  console.log('FHE instance initialized:', fheInstance);
  return fheInstance;
}

export function getFheInstance() {
  return fheInstance;
}

// Decrypt a single encrypted value using the relayer
export async function decryptValue(encryptedBytes: string): Promise<number> {
  const fhe = getFheInstance();
  if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');

  try {
    // Always pass an array of hex strings
    let handle = encryptedBytes;
    if (typeof handle === "string" && handle.startsWith("0x") && handle.length === 66) {
      const values = await fhe.publicDecrypt([handle]);
      // values is an object: { [handle]: value }
      return Number(values[handle]);
    } else {
      throw new Error('Invalid ciphertext handle for decryption');
    }
  } catch (error: any) {
    // Check for relayer/network error
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      throw new Error('Decryption service is temporarily unavailable. Please try again later.');
    }
    console.error('Error decrypting value:', error);
    throw error;
  }
}

// Get decrypted stats (sum and count) and compute average
export async function getDecryptedStats(
  cardId: number, 
  contract: any
): Promise<{ sum: number; count: number; average: number }> {
  try {
    const fhe = getFheInstance();
    if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');

    // Get encrypted sum and count from the contract using getEncryptedStats
    const { sum: encryptedSum, count: encryptedCount } = await contract.getEncryptedStats(cardId);

    // Decrypt both values
    const sum = await decryptValue(encryptedSum);
    const count = await decryptValue(encryptedCount);

    // Calculate average
    const average = count > 0 ? sum / count : 0;

    return { sum, count, average };
  } catch (error: any) {
    console.error('Error getting decrypted stats:', error);
    // Return fallback values if decryption fails
    return { sum: 0, count: 0, average: 0 };
  }
}

// Helper function to format average rating for display
export function formatAverageRating(average: number, totalReviews?: number): string {
  if (totalReviews && totalReviews > 0 && average === 0) return 'Encrypted'; // fallback if decryption fails
  if (average === 0) return 'No ratings yet';
  return average.toFixed(1);
}

// Debug function to test decryption
export async function testDecryption(contract: any, cardId: number) {
  try {
    console.log('Testing decryption for card:', cardId);
    const stats = await getDecryptedStats(cardId, contract);
    console.log('Test decryption result:', stats);
    return stats;
  } catch (error) {
    console.error('Test decryption failed:', error);
    throw error;
  }
} 
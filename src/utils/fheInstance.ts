// NOTE: dynamically import from CDN to avoid local bundling/WASM MIME issues
let fheInstance: any = null as any;

export async function initializeFheInstance() {
  if (fheInstance) return fheInstance;
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
  }

  // Load SDK from CDN (0.2.0 browser bundle)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - HTTP import resolved by browser, not TypeScript
  const sdk: any = await import('https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js');
  const { initSDK, createInstance, SepoliaConfig } = sdk as any;

  await initSDK(); // Initializes the SDK with CDN-loaded WASM
  const config = { ...SepoliaConfig, network: (window as any).ethereum };
  fheInstance = await createInstance(config);
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
    throw error;
  }
}

async function decryptWithRetry(encryptedBytes: string, maxAttempts = 3): Promise<number> {
  let lastErr: any;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await decryptValue(encryptedBytes);
    } catch (error: any) {
      lastErr = error;
      const msg = String(error?.message || '').toLowerCase();
      const isTransient = msg.includes('failed to fetch') || msg.includes('temporarily unavailable') || msg.includes('network');
      if (!isTransient) break;
      const backoffMs = 250 * Math.pow(2, i);
      await new Promise(res => setTimeout(res, backoffMs));
    }
  }
  throw lastErr;
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
    try {
      // Diagnostic log of ciphertexts used for decryption
      console.log('[FHE] getEncryptedStats', {
        cardId: String(cardId),
        encryptedSum,
        encryptedCount,
        ua: (typeof navigator !== 'undefined' ? navigator.userAgent : 'node')
      });
    } catch {}

    // Decrypt both values with tiny spacing to avoid throttling
    const sum = await decryptWithRetry(encryptedSum, 4);
    await new Promise(res => setTimeout(res, 150));
    const count = await decryptWithRetry(encryptedCount, 4);

    try {
      console.log('[FHE] decrypted', { cardId: String(cardId), sum, count });
    } catch {}

    // Calculate average
    const average = count > 0 ? sum / count : 0;

    return { sum, count, average };
  } catch (error: any) {
    // Return fallback values if decryption fails
    return { sum: 0, count: 0, average: 0 };
  }
}

// Read getEncryptedStats until two consecutive reads agree (helps avoid transient RPC/skew issues)
export async function getStableEncryptedStats(
  cardId: number,
  contract: any,
  maxAttempts = 3
): Promise<{ encryptedSum: string; encryptedCount: string }> {
  let last: { s: string; c: string } | null = null;
  for (let i = 0; i < maxAttempts; i++) {
    const r = await contract.getEncryptedStats(cardId);
    const s = (r?.sum || r?.[0]) as string;
    const c = (r?.count || r?.[1]) as string;
    if (last && last.s === s && last.c === c) {
      return { encryptedSum: s, encryptedCount: c };
    }
    last = { s, c };
    // tiny delay before retry (avoid hammering)
    await new Promise(res => setTimeout(res, 50));
  }
  // Return last seen if stability not achieved
  return { encryptedSum: last?.s || '0x', encryptedCount: last?.c || '0x' };
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
    const stats = await getDecryptedStats(cardId, contract);
    return stats;
  } catch (error) {
    throw error;
  }
} 

// Decrypt with a time budget: keep trying stable-reads + decrypt until deadline
export async function decryptStatsWithDeadline(
  cardId: number,
  contract: any,
  deadlineMs = 20000
): Promise<{ sum: number; count: number; average: number } | null> {
  const end = Date.now() + Math.max(2000, deadlineMs);
  let attempt = 0;
  while (Date.now() < end) {
    attempt++;
    try {
      const { encryptedSum, encryptedCount } = await getStableEncryptedStats(cardId, contract, 3);
      console.log('[FHE] attempt stable stats', { cardId: String(cardId), encryptedSum, encryptedCount, attempt });
      const sum = await decryptWithRetry(encryptedSum, 4);
      await new Promise(res => setTimeout(res, 150));
      const count = await decryptWithRetry(encryptedCount, 4);
      const average = count > 0 ? sum / count : 0;
      console.log('[FHE] success decrypt', { cardId: String(cardId), sum, count, average, attempt });
      return { sum, count, average };
    } catch (error: any) {
      const backoff = Math.min(2000, 250 * Math.pow(2, Math.min(4, attempt)));
      console.log('[FHE] decrypt retry', { cardId: String(cardId), attempt, backoff, error: String(error?.message || error) });
      await new Promise(res => setTimeout(res, backoff));
    }
  }
  console.log('[FHE] decrypt timeout', { cardId: String(cardId), budgetMs: deadlineMs });
  return null;
}
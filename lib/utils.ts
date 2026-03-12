// lib/utils.ts
// Shared utility functions

/**
 * Fix #7 — Email enumeration defense.
 * Runs a promise with a minimum wall-clock delay.
 * Ensures timing attacks can't distinguish "email exists" from "email not found"
 * by normalising response time regardless of fast DB hits vs misses.
 */
export async function withMinDelay<T>(promise: Promise<T>, minMs = 300): Promise<T> {
  const [result] = await Promise.all([promise, new Promise<void>(r => setTimeout(r, minMs))]);
  return result;
}

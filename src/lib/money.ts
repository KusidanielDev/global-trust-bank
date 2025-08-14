/** Convert a number or string (e.g., "12.34") to cents (integer). */
export const toCents = (v: unknown): number => Math.round(Number(v || 0) * 100);

/** Format cents (integer) as USD, e.g., 12345 -> "$123.45". */
export const fmtUSD = (cents: number): string =>
  ((Number.isFinite(cents) ? cents : 0) / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

/** Alias used around the app: same as toCents. */
export const getTxnCents = (v: unknown): number => toCents(v);

/**
 * Sum a list of transactions to a balance in cents.
 * Accepts undefined/null/non-array and safely returns 0.
 */
export const getBalCents = (
  txs?: Array<{ amountCents?: number | null }> | null
): number => {
  if (!Array.isArray(txs) || txs.length === 0) return 0;
  return txs.reduce((sum, t) => {
    const v = Number(t?.amountCents);
    return sum + (Number.isFinite(v) ? Math.trunc(v) : 0);
  }, 0);
};

// Strongly-typed money helpers (no 'any')

export type NumberLike = number | string | null | undefined;

export function toCents(v: NumberLike): number {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export interface TransactionLike {
  amount?: number | null;
  amountCents?: number | null;
}

export function getTxnCents<T extends TransactionLike>(
  t: T | null | undefined
): number {
  const ac = t?.amountCents;
  if (typeof ac === "number" && Number.isFinite(ac)) return ac;
  const amt = t?.amount;
  return toCents(amt ?? 0);
}

export interface AccountLike {
  balance?: number | null;
  balanceCents?: number | null;
}

export function getBalCents<T extends AccountLike>(
  a: T | null | undefined
): number {
  const bc = a?.balanceCents;
  if (typeof bc === "number" && Number.isFinite(bc)) return bc;
  const bal = a?.balance;
  return toCents(bal ?? 0);
}

export function fmtUSD(cents: number): string {
  const value = Number.isFinite(cents) ? cents : 0;
  return (value / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

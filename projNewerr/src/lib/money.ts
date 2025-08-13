export const toCents = (v: any) =>
  typeof v === "number" ? Math.round(v * 100) : Math.round(Number(v || 0));

export const getTxnCents = (t: any) =>
  typeof t?.amountCents === "number" ? t.amountCents : toCents(t?.amount);

export const getBalCents = (a: any) =>
  typeof a?.balanceCents === "number" ? a.balanceCents : toCents(a?.balance);

export const fmtUSD = (cents: number) =>
  (Number.isFinite(cents) ? cents : 0) / 100
    .toLocaleString("en-US", { style: "currency", currency: "USD" });

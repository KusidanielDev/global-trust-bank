import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toCents } from "@/lib/money";

import { Suspense } from "react";
import { SubmitButton } from "./submit-button";

export const dynamic = "force-dynamic";

/** Generate a unique 12-digit account number (string), verifying uniqueness in DB */
async function generateUniqueAccountNumber(): Promise<string> {
  function gen12(): string {
    let s = "";
    for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10);
    if (s[0] === "0") s = "1" + s.slice(1); // avoid leading zero
    return s;
  }

  // Try several random candidates; ensure not taken
  for (let i = 0; i < 10; i++) {
    const candidate = gen12();
    const exists = await prisma.bankAccount.findFirst({
      where: { accountNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  // Ultra-rare fallback: append time digits
  const fallback = (gen12() + Date.now().toString().slice(-2)).slice(0, 12);
  return fallback;
}

/** Recompute the mirrored balance inside the same DB transaction */
async function recomputeTx(tx: typeof prisma, accountId: string) {
  const sum = await tx.transaction.aggregate({
    where: { accountId },
    _sum: { amountCents: true },
  });
  await tx.bankAccount.update({
    where: { id: accountId },
    data: { balanceCents: sum._sum.amountCents ?? 0 },
  });
}

async function createAccount(formData: FormData) {
  "use server";

  try {
    const { user } = await requireSession();
    const userId = (user as any)?.id as string;
    if (!userId) throw new Error("Not authenticated");

    const name = String(formData.get("name") || "").trim();
    const type = String(formData.get("type") || "").trim();
    const openingDollars = Number(formData.get("opening") || 0);

    if (!name) throw new Error("Account name is required");
    if (!type) throw new Error("Account type is required");
    if (Number.isNaN(openingDollars) || openingDollars < 0) {
      throw new Error("Opening deposit must be a valid non-negative amount");
    }

    // Convert opening amount to cents (always store cents in DB)
    const openingCents = toCents(openingDollars);

    // Generate and enforce unique account number (schema must have accountNumber String? @unique)
    const accountNumber = await generateUniqueAccountNumber();

    // ✅ Atomic create + optional opening transaction + recompute
    const newAccountId = await prisma.$transaction(async (tx) => {
      // 1) Create the account
      const acc = await tx.bankAccount.create({
        data: {
          userId,
          name,
          type,
          accountNumber, // ✅ use account number now that schema supports it
          // balanceCents is maintained by recompute; schema default is fine
        },
        select: { id: true },
      });

      // 2) Optional opening deposit — cents ONLY
      if (openingCents > 0) {
        await tx.transaction.create({
          data: {
            accountId: acc.id,
            description: "Opening deposit",
            amountCents: openingCents, // ✅ cents only (no `amount`)
            date: new Date(),
            category: "Deposit",
          },
        });
      }

      // 3) Mirror recompute inside the same DB transaction
      await recomputeTx(tx, acc.id);

      return acc.id;
    });

    // Revalidate lists (accounts + dashboard summaries)
    revalidatePath("/accounts");
    revalidatePath("/dashboard");

    // Go to the new account’s detail page
    redirect(`/accounts/${newAccountId}`);
  } catch (err: any) {
    if (err?.digest === "NEXT_REDIRECT") throw err; // ← keep this line
    const msg = encodeURIComponent(err?.message || "Could not open account.");
    redirect(`/accounts/new?error=${msg}`);
  }
}

export default async function NewAccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSession();

  const sp = await searchParams; // 👈 await the async searchParams
  const rawError = sp?.error;
  const error =
    typeof rawError === "string" && rawError.length
      ? decodeURIComponent(rawError)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/accounts"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Accounts
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Open a New Account
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Get started with a new banking account in minutes
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <form action={createAccount} className="space-y-8">
              <div className="space-y-6">
                {/* Account Name */}
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-800">
                    Account Name
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      required
                      className="w-full pl-12 py-3.5 rounded-xl border border-gray-300 bg-white
              text-gray-900 placeholder-gray-500
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g. Everyday Checking"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Account Type */}
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-800">
                    Account Type
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      className="w-full pl-12 py-3.5 appearance-none rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option>Checking</option>
                      <option>Savings</option>
                      <option>Money Market</option>
                      <option>Certificate of Deposit</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      {
                        type: "Checking",
                        icon: (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        ),
                        desc: "Daily transactions",
                      },
                      {
                        type: "Savings",
                        icon: (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        ),
                        desc: "Higher interest",
                      },
                      {
                        type: "Money Market",
                        icon: (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ),
                        desc: "Flexible limits",
                      },
                      {
                        type: "Certificate of Deposit",
                        icon: (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        ),
                        desc: "Fixed-term savings",
                      },
                    ].map((item) => (
                      <div
                        key={item.type}
                        className="flex items-start p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="mt-0.5 text-blue-600">{item.icon}</div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {item.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opening Deposit */}
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-800">
                    Opening Deposit
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      $
                    </span>
                    <input
                      name="opening"
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Minimum $50 for most account types. $0 allowed for checking
                    accounts.
                  </p>
                </div>

                {/* Visual-only features */}
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-800">
                    Account Features
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        id: "debit-card",
                        label: "Debit Card",
                        defaultChecked: true,
                      },
                      {
                        id: "online-banking",
                        label: "Online Banking",
                        defaultChecked: true,
                      },
                      {
                        id: "mobile-app",
                        label: "Mobile App",
                        defaultChecked: true,
                      },
                      {
                        id: "paper-checks",
                        label: "Paper Checks",
                        defaultChecked: false,
                      },
                    ].map((feature) => (
                      <div
                        key={feature.id}
                        className="relative flex items-start p-3 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center h-5">
                          <input
                            id={feature.id}
                            name="features"
                            type="checkbox"
                            defaultChecked={feature.defaultChecked}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3">
                          <label
                            htmlFor={feature.id}
                            className="block text-sm font-medium text-gray-700"
                          >
                            {feature.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Funding (visual) */}
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-800">
                    Funding Account
                  </label>
                  <div className="relative">
                    <select
                      name="funding"
                      className="w-full pl-12 py-3.5 appearance-none rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option>Link External Account (Bank Transfer)</option>
                      <option>Cash Deposit</option>
                      <option>Check Deposit</option>
                      <option>Transfer from another account</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions with loading */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
                  <Link
                    href="/accounts"
                    className="px-6 py-3.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Open Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Security Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl p-6 text-white overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-blue-700 opacity-20"></div>
          <div className="absolute -right-5 -bottom-5 w-20 h-20 rounded-full bg-blue-700 opacity-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center">
            <div className="mb-6 md:mb-0 md:mr-6 flex-shrink-0">
              <div className="bg-blue-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">
                Your Security is Guaranteed
              </h3>
              <p className="text-blue-200 max-w-2xl">
                All accounts include FDIC insurance up to $250,000. We use
                256-bit encryption and multi-factor authentication to protect
                your information. Our systems are monitored 24/7 for suspicious
                activity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

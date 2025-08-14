// app/(app)/search/page.tsx
import React from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { fmtUSD } from "@/lib/money";

export const dynamic = "force-dynamic";

/**
 * SearchPage
 * - Text search (?q=...) across description, category, and account name.
 * - Filter dropdown (?filter=all|income|expenses|transfers).
 * - Results grouped by month with colored amounts.
 *
 * Notes
 * - We build a typed Prisma where-clause to avoid IDE underlines.
 * - Filter form is a GET form; includes hidden q so both combine cleanly.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireSession();
  const userId = (user as any)?.id as string;

  // Next.js 15 dynamic API – must await searchParams
  const sp = await searchParams;

  const q =
    typeof sp.q === "string"
      ? sp.q.trim()
      : Array.isArray(sp.q)
      ? (sp.q[0] || "").trim()
      : "";

  type Filter = "all" | "income" | "expenses" | "transfers";
  const filterParam =
    typeof sp.filter === "string"
      ? sp.filter.toLowerCase()
      : Array.isArray(sp.filter)
      ? (sp.filter[0] || "").toLowerCase()
      : "all";

  const filter: Filter = (
    ["all", "income", "expenses", "transfers"].includes(filterParam)
      ? filterParam
      : "all"
  ) as Filter;

  // ----- Build a typed WHERE (fixes TS underlines) -----
  const baseWhere: Prisma.TransactionWhereInput =
    q.length > 0
      ? {
          account: { userId },
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { account: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : { account: { userId } };

  let where: Prisma.TransactionWhereInput = baseWhere;

  if (filter === "income") {
    where = { ...baseWhere, amountCents: { gt: 0 } };
  } else if (filter === "expenses") {
    where = { ...baseWhere, amountCents: { lt: 0 } };
  } else if (filter === "transfers") {
    // Preferred if your schema sets transferId for transfer rows (you do)
    where = { ...baseWhere, NOT: { transferId: null } };

    // If you ever remove transferId, swap to this:
    // where = { ...baseWhere, category: { contains: "transfer", mode: "insensitive" } };
  }

  // ----- Query (select only what we render) -----
  const tx = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: 100,
    select: {
      id: true,
      date: true,
      description: true,
      category: true,
      amountCents: true,
      account: { select: { id: true, name: true } },
      transferId: true,
    },
  });

  // ----- Group by Month -----
  type Row = {
    id: string;
    date: Date;
    description: string | null;
    category: string | null;
    amountCents: number | null;
    account: { id: string; name: string } | null;
    transferId: string | null;
  };

  const transactionsByMonth = new Map<string, Row[]>();
  for (const t of tx) {
    const label = new Date(t.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    const arr = transactionsByMonth.get(label) ?? [];
    arr.push(t as Row);
    transactionsByMonth.set(label, arr);
  }

  // ----- UI -----
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header + Search Bar */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaction Search</h1>
          <p className="text-blue-200">
            Find transactions by description, category, account, or date
          </p>

          {/* Text search form (GET) */}
          <form className="mt-6 relative" action="/search" method="get">
            <div className="relative">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search transactions, categories, accounts..."
                className="w-full rounded-xl py-4 pl-14 pr-24 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500 absolute left-4 top-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {/* Keep current filter when searching */}
              <input type="hidden" name="filter" value={filter} />

              <button
                type="submit"
                className="absolute right-2 top-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white backdrop-blur hover:bg-white/20 transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {(q || filter !== "all") && (
            <div className="mt-4 text-blue-100 flex flex-wrap items-center gap-3">
              {q && (
                <span>
                  Showing <b>{tx.length}</b> results for{" "}
                  <span className="underline">&quot;{q}&quot;</span>
                </span>
              )}
              {filter !== "all" && (
                <span className="inline-flex items-center gap-2">
                  <span className="opacity-80">Filter:</span>
                  <code className="px-1.5 py-0.5 rounded bg-white/10">
                    {filter}
                  </code>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Empty state */}
        {tx.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-500 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {q ? "No matching transactions found" : "Start your search"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {q
                ? "We couldn't find any transactions matching your search. Try different keywords or search criteria."
                : "Enter keywords in the search bar above to find transactions across all your accounts."}
            </p>
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Try searching for:
              </h4>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Groceries",
                  "Salary",
                  "Restaurant",
                  "Transfer",
                  "Utilities",
                ].map((term) => (
                  <a
                    key={term}
                    href={`/search?q=${encodeURIComponent(
                      term
                    )}&filter=${filter}`}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {term}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Results header + FILTER FORM (keeps q) */}
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Search Results
                </h2>
                <p className="text-gray-600">
                  {q ? `Matching "${q}"` : "Recent transactions"}
                </p>
              </div>

              {/* Filter as a GET form so it actually changes results */}
              <form
                action="/search"
                method="get"
                className="flex items-center gap-3"
              >
                {/* Keep current q when filtering */}
                {q && <input type="hidden" name="q" value={q} />}
                <label className="text-sm text-gray-600">Filter by:</label>
                <select
                  name="filter"
                  defaultValue={filter}
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm py-1.5"
                >
                  <option value="all">All Transactions</option>
                  <option value="income">Income</option>
                  <option value="expenses">Expenses</option>
                  <option value="transfers">Transfers</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
                >
                  Apply
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="py-4 px-6 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from(transactionsByMonth.entries()).map(
                    ([month, rows]) => (
                      <React.Fragment key={month}>
                        <tr className="bg-blue-50/60">
                          <td
                            colSpan={5}
                            className="py-2 px-6 font-bold text-blue-800"
                          >
                            {month}
                          </td>
                        </tr>

                        {rows.map((t) => {
                          const cents = Math.trunc(Number(t.amountCents ?? 0));
                          const isOut = cents < 0;

                          return (
                            <tr
                              key={t.id}
                              className="hover:bg-blue-50 transition-colors"
                            >
                              <td className="py-4 px-6 whitespace-nowrap text-gray-600">
                                {new Date(t.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>

                              <td className="py-4 px-6 font-medium text-gray-900">
                                <div className="flex items-center">
                                  <div
                                    className={`p-2 rounded-lg mr-3 ${
                                      isOut
                                        ? "bg-red-100 text-red-600"
                                        : "bg-green-100 text-green-600"
                                    }`}
                                    aria-hidden
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      {isOut ? (
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M20 12H4"
                                        />
                                      ) : (
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                      )}
                                    </svg>
                                  </div>
                                  {t.description || "—"}
                                </div>
                              </td>

                              <td className="py-4 px-6">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {t.category || "Other"}
                                </span>
                              </td>

                              <td className="py-4 px-6 text-gray-700">
                                {t.account?.name ?? "—"}
                              </td>

                              <td className="py-4 px-6 text-right">
                                <span
                                  className={`font-semibold ${
                                    isOut ? "text-red-600" : "text-green-600"
                                  }`}
                                >
                                  {isOut ? "-" : "+"}
                                  {fmtUSD(Math.abs(cents))}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer actions */}
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-sm text-gray-600">
                Showing {tx.length} of {tx.length} transactions
              </div>

              {/* Basic CSV export as GET link preserving q+filter (implement handler when ready) */}
              <div className="flex gap-2">
                <a
                  href={`/search?${new URLSearchParams({
                    q,
                    filter,
                  }).toString()}`}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50"
                >
                  Refresh
                </a>
                <a
                  href={`/search.csv?${new URLSearchParams({
                    q,
                    filter,
                  }).toString()}`}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800"
                >
                  Export CSV
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

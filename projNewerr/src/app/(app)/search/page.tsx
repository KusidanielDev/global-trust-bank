import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getTxnCents, fmtUSD } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { user } = await requireSession();
  const userId = (user as any)?.id as string;
  const q = (searchParams.q || "").trim();

  const tx = await prisma.transaction.findMany({
    where: q
      ? {
          account: { userId },
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { account: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : { account: { userId } },
    orderBy: { date: "desc" },
    take: 100,
    include: { account: true },
  });

  // Group transactions by month for better organization
  const transactionsByMonth: Record<string, any[]> = {};
  tx.forEach((transaction) => {
    const monthYear = new Date(transaction.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

    if (!transactionsByMonth[monthYear]) {
      transactionsByMonth[monthYear] = [];
    }

    transactionsByMonth[monthYear].push(transaction);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaction Search</h1>
          <p className="text-blue-200">
            Find transactions by description, category, account, or date
          </p>

          <form className="mt-6 relative" action="/(app)/search" method="get">
            <div className="relative">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search transactions, categories, accounts..."
                className="w-full rounded-xl py-4 pl-14 pr-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500 absolute left-4 top-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {q && (
            <div className="mt-4 text-blue-200 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Showing {tx.length} results for "{q}"
            </div>
          )}
        </div>

        {tx.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-500 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
                    href={`/(app)/search?q=${term}`}
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
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Search Results
                </h2>
                <p className="text-gray-600">
                  {q ? `Matching "${q}"` : "Recent transactions"}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center">
                <span className="text-sm text-gray-600 mr-3">Filter by:</span>
                <select className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm py-1.5">
                  <option>All Transactions</option>
                  <option>Income</option>
                  <option>Expenses</option>
                  <option>Transfers</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="py-4 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(transactionsByMonth).map(
                    ([month, transactions]) => (
                      <>
                        <tr className="bg-blue-50">
                          <td
                            colSpan={5}
                            className="py-2 px-6 font-bold text-blue-800"
                          >
                            {month}
                          </td>
                        </tr>
                        {transactions.map((t: any) => (
                          <tr
                            key={t.id}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <td className="py-4 px-6 whitespace-nowrap text-gray-500">
                              {new Date(t.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-4 px-6 font-medium text-gray-900">
                              <div className="flex items-center">
                                <div
                                  className={`p-2 rounded-lg mr-3 ${
                                    getTxnCents(t) < 0
                                      ? "bg-red-100 text-red-600"
                                      : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    {getTxnCents(t) < 0 ? (
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
                                {t.description}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {t.category || "Other"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-600">
                              {t.account?.name ?? "—"}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span
                                className={`font-medium ${
                                  getTxnCents(t) < 0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {fmtUSD(getTxnCents(t))}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-600 mb-3 sm:mb-0">
                Showing {tx.length} of {tx.length} transactions
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"
                    />
                  </svg>
                </button>
                <button className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800">
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

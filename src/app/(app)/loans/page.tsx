// app/loans/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

function fmtUSD(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default async function LoansPage() {
  const { user } = await requireSession();
  const userId = user.id;
  const rawLoans = await prisma.loan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Enrich data with UI-friendly fields
  const loans = rawLoans.map((loan) => ({
    ...loan,
    type: "Personal Loan", // or derive dynamically if you have a type column
    amount: loan.amountCents / 100, // convert cents → dollars
    apr: loan.rateBps / 100, // convert basis points → percentage
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Loan Management
            </h1>
            <p className="text-gray-600">
              View and manage your current loan accounts
            </p>
          </div>
          <Link
            href="/loans/apply"
            className="mt-4 md:mt-0 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center"
          >
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
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Apply for a Loan
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-700">
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">
                    Term
                  </th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">
                    APR
                  </th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 capitalize font-medium">
                      {l.type}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {fmtUSD(l.amount)}
                    </td>
                    <td className="px-6 py-4">{l.termMonths} months</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {l.apr.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          l.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : l.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {loans.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-8 text-center text-gray-500"
                      colSpan={7}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-400 mb-4"
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
                        <p className="text-lg mb-2">No active loans</p>
                        <p className="mb-4 max-w-md">
                          You don&apos;t have any active loan accounts. Apply
                          for a new loan to get started.
                        </p>
                        <Link
                          href="/loans/apply"
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium"
                        >
                          Apply for a Loan
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 p-2 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              </div>
              <h3 className="text-xl font-bold">Low Interest Rates</h3>
            </div>
            <p className="text-blue-200">
              Our competitive rates save you money over the life of your loan.
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 p-2 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              <h3 className="text-xl font-bold">Quick Approval</h3>
            </div>
            <p className="text-green-200">
              Get a decision in minutes with our streamlined application
              process.
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-700 to-purple-800 text-white rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-600 p-2 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Flexible Terms</h3>
            </div>
            <p className="text-purple-200">
              Choose repayment terms that fit your budget and timeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

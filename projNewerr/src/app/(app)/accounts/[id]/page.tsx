import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { fmtUSD, getBalCents, getTxnCents } from "@/lib/money";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  PlusIcon,
  QrCodeIcon,
  ScaleIcon,
  SwatchIcon,
  WalletIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronRightIcon,
  StarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AccountDetail({
  params,
}: {
  params: { id: string };
}) {
  const { user } = await requireSession();
  const userId = (user as any)?.id as string;
  const id = params.id;

  const account = await prisma.account.findFirst({ where: { id, userId } });

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 p-8 text-center backdrop-blur-sm">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 shadow-lg">
              <CreditCardIcon className="h-12 w-12 text-white mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Account Not Found
            </h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              The requested account could not be located or you don't have
              permission to view it.
            </p>
            <Link
              href="/accounts"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold inline-flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Accounts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tx = await prisma.transaction.findMany({
    where: { accountId: id },
    orderBy: { date: "desc" },
    take: 50,
  });

  // Calculate insights
  const recentTx = tx.slice(0, 30);
  const monthlySpending = recentTx
    .filter((t) => getTxnCents(t) < 0)
    .reduce((sum, t) => sum + Math.abs(getTxnCents(t)), 0);
  const monthlyIncome = recentTx
    .filter((t) => getTxnCents(t) > 0)
    .reduce((sum, t) => sum + getTxnCents(t), 0);
  const largestExpense = recentTx
    .filter((t) => getTxnCents(t) < 0)
    .reduce((max, t) => Math.max(max, Math.abs(getTxnCents(t))), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 to-cyan-600/20 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <Link
              href="/accounts"
              className="flex items-center text-white/70 hover:text-white transition-all duration-200 group bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/15 w-full sm:w-auto"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Accounts</span>
            </Link>
            <div className="flex justify-end sm:justify-normal gap-2 sm:gap-3 w-full sm:w-auto">
              <button className="p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 group">
                <DocumentArrowDownIcon className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button className="p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 group">
                <QrCodeIcon className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Account Header Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl mr-0 sm:mr-4 mb-4 sm:mb-0 shadow-lg w-16 h-16 sm:w-auto sm:h-auto">
                    <CreditCardIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                      {account.name}
                    </h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-blue-200">
                        {account.type}
                      </span>
                      <span className="text-slate-600 text-sm font-mono bg-slate-100 px-2 py-1 rounded-lg">
                        ••••{account.accountNumber?.slice(-4) || "1234"}
                      </span>
                      <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Secured</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="text-slate-600 text-sm mb-2 flex items-center justify-center lg:justify-end">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Available Balance
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-2">
                  {fmtUSD(getBalCents(account))}
                </div>
                <div className="text-slate-500 text-sm">
                  Last updated:{" "}
                  {new Date(
                    account.updatedAt ?? Date.now()
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-6 relative z-10">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/transfer?from=${account.id}`}
            className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-all duration-300 group backdrop-blur-sm hover:-translate-y-1"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <ArrowUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
              Send Money
            </span>
            <span className="text-slate-500 text-xs sm:text-sm mt-1">
              Transfer funds
            </span>
          </Link>

          <Link
            href={`/deposit?to=${account.id}`}
            className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-all duration-300 group backdrop-blur-sm hover:-translate-y-1"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <ArrowDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm sm:text-base">
              Deposit
            </span>
            <span className="text-slate-500 text-xs sm:text-sm mt-1">
              Add funds
            </span>
          </Link>

          <button className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-all duration-300 group backdrop-blur-sm hover:-translate-y-1">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <ScaleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors text-sm sm:text-base">
              Pay Bills
            </span>
            <span className="text-slate-500 text-xs sm:text-sm mt-1">
              Schedule payments
            </span>
          </button>

          <button className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-all duration-300 group backdrop-blur-sm hover:-translate-y-1">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors text-sm sm:text-base">
              Statements
            </span>
            <span className="text-slate-500 text-xs sm:text-sm mt-1">
              View documents
            </span>
          </button>
        </div>

        {/* Account Details & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {/* Account Information */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50 px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Account Information
                </h2>
                <div className="flex items-center justify-center sm:justify-normal text-slate-500">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">
                    Bank Level Security
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-2 sm:mb-3 uppercase tracking-wider">
                      Account Details
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-slate-600">
                          Account Number
                        </label>
                        <p className="text-slate-900 font-mono text-base sm:text-lg bg-slate-50 p-2 sm:p-3 rounded-xl border">
                          ••••••{account.accountNumber?.slice(-4) || "1234"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-slate-600">
                          Routing Number
                        </label>
                        <p className="text-slate-900 font-mono text-base sm:text-lg bg-slate-50 p-2 sm:p-3 rounded-xl border">
                          021000021
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-2 sm:mb-3 uppercase tracking-wider">
                      Account Status
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-slate-600">
                          Interest Rate
                        </label>
                        <p className="text-slate-900 text-base sm:text-lg bg-slate-50 p-2 sm:p-3 rounded-xl border flex items-center">
                          <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                          0.01% APY
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-slate-600">
                          Status
                        </label>
                        <div className="bg-slate-50 p-2 sm:p-3 rounded-xl border">
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm inline-flex items-center shadow-lg">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
                            Active & Secure
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Insights */}
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-3xl shadow-xl text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>
            <div className="relative p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold">
                  Financial Insights
                </h2>
                <SwatchIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200" />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/20">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-blue-100 text-xs sm:text-sm font-medium">
                      Monthly Spending
                    </span>
                    <CurrencyDollarIcon className="h-4 w-4 text-blue-200" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-1">
                    {fmtUSD(monthlySpending)}
                  </div>
                  <div className="text-blue-200 text-xs">
                    Based on recent activity
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/20">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-blue-100 text-xs sm:text-sm font-medium">
                      Monthly Income
                    </span>
                    <ArrowDownIcon className="h-4 w-4 text-blue-200" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-1">
                    {fmtUSD(monthlyIncome)}
                  </div>
                  <div className="text-blue-200 text-xs">
                    Deposits & transfers
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/20">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-blue-100 text-xs sm:text-sm font-medium">
                      Largest Expense
                    </span>
                    <ArrowUpIcon className="h-4 w-4 text-blue-200" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-1">
                    {fmtUSD(largestExpense)}
                  </div>
                  <div className="text-blue-200 text-xs">This period</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50 px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Recent Transactions
              </h2>
              <p className="text-slate-600 mt-1">
                Last {tx.length} transactions
              </p>
            </div>
            <Link
              href="/search"
              className="bg-white text-blue-600 font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl border border-blue-200 w-full sm:w-auto justify-center"
            >
              View All
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </Link>
          </div>

          <div className="p-6 sm:p-8">
            {tx.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="bg-gradient-to-br from-slate-100 to-blue-100 p-5 sm:p-6 rounded-3xl w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 shadow-lg">
                  <ClockIcon className="h-10 w-10 sm:h-12 sm:w-12 text-slate-500 mx-auto" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                  No Transactions Yet
                </h3>
                <p className="text-slate-600 max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
                  Your transaction history will appear here once you start using
                  this account.
                </p>
                <Link
                  href={`/transfer?from=${account.id}`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold inline-flex items-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Make Your First Transaction
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tx.slice(0, 10).map((t, index) => (
                  <div
                    key={t.id}
                    className={`flex flex-col xs:flex-row xs:items-center justify-between p-4 sm:p-5 rounded-2xl transition-all duration-200 hover:shadow-md border ${
                      index % 2 === 0
                        ? "bg-slate-50/50 hover:bg-blue-50"
                        : "bg-white hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center mb-3 xs:mb-0">
                      <div
                        className={`p-3 sm:p-4 rounded-2xl mr-3 sm:mr-5 shadow-lg ${
                          getTxnCents(t) < 0
                            ? "bg-gradient-to-br from-red-500 to-red-600"
                            : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                        }`}
                      >
                        {getTxnCents(t) < 0 ? (
                          <ArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-base sm:text-lg mb-1">
                          {t.description || "Transaction"}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded-full ${
                              t.category === "Food"
                                ? "bg-orange-100 text-orange-700"
                                : t.category === "Transportation"
                                ? "bg-blue-100 text-blue-700"
                                : t.category === "Shopping"
                                ? "bg-purple-100 text-purple-700"
                                : t.category === "Entertainment"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {t.category || "Other"}
                          </span>
                          <div className="flex items-center text-slate-500 text-xs sm:text-sm">
                            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {new Date(t.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold text-lg sm:text-xl ${
                          getTxnCents(t) < 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {getTxnCents(t) < 0 ? "-" : "+"}
                        {fmtUSD(Math.abs(getTxnCents(t)))}
                      </div>
                      <div className="text-slate-500 text-xs sm:text-sm mt-1">
                        {getTxnCents(t) < 0 ? "Debit" : "Credit"}
                      </div>
                    </div>
                  </div>
                ))}
                {tx.length > 10 && (
                  <div className="text-center pt-5 sm:pt-6">
                    <Link
                      href="/search"
                      className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm inline-flex items-center"
                    >
                      View {tx.length - 10} more transactions
                      <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

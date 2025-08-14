import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { fmtUSD, getBalCents, getTxnCents } from "@/lib/money";
import { SpendingPie, CashflowArea } from "@/components/Charts";

export const dynamic = "force-dynamic";

/**
 * Dashboard
 * - KPIs: Total, Checking, Savings, Monthly Spend
 * - Quick Actions: Transfer / Deposit / Open Account / Search
 * - Charts: SpendingPie (by category), CashflowArea (running balance)
 * - Accounts: cards linking to /accounts/[id] + Manage link
 * - Recent transactions: table with amount coloring
 * All links are clean (no /(app) in hrefs).
 */
export default async function DashboardPage() {
  const { user } = await requireSession();
  const userId = (user as any)?.id as string;

  // Fetch accounts, recent transactions (with account), and user
  const [accounts, recent, userData] = await Promise.all([
    prisma.bankAccount.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { account: { userId } },
      include: { account: true },
      orderBy: { date: "desc" },
      take: 180,
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  // ----- Rollups (defensive: everything in cents) -----
  const pick = (a: { balanceCents?: number | null }) =>
    Math.trunc(a?.balanceCents ?? 0);

  const totalCents = accounts.reduce((s, a) => s + pick(a), 0);

  const checking = accounts.filter((a) =>
    (a?.type || "").toLowerCase().includes("check")
  );
  const savings = accounts.filter((a) =>
    (a?.type || "").toLowerCase().includes("sav")
  );
  const credit = accounts.filter((a) =>
    (a?.type || "").toLowerCase().includes("credit")
  );

  const checkingCents = checking.reduce((s, a) => s + pick(a), 0);
  const savingsCents = savings.reduce((s, a) => s + pick(a), 0);
  const creditCents = credit.reduce((s, a) => s + pick(a), 0);

  // Spending by category (absolute outflows)
  const byCat = new Map<string, number>();
  for (const t of recent) {
    const cents = Math.trunc(Number((t as any)?.amountCents ?? 0));
    if (cents < 0) {
      const k = (t as any)?.category || "Other";
      byCat.set(k, (byCat.get(k) ?? 0) + Math.abs(cents));
    }
  }
  const spendingPie = Array.from(byCat.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const monthlyOutCents = Array.from(byCat.values()).reduce((s, v) => s + v, 0);
  const monthlyInCents = recent
    .filter((t) => Math.trunc(Number((t as any)?.amountCents ?? 0)) > 0)
    .reduce((s, t) => s + Math.trunc(Number((t as any)?.amountCents ?? 0)), 0);

  // Daily cashflow -> running area (use last ~60 days of data in 'recent')
  const daily = new Map<string, number>();

  // Build daily cents safely (use t.amountCents, not getTxnCents(t))
  for (const t of recent) {
    const dateIso = new Date(t.date as any).toISOString().slice(0, 10); // YYYY-MM-DD
    const add = Number((t as any)?.amountCents ?? 0);
    const addSafe = Number.isFinite(add) ? Math.trunc(add) : 0; // ensure integer cents
    daily.set(dateIso, (daily.get(dateIso) ?? 0) + addSafe);
  }

  // Sort days and compute running dollars, guarding against NaN
  const daysSorted = Array.from(daily.keys()).filter(Boolean).sort(); // YYYY-MM-DD sorts lexicographically
  let running = 0;

  const cashflowArea = daysSorted.map((d) => {
    const incRaw = Number(daily.get(d));
    const inc = Number.isFinite(incRaw) ? incRaw : 0;
    running += inc;

    const dollars = running / 100;
    return {
      name: d.slice(5), // "MM-DD"
      value: Number.isFinite(dollars) ? dollars : 0, // chart-safe number
    };
  });

  // Last 8 transactions for quick table
  const lastTransactions = recent.slice(0, 8);

  // Small insights (safe, approximate)
  const inflowCount = recent.filter((t) => getTxnCents(t) > 0).length;
  const outflowCount = recent.filter((t) => getTxnCents(t) < 0).length;
  const topCat = spendingPie[0]?.name ?? "—";
  const topCatAmt = spendingPie[0]?.value ?? 0;

  // UI Helpers
  const firstName =
    (userData?.name || userData?.email || "User").split(" ")[0] || "User";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {firstName}
              </h1>
              <p className="text-gray-600">
                Here’s your financial overview as of{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                .
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/accounts/new"
                className="px-4 py-2.5 rounded-lg font-medium text-white bg-blue-900 hover:bg-blue-800 active:bg-gray-900 focus:ring-2 focus:ring-blue-400 transition-colors duration-200 shadow"
              >
                Open account
              </Link>
              <Link
                href="/transfer"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Transfer money
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI
            label="Total Balance"
            value={fmtUSD(totalCents)}
            hint={`${accounts.length} account${
              accounts.length === 1 ? "" : "s"
            }`}
            trend={monthlyInCents - monthlyOutCents >= 0 ? "up" : "down"}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
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
            }
          />
          <KPI
            label="Checking"
            value={fmtUSD(checkingCents)}
            hint={`${checking.length} account${
              checking.length === 1 ? "" : "s"
            }`}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          />
          <KPI
            label="Savings"
            value={fmtUSD(savingsCents)}
            hint={`${savings.length} account${savings.length === 1 ? "" : "s"}`}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
          <KPI
            label="Monthly Spend"
            value={fmtUSD(monthlyOutCents)}
            hint={`Inflow ${fmtUSD(monthlyInCents)}`}
            trend="down"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
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
            }
          />
        </section>

        {/* Quick Actions (LINKS ARE CLEAN) */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/transfer", label: "Transfer Money", icon: "⇄" },
            { href: "/deposit", label: "Deposit Check", icon: "⮋" },
            { href: "/accounts/new", label: "Open Account", icon: "+" },
            { href: "/search", label: "Search Transactions", icon: "🔍" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group p-4 flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all active:scale-[.98]"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <span className="text-lg">{a.icon}</span>
                </div>
                <span className="font-medium text-gray-800 group-hover:text-blue-700">
                  {a.label}
                </span>
              </div>
              <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>
          ))}
        </section>

        {/* Charts & insights */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Spending by Category
              </h3>
              <Link
                href="/search"
                className="text-sm text-blue-600 hover:underline"
              >
                View details
              </Link>
            </div>
            <div className="h-64">
              {spendingPie.length ? (
                <SpendingPie data={spendingPie} />
              ) : (
                <EmptyChart />
              )}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Top category:{" "}
              <span className="font-medium text-gray-900">{topCat}</span> (
              {fmtUSD(topCatAmt)})
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Cashflow (last 60 days)
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {inflowCount} inflow / {outflowCount} outflow
                </span>
                <Link
                  href="/accounts"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Export
                </Link>
              </div>
            </div>
            <div className="h-64">
              {cashflowArea.length ? (
                <CashflowArea data={cashflowArea} />
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>
        </section>

        {/* Accounts summary — each card LINKS to /accounts/[id] */}
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Your Accounts</h3>
            <Link
              href="/accounts"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage Accounts
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="mb-3 text-gray-700">No accounts yet.</p>
              <Link
                href="/accounts/new"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Open your first account
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.slice(0, 6).map((account) => (
                <Link
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-xl hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {account.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {account.type || "Account"}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-200/60 text-blue-800 rounded-full">
                      •••• {account.accountNumber?.slice(-4) || "1234"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900">
                      {fmtUSD(account.balanceCents ?? 0)}
                    </p>
                    <div className="text-xs px-2 py-1 bg-white text-blue-600 rounded border">
                      Active
                    </div>
                  </div>
                </Link>
              ))}
              {accounts.length > 6 && (
                <Link
                  href="/accounts"
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-2xl font-bold text-blue-500">+</div>
                  <p className="mt-2 text-sm font-medium text-blue-600">
                    View all accounts
                  </p>
                  <p className="text-xs text-gray-500">
                    {accounts.length} total
                  </p>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Recent transactions */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
            <Link
              href="/search"
              className="text-sm text-blue-600 hover:underline"
            >
              See all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="py-2 px-3 text-left font-medium">Date</th>
                  <th className="py-2 px-3 text-left font-medium">
                    Description
                  </th>
                  <th className="py-2 px-3 text-left font-medium">Account</th>
                  <th className="py-2 px-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lastTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {new Date(t.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-3">{t.description || "—"}</td>
                    <td className="py-2 px-3">
                      {(t.account?.name || "Account") + " "}
                      <span className="text-gray-500">
                        ••••{t.account?.accountNumber?.slice(-4) || "0000"}
                      </span>
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-medium ${
                        (t as any)?.amountCents < 0
                          ? "text-red-600"
                          : "text-green-700"
                      }`}
                    >
                      {(t as any)?.amountCents > 0 ? "+" : ""}
                      {fmtUSD(Math.trunc(Number((t as any)?.amountCents ?? 0)))}
                    </td>
                  </tr>
                ))}
                {lastTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-gray-500 italic"
                    >
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tips / Notices (simple, optional content) */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                ℹ️
              </span>
              <h4 className="font-semibold text-gray-900">Security Tip</h4>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Enable two-factor authentication to add an extra layer of
              protection to your account.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                💡
              </span>
              <h4 className="font-semibold text-gray-900">Savings Tip</h4>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Automate transfers from checking to savings each payday.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                🧾
              </span>
              <h4 className="font-semibold text-gray-900">Statements</h4>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Export CSV from{" "}
              <Link href="/accounts" className="text-blue-600 hover:underline">
                Accounts
              </Link>{" "}
              to reconcile transactions.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Local UI helpers ---------- */

function KPI({
  label,
  value,
  hint,
  icon,
  trend,
}: {
  label: string;
  value: React.ReactNode; // or: string | number
  hint?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down";
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-gray-600">{label}</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
          {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
        </div>
        {icon && (
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">{icon}</div>
        )}
      </div>
      {trend && (
        <div
          className={`mt-3 flex items-center text-xs font-medium ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? "▲" : "▼"}
          <span className="ml-1">
            {trend === "up" ? "Increased" : "Decreased"}
          </span>
        </div>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-40 w-full rounded-lg bg-gray-50 border border-dashed border-gray-200 grid place-items-center text-sm text-gray-500">
      No data available
    </div>
  );
}

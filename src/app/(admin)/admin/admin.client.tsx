// src/app/(admin)/admin/admin.client.tsx
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  adminCredit,
  adminDebit,
  adminUpdateTxDate,
  adminDeleteTx,
  adminSetAccountStatus,
  type AdminResult,
} from "./actions";
import { fmtUSD } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";

export interface AdminAccountRow {
  id: string;
  name: string;
  accountNumber: string | null;
  balanceCents: number;
  status?: AccountStatus;
  user?: { name?: string | null; email: string };
}

export interface AdminTxRow {
  id: string;
  date: string | Date;
  amountCents: number;
  description: string | null;
  account: {
    name: string;
    accountNumber: string | null;
    user: { name?: string | null; email: string };
  };
}

export default function AdminClient({
  usersCount,
  accounts,
  tx,
}: {
  usersCount: number;
  accounts: AdminAccountRow[];
  tx: AdminTxRow[];
}) {
  const router = useRouter();
  const [banner, setBanner] = useState<AdminResult>({});

  const [creditState, creditAction] = useActionState<AdminResult, FormData>(
    adminCredit,
    {}
  );
  const [debitState, debitAction] = useActionState<AdminResult, FormData>(
    adminDebit,
    {}
  );
  const [dateState, dateAction] = useActionState<AdminResult, FormData>(
    adminUpdateTxDate,
    {}
  );
  const [delState, delAction] = useActionState<AdminResult, FormData>(
    adminDeleteTx,
    {}
  );
  const [statusState, statusAction] = useActionState<AdminResult, FormData>(
    adminSetAccountStatus,
    {}
  );

  useEffect(() => {
    const states = [creditState, debitState, dateState, delState, statusState];
    const hit = states.find((s) => s?.ok || s?.err);
    if (hit) {
      setBanner(hit);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditState, debitState, dateState, delState, statusState]);

  const safeAccounts: AdminAccountRow[] = Array.isArray(accounts)
    ? accounts
    : [];
  const safeTx: AdminTxRow[] = Array.isArray(tx) ? tx : [];
  const totalBalance = safeAccounts.reduce<number>(
    (s, a) => s + (a.balanceCents || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
          <Link
            href="/"
            className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-900"
          >
            Back to app
          </Link>
        </header>

        {banner.ok && (
          <div className="rounded-lg border border-green-300 bg-green-50 text-green-900 px-3 py-2">
            ✅ {banner.ok}
          </div>
        )}
        {banner.err && (
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-900 px-3 py-2">
            ❌ {banner.err}
          </div>
        )}

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Kpi title="Users" value={usersCount.toLocaleString()} />
          <Kpi title="Accounts" value={safeAccounts.length.toLocaleString()} />
          <Kpi title="Total Balance" value={fmtUSD(totalBalance)} />
          <Kpi title="Recent Transactions" value={safeTx.length.toString()} />
        </section>

        {/* Accounts */}
        <section className="rounded-xl bg-white shadow border">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Accounts</h2>
            <p className="text-sm text-gray-800">
              Credit/debit balances and change account status.
            </p>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-900 font-medium text-left">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Account</th>
                  <th className="py-2 pr-4">Balance</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Credit</th>
                  <th className="py-2 pr-4">Debit</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {safeAccounts.map((a) => (
                  <tr key={a.id} className="border-t align-top">
                    <td className="py-3 pr-4">
                      <div className="font-medium">
                        {a.user?.name || a.user?.email}
                      </div>
                      <div className="text-xs">{a.user?.email}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">
                        {a.name} ••••{a.accountNumber?.slice(-4) ?? "0000"}
                      </div>
                      <div className="text-xs">{a.id}</div>
                    </td>
                    <td className="py-3 pr-4">{fmtUSD(a.balanceCents)}</td>

                    {/* Status */}
                    <td className="py-3 pr-4">
                      <form
                        action={statusAction}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="accountId" value={a.id} />
                        <select
                          name="status"
                          defaultValue={a.status ?? "ACTIVE"}
                          className="rounded-md border p-2 text-sm text-gray-900 bg-white"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="FROZEN">FROZEN</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                        <SmallBtn>Update</SmallBtn>
                      </form>
                    </td>

                    {/* Credit */}
                    <td className="py-3 pr-4">
                      <form
                        action={creditAction}
                        className="flex flex-col gap-2"
                      >
                        <input type="hidden" name="accountId" value={a.id} />
                        <input
                          name="amount"
                          placeholder="Amount (USD)"
                          inputMode="decimal"
                          className="w-40 rounded-md border p-2 text-gray-900 bg-white placeholder:text-gray-600"
                        />
                        <input
                          name="memo"
                          placeholder="Memo"
                          className="w-40 rounded-md border p-2 text-gray-900 bg-white placeholder:text-gray-600"
                        />
                        <SmallPrimary>+ Add money</SmallPrimary>
                      </form>
                    </td>

                    {/* Debit */}
                    <td className="py-3 pr-4">
                      <form
                        action={debitAction}
                        className="flex flex-col gap-2"
                      >
                        <input type="hidden" name="accountId" value={a.id} />
                        <input
                          name="amount"
                          placeholder="Amount (USD)"
                          inputMode="decimal"
                          className="w-40 rounded-md border p-2 text-gray-900 bg-white placeholder:text-gray-600"
                        />
                        <input
                          name="memo"
                          placeholder="Memo"
                          className="w-40 rounded-md border p-2 text-gray-900 bg-white placeholder:text-gray-600"
                        />
                        <SmallDanger>- Withdraw</SmallDanger>
                      </form>
                    </td>
                  </tr>
                ))}
                {safeAccounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-700">
                      No accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transactions */}
        <section className="rounded-xl bg-white shadow border">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Transactions
            </h2>
            <p className="text-sm text-gray-800">
              Edit dates or delete & reconcile balances.
            </p>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-900 font-medium text-left">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Account</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Edit date</th>
                  <th className="py-2">Delete</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {safeTx.map((t) => {
                  const neg = t.amountCents < 0;
                  return (
                    <tr key={t.id} className="border-t align-top">
                      <td className="py-2 pr-4">
                        {new Date(t.date).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        {t.account.user.name || t.account.user.email}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="font-medium">
                          {t.account.name} ••••
                          {t.account.accountNumber?.slice(-4) ?? "0000"}
                        </div>
                        <div className="text-xs">{t.account.user.email}</div>
                      </td>
                      <td
                        className={
                          neg
                            ? "py-2 pr-4 text-rose-600 font-medium"
                            : "py-2 pr-4 text-emerald-700 font-medium"
                        }
                      >
                        {fmtUSD(t.amountCents)}
                      </td>
                      <td className="py-2 pr-4 max-w-[22rem]">
                        {t.description}
                      </td>

                      <td className="py-2 pr-4">
                        <form
                          action={dateAction}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="txId" value={t.id} />
                          <input
                            type="datetime-local"
                            name="date"
                            className="rounded-md border p-2 text-gray-900 bg-white"
                            defaultValue={toLocalInputValue(t.date)}
                          />
                          <SmallBtn>Save</SmallBtn>
                        </form>
                      </td>

                      <td className="py-2">
                        <form
                          action={delAction}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="txId" value={t.id} />
                          <select
                            name="impact"
                            defaultValue="none"
                            className="rounded-md border p-2 text-gray-900 bg-white"
                          >
                            <option value="none">No balance change</option>
                            <option value="credit">
                              Reverse CREDIT (subtract)
                            </option>
                            <option value="debit">Reverse DEBIT (add)</option>
                          </select>
                          <SmallDanger>Delete</SmallDanger>
                        </form>
                      </td>
                    </tr>
                  );
                })}
                {safeTx.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-700">
                      No recent transactions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white shadow border p-4">
      <div className="text-sm text-gray-800">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function toLocalInputValue(date: Date | string) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

function SmallBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className={`rounded-md bg-gray-900 text-white px-2.5 py-1.5 text-xs ${
        pending ? "opacity-80" : ""
      }`}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
function SmallPrimary({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className={`rounded-md bg-blue-600 text-white px-2.5 py-1.5 text-xs ${
        pending ? "opacity-80" : ""
      }`}
    >
      {pending ? "Adding…" : children}
    </button>
  );
}
function SmallDanger({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className={`rounded-md bg-rose-600 text-white px-2.5 py-1.5 text-xs ${
        pending ? "opacity-80" : ""
      }`}
    >
      {pending ? "Working…" : children}
    </button>
  );
}

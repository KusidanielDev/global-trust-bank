"use client";

import Link from "next/link";
// ⬇️ REPLACE useFormState with useActionState from react
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { performTransfer, type TransferResult } from "./actions";
import { fmtUSD } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function TransferClient({
  accounts,
  activeTab,
}: {
  accounts: {
    id: string;
    name: string;
    accountNumber: string | null;
    balanceCents: number;
  }[];
  activeTab: "internal" | "external";
}) {
  const router = useRouter();

  // ⬇️ useActionState(prev, formData) instead of useFormState
  const [state, action] = useActionState<TransferResult, FormData>(
    performTransfer,
    {}
  );
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state?.ok, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow p-6 mb-6">
          <h1 className="text-2xl font-bold">Transfers</h1>
          <p className="opacity-90">
            Move money between your accounts or send to other banks.
          </p>
        </div>

        {state?.ok && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-green-900">
            ✅ {state.ok}
          </div>
        )}
        {state?.err && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-900">
            ❌ {state.err}
          </div>
        )}

        <div className="mb-4">
          <div className="inline-flex rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <TabLink
              label="Internal transfer"
              tab="internal"
              activeTab={activeTab}
            />
            <TabLink
              label="External transfer"
              tab="external"
              activeTab={activeTab}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white shadow p-6">
          <form action={action} className="space-y-6">
            <input type="hidden" name="mode" value={activeTab} />

            {/* From */}
            <Section title="From account">
              <select
                name="from"
                required
                defaultValue={accounts[0]?.id}
                className="w-full rounded-lg border border-gray-300 bg-white p-3
                           text-gray-900 placeholder:text-gray-600
                           focus:border-blue-600 focus:ring-blue-600"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ••••{a.accountNumber?.slice(-4) ?? "0000"} —{" "}
                    {fmtUSD(a.balanceCents)}
                  </option>
                ))}
              </select>
            </Section>

            {/* To (internal) or External fields */}
            {activeTab === "internal" ? (
              <Section title="To account">
                <select
                  name="to"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white p-3
                             text-gray-900 placeholder:text-gray-600
                             focus:border-blue-600 focus:ring-blue-600"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ••••{a.accountNumber?.slice(-4) ?? "0000"}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-800">
                  Source and destination must be different.
                </p>
              </Section>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Section title="Recipient name">
                    <input
                      name="extRecipientName"
                      required
                      placeholder="e.g., Jane Smith"
                      className="w-full rounded-lg border border-gray-300 bg-white p-3
                                 text-gray-900 placeholder:text-gray-600
                                 focus:border-blue-600 focus:ring-blue-600"
                    />
                  </Section>
                  <Section title="Bank name">
                    <input
                      name="extBankName"
                      required
                      placeholder="e.g., Global Trust Bank"
                      className="w-full rounded-lg border border-gray-300 bg-white p-3
                                 text-gray-900 placeholder:text-gray-600
                                 focus:border-blue-600 focus:ring-blue-600"
                    />
                  </Section>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Section title="Account number">
                    <input
                      name="extAccountNumber"
                      inputMode="numeric"
                      pattern="[0-9]{6,18}"
                      required
                      placeholder="10–18 digits"
                      className="w-full rounded-lg border border-gray-300 bg-white p-3
                                 text-gray-900 placeholder:text-gray-600
                                 focus:border-blue-600 focus:ring-blue-600"
                    />
                  </Section>
                  <Section title="Routing / IFSC / SWIFT (optional)">
                    <input
                      name="extRouting"
                      placeholder="e.g., GLOBTGBXXXX"
                      className="w-full rounded-lg border border-gray-300 bg-white p-3
                                 text-gray-900 placeholder:text-gray-600
                                 focus:border-blue-600 focus:ring-blue-600"
                    />
                  </Section>
                </div>
              </>
            )}

            {/* Amount + Memo */}
            <Section title="Amount (USD)">
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-700">$</span>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="50.00"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 pl-8
                             text-gray-900 placeholder:text-gray-600
                             focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
            </Section>

            <Section title="Description (optional)">
              <input
                name="memo"
                placeholder="Purpose of transfer"
                className="w-full rounded-lg border border-gray-300 bg-white p-3
                           text-gray-900 placeholder:text-gray-600
                           focus:border-blue-600 focus:ring-blue-600"
              />
            </Section>

            <SubmitButton>
              {activeTab === "internal"
                ? "Submit internal transfer"
                : "Send transfer"}
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}

function TabLink({
  label,
  tab,
  activeTab,
}: {
  label: string;
  tab: "internal" | "external";
  activeTab: "internal" | "external";
}) {
  const isActive = tab === activeTab;
  return (
    <Link
      href={`?tab=${tab}`}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-600 text-white"
          : "bg-white text-gray-900 hover:bg-gray-50"
      )}
      prefetch={false}
    >
      {label}
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-900 mb-2">{title}</div>
      {children}
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className={cn(
        "w-full rounded-lg bg-blue-600 text-white py-3.5 font-medium shadow",
        pending ? "opacity-80 cursor-not-allowed" : "hover:bg-blue-700"
      )}
    >
      {pending ? "Processing…" : children}
    </button>
  );
}

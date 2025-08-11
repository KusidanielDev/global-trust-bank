// components/QuickActions.tsx
import Link from "next/link";
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function QuickActions({
  firstAccountId,
}: {
  firstAccountId?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/deposit"
          className="flex items-center gap-2 rounded-lg border p-3 hover:shadow transition-shadow"
        >
          <ArrowDownCircleIcon className="h-6 w-6 text-blue-700" />
          <span className="font-medium text-gray-900">Deposit</span>
        </Link>
        <Link
          href="/withdraw"
          className="flex items-center gap-2 rounded-lg border p-3 hover:shadow transition-shadow"
        >
          <ArrowUpCircleIcon className="h-6 w-6 text-blue-700" />
          <span className="font-medium text-gray-900">Withdraw</span>
        </Link>
        <Link
          href="/transfer"
          className="flex items-center gap-2 rounded-lg border p-3 hover:shadow transition-shadow"
        >
          <ArrowsRightLeftIcon className="h-6 w-6 text-blue-700" />
          <span className="font-medium text-gray-900">Transfer</span>
        </Link>
        {firstAccountId ? (
          <Link
            href={`/api/accounts/${firstAccountId}/statement.csv`}
            className="flex items-center gap-2 rounded-lg border p-3 hover:shadow transition-shadow"
          >
            <DocumentTextIcon className="h-6 w-6 text-blue-700" />
            <span className="font-medium text-gray-900">Statement</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border p-3 opacity-50">
            <DocumentTextIcon className="h-6 w-6" />
            <span className="font-medium">Statement</span>
          </div>
        )}
      </div>
    </div>
  );
}

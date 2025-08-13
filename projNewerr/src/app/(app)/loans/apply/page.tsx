import { requireSession } from "@/lib/session";

export default async function LoanApplyPage() {
  await requireSession();
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900">
        Apply for a loan
      </h1>
      <div className="bg-white p-6 rounded-xl shadow text-sm text-gray-700">
        <p className="mb-3">
          This is a placeholder. We’ll collect your details and prequalify you.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Personal information</li>
          <li>Employment & income</li>
          <li>Requested amount & purpose</li>
        </ul>
      </div>
    </div>
  );
}

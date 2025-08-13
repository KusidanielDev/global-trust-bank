import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toCents } from "@/lib/money";

export const dynamic = "force-dynamic";

async function doDeposit(formData: FormData) {
  "use server";
  const { user } = await requireSession();
  const userId = (user as any)?.id as string;

  const accountId = String(formData.get("account"));
  const memo = String(formData.get("memo") || "").trim();
  const cents = toCents(Number(formData.get("amount") || 0));
  if (!accountId || cents <= 0) throw new Error("Invalid deposit");

  const acc = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!acc) throw new Error("Account not found");

  await prisma.account.update({
    where: { id: acc.id },
    data: {
      balanceCents: (acc.balanceCents || 0) + cents,
      balance: (acc.balance || 0) + cents / 100,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: acc.id,
      description: memo || "Mobile check deposit",
      amountCents: cents,
      amount: cents / 100,
      date: new Date(),
      category: "Deposit",
    },
  });

  revalidatePath("/(app)/dashboard");
  redirect("/(app)/dashboard");
}

export default async function DepositPage() {
  const { user } = await requireSession();
  const userId = (user as any)?.id as string;

  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-xl">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Check Deposit</h1>
          <p>Securely deposit checks using your mobile device</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form action={doDeposit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Account
              </label>
              <select
                name="account"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
              >
                {accounts.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ••••{a.accountNumber?.slice(-4) || "0000"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 pl-8"
                  placeholder="100.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Memo (optional)
              </label>
              <input
                name="memo"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
                placeholder="Paycheck, tax refund, gift..."
              />
            </div>

            <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center">
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-full h-48 flex flex-col items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                <p className="text-gray-500 text-sm">
                  Upload front and back of check
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: JPG, PNG, PDF
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Upload Check Images
              </button>
            </div>

            <button className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-md">
              Deposit Check
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 p-2 rounded-lg mr-4">
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
              <h3 className="text-lg font-bold">Secure Processing</h3>
            </div>
            <p className="text-blue-200 text-sm">
              All check images are encrypted and processed securely using
              bank-level encryption.
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500 p-2 rounded-lg mr-4">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Fast Availability</h3>
            </div>
            <p className="text-purple-200 text-sm">
              First $225 available immediately, remainder available next
              business day.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Deposit Guidelines
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>
                Endorse the back of your check with "For Mobile Deposit Only"
              </span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Ensure all four corners of the check are visible</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>
                Deposits made before 8 PM EST will be processed same day
              </span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Retain the physical check for 14 days after deposit</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

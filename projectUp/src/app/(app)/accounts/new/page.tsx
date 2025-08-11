// src/app/accounts/new/page.tsx
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import SubmitButton from "@/components/SubmitButton";

// --- server action (NOT the default export) ---
async function openAccount(formData: FormData) {
  "use server";

  const { user } = await requireSession(); // throws/redirects if not logged in
  const userId = user.id as string;

  const name = String(formData.get("name") || "Everyday Checking");
  const type = String(formData.get("type") || "checking");

  const account = await prisma.account.create({
    data: {
      userId,
      name,
      type,
      currency: "USD",
      accountNumber: generateAccountNumber(),
    },
    select: { id: true },
  });

  redirect(`/accounts/${account.id}`);
}

function generateAccountNumber() {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

// --- default export must be a React component ---
export default function NewAccountPage() {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
      <h1 className="text-2xl font-bold mb-1">Open a New Account</h1>
      <p className="text-sm text-gray-700 mb-6">
        Choose an account type and name to create your account.
      </p>

      <form action={openAccount} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Name
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Everyday Checking"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Type
          </label>
          <select
            name="type"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            defaultValue="checking"
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
        </div>

        <SubmitButton className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">

          Create Account
        
</SubmitButton>
      </form>
    </div>
  );
}

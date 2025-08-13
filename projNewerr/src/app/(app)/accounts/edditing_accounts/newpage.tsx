import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toCents } from "@/lib/money";

export const dynamic = "force-dynamic";

async function createAccount(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const opening = toCents(Number(formData.get("opening") || 0));
  const { user } = await requireSession();
  const userId = (user as any)?.id as string;

  const acc = await prisma.account.create({
    data: {
      userId,
      name,
      type,
      ...({ balanceCents: opening } as any),
      ...({ balance: opening / 100 } as any),
    } as any,
  });

  if (opening) {
    await prisma.transaction.create({
      data: {
        accountId: acc.id,
        description: "Opening deposit",
        ...({ amountCents: opening } as any),
        ...({ amount: opening / 100 } as any),
        date: new Date(),
        category: "Deposit",
      } as any,
    });
  }
  revalidatePath("/(app)/accounts");
  redirect(`/(app)/accounts/${acc.id}`);
}

export default async function NewAccountPage() {
  await requireSession();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-gray-900">
        Open a new account
      </h1>
      <form
        action={createAccount}
        className="mt-6 space-y-4 bg-white p-6 rounded-xl shadow"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account name
          </label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            placeholder="Everyday Checking"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            name="type"
            className="mt-1 w-full rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
          >
            <option>Checking</option>
            <option>Savings</option>
            <option>Money Market</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Opening deposit (USD)
          </label>
          <input
            name="opening"
            type="number"
            min="0"
            step="0.01"
            className="mt-1 w-full rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            placeholder="100.00"
          />
        </div>
        <button className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700">
          Open account
        </button>
      </form>
    </div>
  );
}

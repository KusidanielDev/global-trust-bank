import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function transfer(formData: FormData) {
  "use server";
  const fromId = String(formData.get("fromId"));
  const toId = String(formData.get("toId"));
  const amount = parseFloat(String(formData.get("amount")));
  if (!fromId || !toId || fromId === toId || !Number.isFinite(amount) || amount<=0) return;
  await prisma.$transaction([
    prisma.transaction.create({ data: { accountId: fromId, amount: -amount, date: new Date(), description: `Transfer to ${toId.slice(0,6)}…`, category: "Transfer" } }),
    prisma.transaction.create({ data: { accountId: toId, amount: amount, date: new Date(), description: `Transfer from ${fromId.slice(0,6)}…`, category: "Transfer" } }),
  ]);
  // create notification
  await prisma.notification.create({
    data: {
      userId: (await import("@/lib/session").then(m=>m.requireSession())).user.id as string,
      title: `Transfer successful`,
      body: `Your transfer has completed.`,
    }
  });

  redirect(`/accounts/${fromId}`);
}

export default async function TransferPage() {
  const accounts = await prisma.account.findMany({ select: { id: true }});
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Transfer</h1>
      <form action={transfer} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">From Account</label>
          <select name="fromId" className="mt-1 w-full border rounded p-2 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {accounts.map(a => <option key={a.id} value={a.id}>Account {a.id.slice(0,6)}…</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">To Account</label>
          <select name="toId" className="mt-1 w-full border rounded p-2 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {accounts.map(a => <option key={a.id} value={a.id}>Account {a.id.slice(0,6)}…</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Amount (USD)</label>
          <input name="amount" type="number" step="0.01" min="0.01" className="mt-1 w-full border rounded p-2 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
        </div>
        <button className="w-full bg-black text-white rounded py-2">Transfer</button>
      </form>
    </div>
  );
}

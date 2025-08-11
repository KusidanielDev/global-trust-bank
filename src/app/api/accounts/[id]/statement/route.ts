import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { user } = await requireSession();
  const id = params.id;

  const acct = await prisma.account.findFirst({
    where: { id, userId: user.id as string },
  });
  if (!acct) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const txs = await prisma.transaction.findMany({
    where: { accountId: id },
    orderBy: { createdAt: "asc" },
  });
  const rows = [["date", "description", "amount_cents"]];
  for (const t of txs)
    rows.push([
      t.createdAt.toISOString(),
      t.memo || "Transaction",
      String(t.amount),
    ]);

  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="statement-${id}.csv"`,
    },
  });
}

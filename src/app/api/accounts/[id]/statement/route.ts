// src/app/api/accounts/[id]/statement/route.ts
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> } // 👈 params is a Promise in Next 15
) {
  const { user } = await requireSession();

  const { id } = await params; // 👈 await it
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const acct = await prisma.bankAccount.findFirst({
    where: { id, userId: user.id },
  });
  if (!acct) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const txs = await prisma.transaction.findMany({
    where: { accountId: id },
    orderBy: { date: "asc" },
  });

  const rows: string[][] = [["date", "description", "amount_cents"]];
  for (const t of txs) {
    rows.push([
      t.date.toISOString(),
      t.description ?? "Transaction",
      String(t.amountCents ?? 0),
    ]);
  }

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

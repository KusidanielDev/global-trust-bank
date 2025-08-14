import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;

// Generate a unique 12-digit account number
async function generateUniqueAccountNumber(): Promise<string> {
  function gen12(): string {
    let s = "";
    for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10);
    if (s[0] === "0") s = "1" + s.slice(1);
    return s;
  }

  for (let i = 0; i < 10; i++) {
    const candidate = gen12();
    const exists = await prisma.bankAccount.findFirst({
      where: { accountNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  const fallback = (gen12() + Date.now().toString().slice(-2)).slice(0, 12);
  return fallback;
}

// Recompute account balance
async function recomputeTx(db: DbClient, accountId: string) {
  const sum = await db.transaction.aggregate({
    where: { accountId },
    _sum: { amountCents: true },
  });
  await db.bankAccount.update({
    where: { id: accountId },
    data: { balanceCents: sum._sum.amountCents ?? 0 },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireSession();
    const userId = user?.id as string;
    if (!userId) throw new Error("Not authenticated");

    const { name, type, openingCents } = await req.json();

    if (!name) throw new Error("Account name is required");
    if (!type) throw new Error("Account type is required");
    if (openingCents < 0) {
      throw new Error("Opening deposit must be non-negative");
    }

    const accountNumber = await generateUniqueAccountNumber();

    const newAccountId = await prisma.$transaction(async (tx) => {
      const acc = await tx.bankAccount.create({
        data: {
          userId,
          name,
          type,
          accountNumber,
        },
        select: { id: true },
      });

      if (openingCents > 0) {
        await tx.transaction.create({
          data: {
            accountId: acc.id,
            description: "Opening deposit",
            amountCents: openingCents,
            date: new Date(),
            category: "Deposit",
          },
        });
      }

      await recomputeTx(tx, acc.id);
      return acc.id;
    });

    return NextResponse.json({ accountId: newAccountId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

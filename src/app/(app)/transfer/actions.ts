"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toCents, fmtUSD } from "@/lib/money";
import { randomUUID } from "crypto";

export async function transferAction(formData: FormData) {
  const { user } = await requireSession();
  const userId = user.id;

  const fromId = String(formData.get("from") || "");
  const toId = String(formData.get("to") || "");
  const memo = String(formData.get("memo") || "").trim();
  const amountCents = Math.abs(toCents(formData.get("amount")));

  if (!fromId || !toId) throw new Error("Missing account ids");
  if (fromId === toId) throw new Error("Choose two different accounts");
  if (!Number.isFinite(amountCents) || amountCents <= 0)
    throw new Error("Enter a valid amount greater than 0");

  const [from, to] = await Promise.all([
    prisma.bankAccount.findFirst({ where: { id: fromId, userId } }),
    prisma.bankAccount.findFirst({ where: { id: toId, userId } }),
  ]);
  if (!from || !to) throw new Error("Accounts not found");

  const transferId = randomUUID();

  await prisma.$transaction(async (tx) => {
    await tx.transaction.createMany({
      data: [
        {
          accountId: fromId,
          amountCents: -amountCents,
          description: memo || `Transfer to ${to!.name}`,
          category: "Transfer",
          transferId,
        },
        {
          accountId: toId,
          amountCents: amountCents,
          description: memo || `Transfer from ${from!.name}`,
          category: "Transfer",
          transferId,
        },
      ],
    });

    // recompute balances
    const [aggFrom, aggTo] = await Promise.all([
      tx.transaction.aggregate({
        where: { accountId: fromId },
        _sum: { amountCents: true },
      }),
      tx.transaction.aggregate({
        where: { accountId: toId },
        _sum: { amountCents: true },
      }),
    ]);
    await Promise.all([
      tx.bankAccount.update({
        where: { id: fromId },
        data: { balanceCents: aggFrom._sum.amountCents ?? 0 },
      }),
      tx.bankAccount.update({
        where: { id: toId },
        data: { balanceCents: aggTo._sum.amountCents ?? 0 },
      }),
    ]);

    await tx.notification.create({
      data: {
        userId,
        title: "Transfer completed",
        body: `You moved ${fmtUSD(amountCents)} from ${from!.name} to ${
          to!.name
        }.`,
      },
    });
  });

  revalidatePath("/dashboard");
  redirect("/accounts");
}

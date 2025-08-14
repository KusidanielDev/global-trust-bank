"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toCents } from "@/lib/money";

export async function withdrawAction(formData: FormData) {
  const { user } = await requireSession();
  const userId = user.id;

  const accountId = String(formData.get("from") || "");
  const memo = String(formData.get("memo") || "").trim();
  const amountCents = Math.abs(toCents(formData.get("amount")));

  if (!accountId) throw new Error("Missing account id");
  if (!Number.isFinite(amountCents) || amountCents <= 0)
    throw new Error("Enter a valid amount greater than 0");

  const account = await prisma.bankAccount.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new Error("Account not found");

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        accountId,
        amountCents: -amountCents,
        description: memo || "Withdrawal",
        category: "Withdrawal",
      },
    });
    const agg = await tx.transaction.aggregate({
      where: { accountId },
      _sum: { amountCents: true },
    });
    await tx.bankAccount.update({
      where: { id: accountId },
      data: { balanceCents: agg._sum.amountCents ?? 0 },
    });
  });

  revalidatePath("/dashboard");
  redirect("/accounts");
}

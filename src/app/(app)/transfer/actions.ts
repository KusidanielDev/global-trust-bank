// app/(app)/transfer/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { toCents, fmtUSD } from "@/lib/money";
import { revalidatePath } from "next/cache";

export type TransferResult = { ok?: string; err?: string };

const FormSchema = z.object({
  mode: z.enum(["internal", "external"]),
  from: z.string().min(1),
  to: z.string().optional(), // internal only
  amount: z.string().min(1),
  memo: z.string().optional().default(""),
  extRecipientName: z.string().optional(),
  extBankName: z.string().optional(),
  extAccountNumber: z.string().optional(),
  extRouting: z.string().optional(),
});

// useFormState signature: (prev, formData)
export async function performTransfer(
  _prev: TransferResult,
  formData: FormData
): Promise<TransferResult> {
  try {
    const parsed = FormSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return { err: "Invalid form input" };

    const {
      mode,
      from,
      to,
      amount,
      memo,
      extRecipientName,
      extBankName,
      extAccountNumber,
    } = parsed.data;

    const amountCents = toCents(amount);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return { err: "Invalid amount" };
    }

    const fromAcct = await prisma.bankAccount.findUnique({
      where: { id: from },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!fromAcct) return { err: "Source account not found" };
    if (fromAcct.balanceCents < amountCents)
      return { err: "Insufficient funds" };

    if (mode === "internal") {
      if (!to || to === from)
        return { err: "Choose a different destination account" };

      const toAcct = await prisma.bankAccount.findUnique({
        where: { id: to },
        include: { user: { select: { id: true } } },
      });
      if (!toAcct) return { err: "Destination account not found" };
      if (toAcct.user.id !== fromAcct.user.id) {
        return { err: "Destination account is not yours" };
      }

      await prisma.$transaction(async (tx) => {
        await tx.bankAccount.update({
          where: { id: fromAcct.id },
          data: { balanceCents: { decrement: amountCents } },
        });
        await tx.bankAccount.update({
          where: { id: toAcct.id },
          data: { balanceCents: { increment: amountCents } },
        });

        // IMPORTANT: negatives for money out; positives for money in
        await tx.transaction.createMany({
          data: [
            {
              accountId: fromAcct.id,
              amountCents: -amountCents,
              description:
                (memo && memo.trim()) || `Transfer to ${toAcct.name}`,
            },
            {
              accountId: toAcct.id,
              amountCents: amountCents,
              description:
                (memo && memo.trim()) || `Transfer from ${fromAcct.name}`,
            },
          ],
        });

        await tx.notification.create({
          data: {
            userId: fromAcct.user.id,
            title: "Transfer successful",
            body: `${fmtUSD(amountCents)} moved to ${toAcct.name}.`,
          },
        });
      });

      revalidatePath("/transfer");
      return { ok: "Transfer completed" };
    }

    // External (debit only)
    const recipient = [extRecipientName, extBankName]
      .filter(Boolean)
      .join(" • ");
    const tail = extAccountNumber ? ` ••••${extAccountNumber.slice(-4)}` : "";

    await prisma.$transaction(async (tx) => {
      await tx.bankAccount.update({
        where: { id: fromAcct.id },
        data: { balanceCents: { decrement: amountCents } },
      });

      await tx.transaction.create({
        data: {
          accountId: fromAcct.id,
          amountCents: -amountCents, // NEGATIVE for outflow
          description:
            (memo && memo.trim()) ||
            `External transfer to ${recipient || "recipient"}${tail}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: fromAcct.user.id,
          title: "Transfer submitted",
          body: `${fmtUSD(amountCents)} sent to ${
            recipient || "recipient"
          }${tail}.`,
        },
      });
    });

    revalidatePath("/transfer");
    return { ok: "External transfer submitted" };
  } catch (e) {
    console.error("performTransfer error:", e);
    return { err: "Unexpected error. Please try again." };
  }
}

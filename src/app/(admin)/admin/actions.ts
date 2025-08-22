// src/app/(admin)/admin/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { toCents, fmtUSD } from "@/lib/money";
import type { AccountStatus as DBAccountStatus } from "@prisma/client";

export type AdminResult = { ok?: string; err?: string };

const id = z.string().min(1);
const StatusSchema = z.enum(["ACTIVE", "FROZEN", "CLOSED"]);
type Status = z.infer<typeof StatusSchema>;

/** CREDIT (money IN) — balance increments, transaction is positive */
export async function adminCredit(
  _prev: AdminResult,
  formData: FormData
): Promise<AdminResult> {
  try {
    await requireAdmin();

    const accountId = id.parse(String(formData.get("accountId") ?? ""));
    const amountCents = toCents(formData.get("amount"));
    const memo = String(formData.get("memo") ?? "").trim();

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return { err: "Enter a valid amount" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.bankAccount.update({
        where: { id: accountId },
        data: { balanceCents: { increment: amountCents } },
      });
      await tx.transaction.create({
        data: { accountId, amountCents, description: memo || "Admin credit" },
      });
    });

    revalidatePath("/admin");
    return { ok: `Credited ${fmtUSD(amountCents)}` };
  } catch (e) {
    console.error(e);
    return { err: "Failed to credit account" };
  }
}

/** DEBIT (money OUT) — balance decrements, transaction is negative */
export async function adminDebit(
  _prev: AdminResult,
  formData: FormData
): Promise<AdminResult> {
  try {
    await requireAdmin();

    const accountId = id.parse(String(formData.get("accountId") ?? ""));
    const amountCents = toCents(formData.get("amount"));
    const memo = String(formData.get("memo") ?? "").trim();

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return { err: "Enter a valid amount" };
    }

    const acct = await prisma.bankAccount.findUnique({
      where: { id: accountId },
      select: { balanceCents: true },
    });
    if (!acct) return { err: "Account not found" };
    if (acct.balanceCents < amountCents) return { err: "Insufficient funds" };

    await prisma.$transaction(async (tx) => {
      await tx.bankAccount.update({
        where: { id: accountId },
        data: { balanceCents: { decrement: amountCents } },
      });
      await tx.transaction.create({
        data: {
          accountId,
          amountCents: -amountCents, // negative for outflow
          description: memo || "Admin debit",
        },
      });
    });

    revalidatePath("/admin");
    return { ok: `Debited ${fmtUSD(amountCents)}` };
  } catch (e) {
    console.error(e);
    return { err: "Failed to debit account" };
  }
}

/** Update a transaction's date/time */
export async function adminUpdateTxDate(
  _prev: AdminResult,
  formData: FormData
): Promise<AdminResult> {
  try {
    await requireAdmin();

    const txId = id.parse(String(formData.get("txId") ?? ""));
    const when = new Date(String(formData.get("date") ?? ""));
    if (Number.isNaN(when.valueOf())) return { err: "Invalid date/time" };

    await prisma.transaction.update({
      where: { id: txId },
      data: { date: when },
    });

    revalidatePath("/admin");
    return { ok: "Transaction date updated" };
  } catch (e) {
    console.error(e);
    return { err: "Failed to update transaction date" };
  }
}

/**
 * Delete a transaction.
 * impact:
 *  - "none": no balance change
 *  - "credit": reverse a CREDIT (subtract from balance)
 *  - "debit": reverse a DEBIT (add back to balance)
 */
export async function adminDeleteTx(
  _prev: AdminResult,
  formData: FormData
): Promise<AdminResult> {
  try {
    await requireAdmin();

    const txId = id.parse(String(formData.get("txId") ?? ""));
    const rawImpact = String(formData.get("impact") ?? "none");
    const impact: "credit" | "debit" | "none" =
      rawImpact === "credit" || rawImpact === "debit" ? rawImpact : "none";

    const tx = await prisma.transaction.findUnique({
      where: { id: txId },
      select: { id: true, amountCents: true, accountId: true },
    });
    if (!tx) return { err: "Transaction not found" };

    await prisma.$transaction(async (db) => {
      if (impact === "credit") {
        // Removing a CREDIT reduces balance by that amount
        await db.bankAccount.update({
          where: { id: tx.accountId },
          data: { balanceCents: { decrement: tx.amountCents } },
        });
      } else if (impact === "debit") {
        // Removing a DEBIT adds the amount back
        await db.bankAccount.update({
          where: { id: tx.accountId },
          data: { balanceCents: { increment: Math.abs(tx.amountCents) } },
        });
      }
      await db.transaction.delete({ where: { id: tx.id } });
    });

    revalidatePath("/admin");
    return { ok: "Transaction deleted" };
  } catch (e) {
    console.error(e);
    return { err: "Failed to delete transaction" };
  }
}

/** Set account status (ACTIVE | FROZEN | CLOSED) and manage closedAt */
export async function adminSetAccountStatus(
  _prev: AdminResult,
  formData: FormData
): Promise<AdminResult> {
  try {
    await requireAdmin();

    const accountId = id.parse(String(formData.get("accountId") ?? ""));
    const raw = String(formData.get("status") ?? "ACTIVE").toUpperCase();
    const parsed: Status = StatusSchema.parse(raw);

    // If your Prisma model uses an enum for status, this cast is correct and NOT `any`.
    const status = parsed as DBAccountStatus;

    await prisma.bankAccount.update({
      where: { id: accountId },
      data:
        status === "CLOSED"
          ? { status, closedAt: new Date() }
          : { status, closedAt: null },
    });

    revalidatePath("/admin");
    return { ok: `Status set to ${status}` };
  } catch (e) {
    console.error(e);
    return { err: "Failed to update status" };
  }
}

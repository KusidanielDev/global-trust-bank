// app/(app)/transfer/page.tsx
import { prisma } from "@/lib/db";
import TransferClient from "./transfer.client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TransferPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const tabParam = typeof params.tab === "string" ? params.tab : "internal";
  const activeTab: "internal" | "external" =
    tabParam === "external" ? "external" : "internal";

  const accounts = await prisma.bankAccount.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, accountNumber: true, balanceCents: true },
  });

  return <TransferClient accounts={accounts} activeTab={activeTab} />;
}

// app/(admin)/admin/page.tsx
import { prisma } from "@/lib/db";
import AdminClient from "./admin.client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [usersCount, accounts, tx] = await Promise.all([
    prisma.user.count(),
    prisma.bankAccount.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.transaction.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: {
        account: {
          select: {
            name: true,
            accountNumber: true,
            user: { select: { email: true, name: true } },
          },
        },
      },
    }),
  ]);

  return <AdminClient usersCount={usersCount} accounts={accounts} tx={tx} />;
}

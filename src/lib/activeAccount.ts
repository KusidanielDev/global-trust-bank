import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function getActiveAccount(userId: string) {
  const c = await cookies(); // ✅ await here
  const aid = c.get("aid")?.value;

  if (aid) {
    const acct = await prisma.bankAccount.findFirst({
      where: { id: aid, userId },
    });
    if (acct) return acct;
  }

  const first = await prisma.bankAccount.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (first) {
    c.set("aid", first.id, { httpOnly: true, sameSite: "lax", path: "/" }); // ✅ safe now
    return first;
  }

  return null;
}

export async function setActiveAccount(aid: string) {
  const c = await cookies(); // ✅ await here too
  c.set("aid", aid, { httpOnly: true, sameSite: "lax", path: "/" });
}

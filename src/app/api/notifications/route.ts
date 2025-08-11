import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET() {
  const { user } = await requireSession();
  const list = await prisma.notification.findMany({
    where: { userId: (user as any).id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const { user } = await requireSession();
  const body = await req.json().catch(()=>({}));
  const { action, ids } = body || {};

  if (action === "markAllRead") {
    await prisma.notification.updateMany({ where: { userId: (user as any).id, read: false }, data: { read: true } });
    return NextResponse.json({ ok: true });
  }
  if (action === "markRead" && Array.isArray(ids)) {
    await prisma.notification.updateMany({ where: { id: { in: ids }, userId: (user as any).id }, data: { read: true } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Unsupported action" }, { status: 400 });
}

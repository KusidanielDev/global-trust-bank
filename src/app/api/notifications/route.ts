// src/app/api/notifications/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET() {
  const { user } = await requireSession();

  const list = await prisma.notification.findMany({
    where: { userId: user.id }, // ✅ remove the invalid "..."
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(list, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const { user } = await requireSession();
  const body = await req.json().catch(() => ({} as unknown));

  // Narrow the body safely
  const action = (body as Record<string, unknown>)?.action;
  const ids = (body as Record<string, unknown>)?.ids;

  if (action === "markAllRead") {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false }, // ✅ no any
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "markRead" && Array.isArray(ids)) {
    const idList = (ids as unknown[]).filter(
      (v): v is string => typeof v === "string"
    );

    if (idList.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No valid ids provided" },
        { status: 400 }
      );
    }

    await prisma.notification.updateMany({
      where: { id: { in: idList }, userId: user.id }, // ✅ no any
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: "Unsupported action" },
    { status: 400 }
  );
}

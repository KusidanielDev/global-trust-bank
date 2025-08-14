// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(): Promise<Response> {
  try {
    await prisma.$queryRaw`SELECT 1`; // simple DB ping
    const accounts = await prisma.bankAccount.count();

    return NextResponse.json(
      { ok: true, db: "up", accounts },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

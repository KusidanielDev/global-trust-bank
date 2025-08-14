// Example API route: src/app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const response = NextResponse.json(await prisma.transaction.findMany());

  // Add security headers specific to API
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

// src/lib/session.ts
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export async function requireSession() {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/login"); // <-- redirect, don’t throw
  return session;
}

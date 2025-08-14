// src/lib/session.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation"; // ✅ make sure this is present
import type { Session } from "next-auth";

export async function requireSession(): Promise<Session> {
  const session = await getServerSession(authOptions); // ✅ no `as any`
  // `redirect()` is typed as `never`, so TS is happy after this branch.
  if (!session?.user?.id) redirect("/login");
  return session as Session; // ✅ cast is safe due to guard above
}

// src/lib/admin.ts
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

/**
 * Use an allow-list of admin emails in .env:
 *   ADMIN_EMAILS=you@yourdomain.com,second@domain.com
 */
export async function requireAdmin() {
  const { user } = await requireSession();
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!user?.email || !allow.includes(user.email.toLowerCase())) {
    redirect("/"); // or throw notFound()
  }
  return { user };
}

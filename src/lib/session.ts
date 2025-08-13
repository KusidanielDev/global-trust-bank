import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export async function requireSession() {
  const session = await getServerSession(authOptions); // ← no 'as any'
  if (!session?.user?.id) redirect("/login");
  return session;
}

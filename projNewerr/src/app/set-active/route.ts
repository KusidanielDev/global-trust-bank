import { setActiveAccount } from "@/lib/activeAccount";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const form = await req.formData();
  const aid = String(form.get("aid") || "");
  if (aid) await setActiveAccount(aid);
  redirect("/dashboard");
}

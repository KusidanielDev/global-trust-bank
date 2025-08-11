import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

async function completeOnboarding() {
  "use server";
  const userId = (await import("@/lib/session").then(m=>m.requireSession().catch(()=>null)))?.user?.id || "demo";
  const acc = await prisma.account.create({ data: { userId } , select: { id: true }});
  redirect(`/accounts/${acc.id}`);
}

export default function OnboardingPage() {
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Welcome</h1>
      <p className="text-gray-600 mb-6">Let’s open your first checking account.</p>
      <form action={completeOnboarding}>
        <button className="w-full bg-black text-white rounded py-2">Create Checking Account</button>
      </form>
    </div>
  );
}

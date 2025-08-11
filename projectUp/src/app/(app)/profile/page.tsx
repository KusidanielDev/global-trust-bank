import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

async function updateName(formData: FormData){
  "use server";
  const { user } = await requireSession();
  const name = String(formData.get("name") || "").trim();
  if (name) {
    await prisma.user.update({ where: { id: (user as any).id }, data: { name } });
  }
  redirect("/profile");
}

async function changePassword(formData: FormData){
  "use server";
  const { user } = await requireSession();
  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  if (!current || !next) throw new Error("Missing fields");

  const db = await prisma.user.findUnique({ where: { id: (user as any).id } });
  if (!db) throw new Error("User not found");
  const ok = await bcrypt.compare(current, db.password);
  if (!ok) throw new Error("Current password is incorrect");

  const hash = await bcrypt.hash(next, 10);
  await prisma.user.update({ where: { id: db.id }, data: { password: hash } });
  redirect("/profile");
}

export default async function ProfilePage(){
  const { user } = await requireSession();
  const dbUser = await prisma.user.findUnique({ where: { id: (user as any).id } });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-xl border shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-800">Manage your profile information.</p>

        <form action={updateName} className="mt-6 space-y-3">
          <div>
            <label className="block text-gray-900 font-medium mb-1">Name</label>
            <input name="name" defaultValue={dbUser?.name || ""} className="w-full rounded border border-gray-300 p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">Save</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border shadow p-6">
        <h2 className="text-xl font-bold text-gray-900">Change password</h2>
        <form action={changePassword} className="mt-4 grid gap-3">
          <div>
            <label className="block text-gray-900 font-medium mb-1">Current password</label>
            <input type="password" name="current" className="w-full rounded border border-gray-300 p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-gray-900 font-medium mb-1">New password</label>
            <input type="password" name="next" className="w-full rounded border border-gray-300 p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">Update password</button>
        </form>
      </div>
    </div>
  );
}

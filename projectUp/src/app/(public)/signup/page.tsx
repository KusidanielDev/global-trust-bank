import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

async function createUser(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) throw new Error("Missing fields");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) redirect("/login?error=Account%20already%20exists");

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, password: hash } });

  redirect("/login?success=1");
}

export default function SignupPage() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <form action={createUser} className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Open your account</h1>
        <div>
          <label className="block text-sm">Full name</label>
          <input name="name" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" type="email" className="border rounded w-full p-2" required />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input name="password" type="password" className="border rounded w-full p-2" required />
        </div>
        <button className="w-full bg-blue-600 text-white rounded py-2">Create account</button>
      </form>
    </div>
  );
}

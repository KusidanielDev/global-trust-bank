// app/actions/signup.ts
"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export type SignupResult = { success?: boolean; error?: string };

export async function createUser(
  _prev: SignupResult, // ✅ no `any`
  formData: FormData
): Promise<SignupResult> {
  // ✅ explicit return type
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // Server-side validation
  if (!email || !password || !name || !confirmPassword) {
    return { error: "All fields are required" };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return { error: "Account already exists. Please sign in." };
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, name, password: hash } });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

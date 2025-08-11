"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@bank.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // <-- fixed
  const router = useRouter();
  const params = useSearchParams();
  const urlError = params.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
        {(error || urlError) && (
          <p className="text-red-600 text-sm">{error || urlError}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Email
          </label>
          <input
            className="border border-gray-300 rounded w-full p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Password
          </label>
          <input
            type="password"
            className="border border-gray-300 rounded w-full p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
          Sign in
        </button>
      </form>
    </div>
  );
}

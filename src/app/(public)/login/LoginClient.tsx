"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  ArrowPathIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const params = useSearchParams(); // ✅ allowed in client
  const urlError = params.get("error");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res?.error) setError(res.error);
      else router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Secure Online Banking
        </h1>
        <p className="mt-2 text-gray-600">
          Sign in to access your accounts and manage your finances
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-4 px-6">
          <h2 className="text-xl font-bold text-white">
            Sign in to your account
          </h2>
        </div>

        <div className="p-6 sm:p-8">
          {urlError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{urlError}</span>
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Online Banking ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 py-3 px-4 transition duration-200"
                  placeholder="Enter your online banking ID"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 py-3 px-4 transition duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember my Online Banking ID
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-800 py-3.5 font-medium text-white hover:from-blue-800 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Not enrolled?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition"
                  >
                    Enroll Now
                  </Link>
                </p>
              </div>
              <div className="text-right">
                <Link
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
                >
                  Business Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Security Footer */}
      <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center justify-center md:justify-start">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
            <span className="font-medium">Security Center:</span>
            <span className="ml-1">Learn how we protect you</span>
          </div>

          <div className="flex items-center justify-center md:justify-start mt-2 md:mt-0">
            <svg
              className="h-4 w-4 mr-1 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.967.744L14.146 7.2 13.047 14.01c-.04.3-.25.556-.547.653a1 1 0 01-1.183-.402l-2.11-3.313-1.604 1.603a1 1 0 01-1.414-1.414l2.45-2.45-3.176-1.939a1 1 0 01.108-1.759l9.02-3.62a1 1 0 011.137.345l2.11 2.9-1.175 4.573-1.327-.928a1 1 0 111.142-1.638l2.227 1.558a1 1 0 01.345 1.137l-3.62 9.02a1 1 0 01-1.759.108L7.2 14.854 5.99 13.047c-.097-.297-.353-.507-.653-.547L2.744 12.033a1 1 0 01.402-1.183l3.313-2.11 1.603-1.604a1 1 0 011.414 1.414l-2.45 2.45 3.176 1.939a1 1 0 011.138-.345l2.9 2.11 4.573-1.175-.928-1.327a1 1 0 111.638-1.142l1.558 2.227a1 1 0 01-.345 1.137l-9.02 3.62a1 1 0 01-.108-1.759l1.939-3.176-2.45-2.45a1 1 0 111.414-1.414l1.604 1.603 2.11-3.313a1 1 0 01.402-1.183l3.62-9.02a1 1 0 011.759.108l1.807 5.533 5.533 1.807a1 1 0 01-.108 1.759l-9.02 3.62z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs md:text-sm">
              NASDAQ: GLTB | Member FDIC | Equal Housing Lender
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

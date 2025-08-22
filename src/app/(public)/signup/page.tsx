// app/(public)/signup/page.tsx
"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser, type SignupResult } from "@/app/actions/signup";

export default function SignupPage() {
  const router = useRouter();

  // Server action state
  const [state, formAction] = useActionState<SignupResult, FormData>(
    createUser,
    {}
  );

  // Proper transition wrapper for calling the returned action function
  const [isPending, startTransition] = useTransition();

  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  useEffect(() => {
    if (state?.success) {
      router.push("/login?success=Account+created+successfully");
    }
    // No need to manually flip loading flags; isPending is derived from the transition.
  }, [state, router]);

  const validateForm = (formData: FormData) => {
    const email = String(formData.get("email") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const errors = {
      email: !email
        ? "Email is required"
        : !/\S+@\S+\.\S+/.test(email)
        ? "Invalid email address"
        : "",
      name: !name ? "Full name is required" : "",
      password:
        password.length < 8 ? "Password must be at least 8 characters" : "",
      confirmPassword:
        password !== confirmPassword ? "Passwords do not match" : "",
    };

    setFormErrors(errors);
    return Object.values(errors).every((e) => e === "");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({ email: "", password: "", confirmPassword: "", name: "" });

    const formData = new FormData(e.currentTarget);

    if (validateForm(formData)) {
      // ✅ Key fix: call the returned action inside a transition
      startTransition(() => formAction(formData));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className={`block w-full px-4 py-3 rounded-lg border ${
                  formErrors.name ? "border-red-300" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
                placeholder="John Doe"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`block w-full px-4 py-3 rounded-lg border ${
                  formErrors.email ? "border-red-300" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
                placeholder="you@example.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`block w-full px-4 py-3 rounded-lg border ${
                  formErrors.password ? "border-red-300" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
                placeholder="••••••••"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`block w-full px-4 py-3 rounded-lg border ${
                  formErrors.confirmPassword
                    ? "border-red-300"
                    : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
                placeholder="••••••••"
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isPending
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>

          {state?.error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <p>{state.error}</p>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              By signing up, you agree to our{" "}
              <a
                href="#"
                className="font-medium text-gray-700 hover:text-gray-900"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="font-medium text-gray-700 hover:text-gray-900"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

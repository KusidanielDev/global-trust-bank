"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  idleLabel = "Submit",
  pendingLabel = "Working…",
  isPending = false,
}: {
  idleLabel?: string;
  pendingLabel?: string;
  isPending?: boolean;
}) {
  const { pending } = useFormStatus();
  const showSpinner = pending || isPending;

  return (
    <button
      type="submit"
      disabled={showSpinner}
      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg enabled:transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
    >
      {showSpinner && (
        <svg
          className="h-5 w-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
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
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      <span>{showSpinner ? pendingLabel : idleLabel}</span>
    </button>
  );
}

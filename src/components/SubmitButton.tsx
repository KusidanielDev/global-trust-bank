"use client";
import { useFormStatus } from "react-dom";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import React from "react";

export default function SubmitButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} inline-flex items-center justify-center gap-2 disabled:opacity-70`}
    >
      {pending && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}

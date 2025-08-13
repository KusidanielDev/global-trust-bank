
"use client";
import { useEffect, useState } from "react";

export default function Toast({ message }: { message: string }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 3500);
    return () => clearTimeout(t);
  }, []);
  if (!open) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-lg bg-gray-900 text-white shadow-lg px-4 py-3 text-sm">
        {message}
      </div>
    </div>
  );
}

"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton(){
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async ()=>{ setLoading(true); try{ await signOut({ callbackUrl: "/login" }); } finally{ setLoading(false); } }}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-70"
      disabled={loading}
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut className="w-4 h-4" />
      <span>{loading ? "Signing out…" : "Logout"}</span>
    </button>
  );
}

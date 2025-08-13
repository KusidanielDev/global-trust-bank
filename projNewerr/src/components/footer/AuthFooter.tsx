"use client";
import Link from "next/link";

export default function AuthFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-2">
        <div>© {new Date().getFullYear()} GlobalTrust Bank.</div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          <Link href="/security" className="hover:text-gray-900">Security</Link>
          <Link href="/help" className="hover:text-gray-900">Help</Link>
        </div>
      </div>
    </footer>
  );
}

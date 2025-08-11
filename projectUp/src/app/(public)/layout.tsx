import { ReactNode } from "react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="font-bold">GlobalTrust Bank</div>
        <nav className="space-x-4">
          <Link href="/login" className="text-blue-600">Sign in</Link>
          <Link href="/signup" className="px-3 py-1 rounded bg-blue-600 text-white">Open account</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

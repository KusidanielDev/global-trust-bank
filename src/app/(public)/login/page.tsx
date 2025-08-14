// app/(public)/login/page.tsx
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="w-full max-w-md mx-auto py-8">Loading…</div>}
    >
      <LoginClient />
    </Suspense>
  );
}

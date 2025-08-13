// app/login/layout.tsx
import { ReactNode } from "react";
import AuthFooter from "@/components/footer/AuthFooter";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <AuthFooter />
    </div>
  );
}

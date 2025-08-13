// app/layout.tsx
import { ReactNode } from "react";
import PublicFooter from "@/components/footer/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

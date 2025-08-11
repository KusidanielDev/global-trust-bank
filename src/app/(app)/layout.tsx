import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

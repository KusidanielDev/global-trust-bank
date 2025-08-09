import Header from "@/components/Header";
import AccountSummary from "@/components/AccountSummary";
import QuickActions from "@/components/QuickActions";
import TransactionHistory from "@/components/TransactionHistory";
import FinancialInsights from "@/components/FinancialInsights";
import SecurityFeatures from "@/components/SecurityFeatures";
import Footer from "@/components/Footer";

export default function BankingDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AccountSummary />
            <TransactionHistory />
            <FinancialInsights />
          </div>

          <div className="space-y-8">
            <QuickActions />
            <SecurityFeatures />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

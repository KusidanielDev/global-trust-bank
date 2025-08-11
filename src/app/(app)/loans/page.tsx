// src/app/(app)/loans/page.tsx
export default function LoansPage() {
  const products = [
    {
      name: "Personal Loan",
      apr: "14.9% APR",
      max: "$15,000",
      term: "Up to 36 months",
      desc: "Flexible personal financing for life’s needs.",
    },
    {
      name: "Auto Loan",
      apr: "11.5% APR",
      max: "$40,000",
      term: "Up to 60 months",
      desc: "Competitive rates for new and used vehicles.",
    },
    {
      name: "Home Improvement",
      apr: "12.9% APR",
      max: "$25,000",
      term: "Up to 48 months",
      desc: "Upgrade your home with affordable financing.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Loans & Financing
      </h1>
      <p className="text-gray-700 mb-8">
        Choose the loan that fits your goals. Check your options with no impact
        to your credit score.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.name}
            className="bg-white rounded-xl border shadow hover:shadow-md transition-shadow"
          >
            <div className="p-5 space-y-2">
              <div className="text-lg font-semibold text-gray-900">
                {p.name}
              </div>
              <div className="text-sm text-gray-700">{p.desc}</div>
              <div className="pt-3 text-sm text-gray-800">
                <span className="font-medium">Rate:</span> {p.apr}
              </div>
              <div className="text-sm text-gray-800">
                <span className="font-medium">Max:</span> {p.max}
              </div>
              <div className="text-sm text-gray-800">
                <span className="font-medium">Term:</span> {p.term}
              </div>
            </div>
            <div className="px-5 pb-5">
              <button className="w-full rounded-md bg-blue-600 text-white py-2 font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Check eligibility
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

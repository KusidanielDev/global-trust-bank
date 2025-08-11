import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow">
              Banking that works for you.
            </h1>
            <p className="mt-4 text-white/90 text-lg">
              Open an account in minutes. Track spending, transfer money, and grow your savings with smart insights.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="px-5 py-3 rounded-lg bg-white text-blue-700 font-semibold shadow transition-transform duration-150 hover:scale-[1.02]">
                Open account
              </Link>
              <Link href="/login" className="px-5 py-3 rounded-lg border border-white/80 text-white font-semibold hover:bg-white/10 transition-colors">
                Sign in
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-white/90">
              <div className="text-sm">FDIC-insured up to $250,000</div>
              <div className="text-sm">No monthly fees</div>
              <div className="text-sm">24/7 support</div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image src="/images/hero.svg" alt="Mobile banking app" width={800} height={540} className="w-full h-auto object-cover" priority />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold">Why GlobalTrust?</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Instant transfers", desc: "Send and receive money in seconds—no hidden fees.", img: "/images/feature1.svg" },
            { title: "Powerful insights", desc: "Automatic categorization and budgets to help you save.", img: "/images/feature2.svg" },
            { title: "Top-tier security", desc: "Multi-factor auth and encrypted data.", img: "/images/feature3.svg" },
            { title: "Global access", desc: "Use your account anywhere, on any device.", img: "/images/feature4.svg" },
            { title: "24/7 support", desc: "Real humans ready to help—day or night.", img: "/images/feature5.svg" },
            { title: "No monthly fees", desc: "Keep more of your money working for you.", img: "/images/feature6.svg" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl border shadow hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative aspect-[16/9]">
                <Image src={f.img} alt={f.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <div className="text-lg font-semibold text-gray-900">{f.title}</div>
                <p className="mt-2 text-gray-700">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold">Ready to get started?</h3>
            <p className="text-gray-700">Join in minutes and take control of your money today.</p>
          </div>
          <div className="space-x-3">
            <Link href="/signup" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow transition-transform hover:scale-[1.02]">
              Open account
            </Link>
            <Link href="/login" className="px-5 py-3 rounded-lg border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

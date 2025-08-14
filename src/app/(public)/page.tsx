// app/page.tsx
import Link from "next/link";
import {
  ShieldCheckIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  SparklesIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ChartBarIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-static";

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-blue-50 text-gray-900">
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] bg-[length:60px_60px] opacity-10"></div>
        </div>
        <Section>
          <div className="py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-800/30 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-4 border border-blue-600/30">
                <SparklesIcon className="h-4 w-4 text-blue-200" />
                <span>Trusted by over 2 million customers worldwide</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                Your Financial Future{" "}
                <span className="text-blue-200">Starts Here</span>
              </h1>
              <p className="mt-6 text-xl text-blue-100 max-w-2xl">
                Experience banking reimagined with competitive rates,
                cutting-edge security, and personalized financial guidance to
                help you achieve your goals.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 rounded-xl bg-white text-blue-900 font-bold hover:bg-blue-50 transition-all duration-300 hover:shadow-lg"
                >
                  Open an Account
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-xl bg-transparent text-white font-bold ring-2 ring-white hover:bg-white/10 transition-all duration-300"
                >
                  Sign in to Online Banking
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-300" />
                  <span>FDIC insured up to $250,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <LockClosedIcon className="h-5 w-5 text-blue-300" />
                  <span>256-bit military-grade encryption</span>
                </div>
              </div>
            </div>

            {/* Financial Dashboard Card */}
            <div className="relative z-10 h-[380px]">
              <div className="absolute top-0 right-0 w-full max-w-md">
                <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-6 shadow-2xl border border-white/20">
                  <div className="rounded-2xl bg-white text-gray-900 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg">Premium Checking</div>
                      <div className="bg-blue-100 rounded-full p-2">
                        <CreditCardIcon className="h-6 w-6 text-blue-700" />
                      </div>
                    </div>
                    <div className="mt-4 text-3xl font-extrabold tabular-nums">
                      $18,432.19
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                      {[
                        { label: "Income", value: "$5,240" },
                        { label: "Expenses", value: "$2,860" },
                        { label: "Investments", value: "$4,320" },
                      ].map((item, index) => (
                        <div key={index} className="rounded-lg bg-gray-50 p-3">
                          <div className="text-gray-600">{item.label}</div>
                          <div className="font-bold text-gray-900">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
                        Transfer Funds
                      </button>
                      <button className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-black">
                        Pay Bills
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute right-20 bottom-0 w-72 rotate-6 opacity-60 hidden md:block">
                <div className="rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/20 p-4 shadow-xl h-40" />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* FINANCIAL PARTNERS */}
      <Section className="py-8 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70">
          <div className="text-xl font-bold text-blue-900">
            Trusted by leading financial institutions
          </div>
          {["Visa", "Mastercard", "FDIC", "SIPC", "Nasdaq"].map(
            (partner, index) => (
              <div key={index} className="font-medium text-gray-700">
                {partner}
              </div>
            )
          )}
        </div>
      </Section>

      {/* PRODUCTS */}
      <Section className="py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            Financial Solutions for Every Stage of Life
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Discover our comprehensive suite of banking products designed to
            meet your financial needs
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: BanknotesIcon,
              title: "Premium Checking",
              desc: "High-yield checking with no monthly fees and premium benefits",
              features: [
                "4.25% APY",
                "No minimum balance",
                "Unlimited transactions",
              ],
            },
            {
              icon: SparklesIcon,
              title: "Wealth Builder Savings",
              desc: "Maximize your savings with our highest-yield savings account",
              features: [
                "5.10% APY",
                "No withdrawal limits",
                "Automated savings tools",
              ],
            },
            {
              icon: CreditCardIcon,
              title: "Elite Rewards Card",
              desc: "Premium credit card with exceptional rewards and travel benefits",
              features: [
                "2x points on all purchases",
                "$750 annual travel credit",
                "Priority Pass lounge access",
              ],
            },
            {
              icon: ChartBarIcon,
              title: "Investment Portfolios",
              desc: "Expertly managed portfolios tailored to your financial goals",
              features: [
                "Automated rebalancing",
                "Tax-loss harvesting",
                "0.25% management fee",
              ],
            },
            {
              icon: BuildingOfficeIcon,
              title: "Business Banking",
              desc: "Complete banking solutions for businesses of all sizes",
              features: [
                "Business checking & savings",
                "Merchant services",
                "Commercial lending",
              ],
            },
            {
              icon: LightBulbIcon,
              title: "Financial Planning",
              desc: "Personalized financial guidance from certified advisors",
              features: [
                "Retirement planning",
                "Estate planning",
                "Tax optimization",
              ],
            },
          ].map((product, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <product.icon className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="mt-4 text-xl font-bold">{product.title}</h3>
              <p className="mt-2 text-gray-600">{product.desc}</p>
              <ul className="mt-4 space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={
                  product.title === "Premium Checking"
                    ? "/checking"
                    : "/products"
                }
                className="mt-6 inline-block text-blue-600 font-medium hover:underline"
              >
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* FEATURES */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <Section>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 py-1.5 text-sm mb-4">
                <SparklesIcon className="h-4 w-4" />
                <span>Innovative Banking</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold">
                Technology That Empowers Your Finances
              </h2>
              <p className="mt-4 text-xl text-gray-700 max-w-2xl">
                Our platform combines cutting-edge technology with financial
                expertise to give you complete control over your money.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  {
                    icon: ArrowsRightLeftIcon,
                    title: "Real-Time Transactions",
                    desc: "Instant transfers between accounts with immediate availability",
                  },
                  {
                    icon: ShieldCheckIcon,
                    title: "Advanced Security",
                    desc: "Biometric authentication, device monitoring, and AI fraud detection",
                  },
                  {
                    icon: ChartBarIcon,
                    title: "Wealth Insights",
                    desc: "Personalized financial analysis and predictive forecasting",
                  },
                  {
                    icon: GlobeAltIcon,
                    title: "Global Banking",
                    desc: "Multi-currency accounts with competitive exchange rates",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold">{feature.title}</h3>
                      <p className="mt-1 text-gray-700">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="text-5xl font-extrabold text-blue-600">
                  99.9%
                </div>
                <p className="mt-2 text-gray-700">System uptime guarantee</p>
              </div>
              <div className="bg-blue-600 rounded-2xl p-6 shadow-md text-white">
                <div className="text-5xl font-extrabold">24/7</div>
                <p className="mt-2">Customer support availability</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md col-span-2">
                <div className="flex items-center">
                  <div className="text-5xl font-extrabold text-blue-600">
                    256-bit
                  </div>
                  <div className="ml-4">
                    <div className="font-bold">Encryption</div>
                    <p className="mt-1 text-gray-700">
                      Military-grade security for all transactions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* TESTIMONIALS */}
      <Section className="py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            Trusted by Millions Worldwide
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join our community of satisfied customers who have transformed their
            financial lives
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Michael Rodriguez",
              role: "Entrepreneur",
              quote:
                "GlobalTrust's business banking solutions helped streamline our finances and saved us hours each week. The cash flow insights are invaluable.",
              avatar: "MR",
            },
            {
              name: "Sarah Johnson",
              role: "Financial Advisor",
              quote:
                "The investment tools and low fees have allowed me to maximize returns for my clients while maintaining appropriate risk levels.",
              avatar: "SJ",
            },
            {
              name: "David Chen",
              role: "Tech Executive",
              quote:
                "As someone who travels internationally frequently, the multi-currency accounts and competitive exchange rates have been a game-changer.",
              avatar: "DC",
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-blue-800">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                </div>
              </div>
              <p className="mt-4 text-gray-700 italic">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="mt-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold">
                Ready to Elevate Your Financial Future?
              </h3>
              <p className="mt-2 text-blue-100">
                Join thousands of satisfied customers who trust us with their
                financial goals
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link
                href="/signup"
                className="px-8 py-3.5 rounded-xl bg-white text-blue-900 font-bold hover:bg-blue-50 transition-all duration-300"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* MOBILE APP */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 border-t border-gray-200">
        <Section>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
                <div className="relative bg-white rounded-3xl shadow-xl p-2 w-[280px] mx-auto">
                  <div className="bg-gray-900 rounded-t-2xl p-4 text-center">
                    <div className="text-white font-medium">
                      GlobalTrust Mobile
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="text-xs text-gray-500">
                          Available Balance
                        </div>
                        <div className="text-xl font-bold">$8,432.19</div>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-2">
                        <CreditCardIcon className="h-6 w-6 text-blue-700" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {[
                        { icon: ArrowsRightLeftIcon, label: "Transfer" },
                        { icon: BanknotesIcon, label: "Pay" },
                        { icon: ChartBarIcon, label: "Invest" },
                        { icon: ShieldCheckIcon, label: "Security" },
                      ].map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <item.icon className="h-5 w-5 text-blue-700" />
                          </div>
                          <div className="text-xs">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-100 rounded-xl p-3">
                      <div className="text-sm font-medium mb-2">
                        Recent Transactions
                      </div>
                      <div className="space-y-2">
                        {[
                          {
                            name: "Starbucks",
                            amount: "-$5.45",
                            time: "10:30 AM",
                          },
                          {
                            name: "Amazon",
                            amount: "-$89.99",
                            time: "Yesterday",
                          },
                          {
                            name: "Deposit",
                            amount: "+$2,500.00",
                            time: "May 12",
                          },
                        ].map((transaction, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <div>{transaction.name}</div>
                            <div
                              className={
                                transaction.amount.startsWith("+")
                                  ? "text-green-600"
                                  : "text-gray-900"
                              }
                            >
                              {transaction.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 py-1.5 text-sm mb-4">
                <DevicePhoneMobileIcon className="h-4 w-4" />
                <span>Mobile Banking</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold">
                Your Bank in Your Pocket
              </h2>
              <p className="mt-4 text-xl text-gray-700 max-w-2xl">
                Manage your finances anytime, anywhere with our award-winning
                mobile app, featuring cutting-edge security and intuitive
                design.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Biometric authentication (Face ID, Touch ID)",
                  "Real-time notifications for all transactions",
                  "Mobile check deposit with instant availability",
                  "Card controls to freeze/unfreeze instantly",
                  "Investment management and trading",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-blue-600 mr-3 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg transition-colors">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                  </svg>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="font-bold">App Store</div>
                  </div>
                </button>

                <button className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg transition-colors">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1.571 23.664l10.531-10.501 3.712 3.701-12.519 6.941c-.476.264-1.059.26-1.532-.011l-.192-.13zm9.469-11.56l-10.04 10.011v-20.022l10.04 10.011zm6.274-4.137l4.905 2.719c.482.268.781.77.781 1.314s-.299 1.046-.781 1.314l-5.039 2.793-4.015-4.003 4.149-4.137zm-15.854-7.534c.09-.087.191-.163.303-.227.473-.271 1.056-.275 1.532-.011l12.653 7.015-3.846 3.835-10.642-10.612z" />
                  </svg>
                  <div>
                    <div className="text-xs">Get it on</div>
                    <div className="font-bold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* SECURITY */}
      <Section className="py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 py-1.5 text-sm mb-4">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Bank-Grade Security</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Your Security Is Our Top Priority
            </h2>
            <p className="mt-4 text-xl text-gray-700 max-w-2xl">
              We employ multiple layers of security to protect your accounts and
              personal information, giving you peace of mind for all your
              financial transactions.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "256-bit end-to-end encryption for all data",
                "Multi-factor authentication with biometric options",
                "Real-time fraud monitoring with AI detection",
                "Device recognition and location verification",
                "Regular third-party security audits",
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <svg
                    className="h-6 w-6 text-blue-600 mr-3 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 text-white">
            <div className="text-2xl font-bold mb-6">
              Our Security Commitment
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: LockClosedIcon,
                  title: "Data Protection",
                  desc: "All sensitive data is encrypted at rest and in transit using industry-leading protocols",
                },
                {
                  icon: ShieldCheckIcon,
                  title: "Fraud Prevention",
                  desc: "Advanced AI monitors transactions 24/7 to detect and prevent suspicious activity",
                },
                {
                  icon: BuildingOfficeIcon,
                  title: "Account Safety",
                  desc: "$250,000 FDIC insurance per depositor gives you peace of mind for your deposits",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-blue-700/30 p-3 rounded-xl">
                    <item.icon className="h-6 w-6 text-blue-200" />
                  </div>
                  <div className="ml-4">
                    <div className="font-bold text-lg">{item.title}</div>
                    <p className="mt-1 text-blue-100">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-blue-700">
              <Link
                href="/security"
                className="inline-flex items-center text-blue-200 hover:text-white font-medium"
              >
                Learn more about our security measures
                <svg
                  className="h-5 w-5 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <div className="bg-gradient-to-b from-gray-50 to-blue-50 py-16 border-t border-gray-200">
        <Section>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to know about banking with GlobalTrust
            </p>
          </div>

          <div className="mt-12 grid gap-6">
            {[
              {
                q: "How do I open an account with GlobalTrust Bank?",
                a: "You can open an account online in just minutes by visiting our Open an Account page. You'll need to provide some personal information and identification documents. Once approved, you can fund your account and start banking immediately.",
              },
              {
                q: "What security measures protect my accounts?",
                a: "We employ multiple layers of security including 256-bit encryption, multi-factor authentication, biometric login options, real-time fraud monitoring, and FDIC insurance up to $250,000 per depositor.",
              },
              {
                q: "Do you offer business banking services?",
                a: "Yes, we provide comprehensive business banking solutions including business checking and savings accounts, commercial lending, merchant services, and treasury management for businesses of all sizes.",
              },
              {
                q: "Can I access my accounts internationally?",
                a: "Absolutely. Our mobile app and online banking platform are available worldwide. We also offer multi-currency accounts and competitive exchange rates for international transactions.",
              },
              {
                q: "How do I contact customer support?",
                a: "Our customer support team is available 24/7 by phone at 1-800-GLOBAL-TRUST, through our mobile app, or via live chat on our website. We also have over 150 branch locations nationwide.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="text-xl font-bold">{faq.q}</div>
                <div className="mt-3 text-gray-700">{faq.a}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/support"
              className="inline-flex items-center text-blue-600 font-bold text-lg hover:text-blue-800"
            >
              Visit our help center
              <svg
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}

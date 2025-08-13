// components/PublicHeader.tsx
import Link from "next/link";
import {
  BuildingOfficeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function PublicHeader() {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center">
            <div className="bg-blue-800 text-white rounded-lg w-10 h-10 flex items-center justify-center mr-3">
              <BuildingOfficeIcon className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-blue-900">
              GlobalTrust Bank
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-700 font-medium flex items-center">
                Personal
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-2 py-2 w-48 z-10">
                <Link
                  href="/checking"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                >
                  Checking
                </Link>
                <Link
                  href="/savings"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                >
                  Savings
                </Link>
                <Link
                  href="/credit-cards"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                >
                  Credit Cards
                </Link>
                <Link
                  href="/loans"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                >
                  Loans
                </Link>
              </div>
            </div>

            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-700 font-medium flex items-center">
                Business
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-2 py-2 w-48 z-10">
                <Link
                  href="/business-banking"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                >
                  Business Banking
                </Link>
                <Link
                  href="/commercial-lending"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                >
                  Commercial Lending
                </Link>
                <Link
                  href="/merchant-services"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                >
                  Merchant Services
                </Link>
                <Link
                  href="/treasury-management"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                >
                  Treasury Management
                </Link>
              </div>
            </div>

            <Link
              href="/wealth-management"
              className="text-gray-700 hover:text-blue-700 font-medium"
            >
              Wealth Management
            </Link>

            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-700 font-medium"
            >
              About Us
            </Link>

            <Link
              href="/locations"
              className="text-gray-700 hover:text-blue-700 font-medium"
            >
              Locations
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              <UserCircleIcon className="h-5 w-5 text-gray-500 mr-1" />
              <Link
                href="/login"
                className="px-4 py-2 text-blue-700 font-medium hover:text-blue-900"
              >
                Sign In
              </Link>
            </div>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-md bg-blue-700 text-white font-medium hover:bg-blue-800 transition-colors"
            >
              Enroll
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

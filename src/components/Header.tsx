// components/Header.jsx
"use client";
import { useState } from "react";
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "#", current: true },
    { name: "Accounts", href: "#", current: false },
    { name: "Pay & Transfer", href: "#", current: false },
    { name: "Investments", href: "#", current: false },
    { name: "Credit Cards", href: "#", current: false },
    { name: "Loans", href: "#", current: false },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-white text-blue-900 font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center mr-3">
                GT
              </div>
              <span className="text-xl font-bold">GlobalTrust Bank</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-10 md:flex md:space-x-6">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    item.current
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center">
            <button className="p-1 rounded-full text-blue-200 hover:text-white focus:outline-none">
              <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            <button className="ml-3 p-1 rounded-full text-blue-200 hover:text-white focus:outline-none">
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="ml-3 relative">
              <div className="flex items-center space-x-2 cursor-pointer">
                <UserCircleIcon className="h-8 w-8 text-white" />
                <span className="text-sm font-medium">John D.</span>
                <ChevronDownIcon className="h-4 w-4 text-blue-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

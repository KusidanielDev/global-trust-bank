// src/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import NotificationsBell from "./NotificationsBell";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const NAV = [
  { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
  { name: "Accounts", href: "/accounts", icon: BanknotesIcon },
  { name: "Transfer", href: "/transfer", icon: ArrowsRightLeftIcon },
  { name: "Deposit", href: "/deposit", icon: DocumentTextIcon },
  { name: "Loans", href: "/loans", icon: CreditCardIcon },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg border-b border-blue-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open main menu"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 min-w-max"
            >
              <div className="bg-blue-800 text-white rounded-lg w-10 h-10 flex items-center justify-center">
                <BuildingLibraryIcon className="h-6 w-6" />
              </div>
              <span className="text-lg font-bold text-white whitespace-nowrap">
                GlobalTrust Bank
              </span>
            </Link>
          </div>

          {/* Center: desktop nav */}
          <nav className="hidden md:flex items-center gap-1 max-w-[60%] overflow-x-auto no-scrollbar">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={`${item.name}-${item.href}`}
                  href={item.href}
                  className={`whitespace-nowrap flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-700 text-white shadow-inner"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-3 min-w-max">
            <Link
              href="/search"
              aria-label="Search"
              className="p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Link>

            <NotificationsBell />

            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 rounded-full bg-blue-700 px-3 py-1.5 hover:bg-blue-600 transition-colors"
            >
              <UserCircleIcon className="h-6 w-6 text-white" />
              <span className="text-sm font-medium">Account</span>
            </Link>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 rounded-full bg-blue-700 px-3 py-1.5 hover:bg-blue-600 transition-colors"
              aria-label="Sign out"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 text-white" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu + backdrop */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu"
            className="md:hidden border-t border-blue-700 bg-gradient-to-b from-blue-800 to-blue-900 relative z-10"
          >
            <nav className="px-4 py-3 space-y-1">
              {NAV.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={`m-${item.name}-${item.href}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium ${
                      active
                        ? "bg-blue-700 text-white"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile-only account and logout options */}
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
              >
                <UserCircleIcon className="h-5 w-5" />
                Account
              </Link>

              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-blue-100 hover:bg-blue-700 hover:text-white w-full"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                Sign out
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

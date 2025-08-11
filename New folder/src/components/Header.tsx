// src/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const NAV = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Accounts", href: "/accounts" },
  { name: "Transfer", href: "/transfer" },
  { name: "Deposit", href: "/deposit" },
  { name: "Withdraw", href: "/withdraw" },
  { name: "Loans", href: "/loans" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-blue-50 hover:text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
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

            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="bg-white text-blue-900 font-bold text-xl rounded-full w-10 h-10 grid place-items-center">
                GT
              </div>
              <span className="hidden sm:inline text-lg font-extrabold text-white drop-shadow">
                GlobalTrust Bank
              </span>
            </Link>
          </div>

          {/* Center: desktop nav */}
          <nav className="hidden md:flex items-center gap-2 max-w-[60%] overflow-x-auto no-scrollbar">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={`${item.name}-${item.href}`}
                  href={item.href}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-blue-800 text-white"
                      : "text-blue-50 hover:bg-white/15 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md text-blue-50 hover:text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <button
              className="p-2 rounded-md text-blue-50 hover:text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Notifications"
            >
              <BellIcon className="h-6 w-6" />
            </button>
            <button className="ml-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20">
              <UserCircleIcon className="h-7 w-7 text-white" />
              <span className="hidden sm:inline text-sm">Account</span>
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
            className="md:hidden border-t border-white/10 bg-gradient-to-b from-blue-900 to-indigo-900 relative z-10"
          >
            <nav className="px-4 py-3 space-y-1">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={`m-${item.name}-${item.href}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      active
                        ? "bg-blue-800 text-white"
                        : "text-blue-50 hover:bg-blue-800 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

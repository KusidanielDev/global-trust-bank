"use client";
import React from "react";
import {
  ArrowTrendingUpIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

// Define allowed account types
type AccountType = "checking" | "savings" | "credit" | "investment";

// Define structure of an account
interface Account {
  id: number;
  name: string;
  number: string;
  balance: number;
  type: AccountType;
  trend: "up" | "down";
  trendValue: number;
}

const AccountSummary: React.FC = () => {
  const accounts: Account[] = [
    {
      id: 1,
      name: "Checking Account",
      number: "****4832",
      balance: 12542.78,
      type: "checking",
      trend: "up",
      trendValue: 2.3,
    },
    {
      id: 2,
      name: "Savings Account",
      number: "****9012",
      balance: 35420.51,
      type: "savings",
      trend: "up",
      trendValue: 1.2,
    },
    {
      id: 3,
      name: "GlobalTrust Platinum",
      number: "****5544",
      balance: 8420.32,
      type: "credit",
      trend: "down",
      trendValue: 5.1,
    },
    {
      id: 4,
      name: "Investment Portfolio",
      number: "****6789",
      balance: 120450.23,
      type: "investment",
      trend: "up",
      trendValue: 3.7,
    },
  ];

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case "checking":
        return <BanknotesIcon className="h-6 w-6 text-blue-500" />;
      case "savings":
        return <BuildingLibraryIcon className="h-6 w-6 text-green-500" />;
      case "credit":
        return <CreditCardIcon className="h-6 w-6 text-purple-500" />;
      case "investment":
        return <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <BanknotesIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Account Summary</h2>
        <p className="mt-1 text-sm text-gray-500">Your accounts as of today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getAccountIcon(account.type)}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {account.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {account.number}
                  </span>
                </div>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  $
                  {account.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>

                <div
                  className={`mt-2 flex items-center text-sm ${
                    account.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <ArrowTrendingUpIcon
                    className={`h-4 w-4 mr-1 ${
                      account.trend === "down" ? "transform rotate-180" : ""
                    }`}
                  />
                  <span>{account.trendValue}% from last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 px-6 py-4 flex justify-end">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View All Accounts →
        </button>
      </div>
    </div>
  );
};

export default AccountSummary;

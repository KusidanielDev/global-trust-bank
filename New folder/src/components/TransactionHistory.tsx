// components/TransactionHistory.jsx
"use client";
import React, { useState } from "react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";

const TransactionHistory = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  const transactions = [
    {
      id: 1,
      date: "2023-06-15",
      description: "Amazon Online Purchase",
      category: "Shopping",
      amount: -89.99,
      type: "debit",
    },
    {
      id: 2,
      date: "2023-06-14",
      description: "Direct Deposit - Salary",
      category: "Income",
      amount: 4500.0,
      type: "credit",
    },
    {
      id: 3,
      date: "2023-06-12",
      description: "Starbucks Coffee",
      category: "Food & Dining",
      amount: -5.75,
      type: "debit",
    },
    {
      id: 4,
      date: "2023-06-10",
      description: "Electricity Bill",
      category: "Utilities",
      amount: -125.34,
      type: "debit",
    },
    {
      id: 5,
      date: "2023-06-08",
      description: "Transfer from Savings",
      category: "Transfer",
      amount: 1000.0,
      type: "credit",
    },
  ];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Recent Transactions
          </h2>
          <p className="mt-1 text-sm text-gray-500">Your account activity</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Filter
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </button>

          {filterOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  All Transactions
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Credits Only
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Debits Only
                </a>
                <div className="border-t border-gray-100"></div>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Last 7 Days
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Last 30 Days
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Custom Range
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {transaction.category}
                  </span>
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    transaction.type === "credit"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "credit" ? "+" : "-"}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-4 flex justify-end">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View All Transactions →
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;

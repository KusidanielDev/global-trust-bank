// components/QuickActions.jsx
import React from "react";
import {
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon,
  QrCodeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const QuickActions = () => {
  const actions = [
    {
      id: 1,
      name: "Transfer Money",
      icon: ArrowPathIcon,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      name: "Send Money",
      icon: ArrowUpIcon,
      color: "bg-green-100 text-green-600",
    },
    {
      id: 3,
      name: "Pay Bills",
      icon: DocumentTextIcon,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: 4,
      name: "Deposit Check",
      icon: QrCodeIcon,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: 5,
      name: "Request Money",
      icon: ArrowDownIcon,
      color: "bg-red-100 text-red-600",
    },
    {
      id: 6,
      name: "Open Account",
      icon: PlusIcon,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        <p className="mt-1 text-sm text-gray-500">
          Complete common banking tasks
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6">
        {actions.map((action) => (
          <button
            key={action.id}
            className="group flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
          >
            <div className={`mx-auto rounded-full p-3 ${action.color}`}>
              <action.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="mt-3 text-sm font-medium text-gray-700 group-hover:text-blue-600">
              {action.name}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 px-6 py-4">
        <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
          View All Services
        </button>
      </div>
    </div>
  );
};

export default QuickActions;

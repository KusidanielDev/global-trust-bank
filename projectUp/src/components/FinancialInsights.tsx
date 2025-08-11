// components/FinancialInsights.jsx
import React from "react";
import { ChartBarIcon, LightBulbIcon } from "@heroicons/react/24/outline";

const FinancialInsights = () => {
  const insights = [
    {
      id: 1,
      title: "Spending Trends",
      description:
        "Your dining expenses increased by 15% compared to last month",
      icon: ChartBarIcon,
      action: "Review Budget",
    },
    {
      id: 2,
      title: "Savings Opportunity",
      description: "You could save $120/month by refinancing your auto loan",
      icon: LightBulbIcon,
      action: "Explore Options",
    },
    {
      id: 3,
      title: "Investment Performance",
      description:
        "Your portfolio is outperforming the market by 3.2% this quarter",
      icon: ChartBarIcon,
      action: "View Details",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Financial Insights</h2>
        <p className="mt-1 text-sm text-gray-500">
          Personalized recommendations for you
        </p>
      </div>

      <div className="p-6 space-y-6">
        {insights.map((insight) => (
          <div key={insight.id} className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 p-3 rounded-full">
                <insight.icon
                  className="h-6 w-6 text-blue-600"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {insight.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {insight.description}
              </p>
              <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                {insight.action} →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 px-6 py-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Tip:</span> Set up automatic savings
            to reach your goals faster
          </p>
          <button className="text-sm font-medium text-blue-700 hover:text-blue-900">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;

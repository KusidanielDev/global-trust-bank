// components/SecurityFeatures.jsx
import React from "react";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";

const SecurityFeatures = () => {
  const features = [
    {
      id: 1,
      name: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest",
      icon: LockClosedIcon,
    },
    {
      id: 2,
      name: "FDIC Insured",
      description: "Deposits insured up to $250,000",
      icon: ShieldCheckIcon,
    },
    {
      id: 3,
      name: "Biometric Login",
      description: "Secure access with face or fingerprint",
      icon: FingerPrintIcon,
    },
    {
      id: 4,
      name: "Account Monitoring",
      description: "24/7 fraud detection and alerts",
      icon: DevicePhoneMobileIcon,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl shadow-lg text-white">
      <div className="p-6">
        <h2 className="text-xl font-bold">Security & Protection</h2>
        <p className="mt-1 text-blue-200 text-sm">
          Your finances are safeguarded
        </p>
      </div>

      <div className="p-6 space-y-6">
        {features.map((feature) => (
          <div key={feature.id} className="flex items-start">
            <div className="flex-shrink-0">
              <feature.icon
                className="h-6 w-6 text-blue-300"
                aria-hidden="true"
              />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium">{feature.name}</h3>
              <p className="mt-1 text-sm text-blue-200">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-black bg-opacity-20 px-6 py-4">
        <button className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-white bg-blue-700 bg-opacity-20 hover:bg-opacity-30 focus:outline-none">
          Learn About Our Security
        </button>
      </div>
    </div>
  );
};

export default SecurityFeatures;

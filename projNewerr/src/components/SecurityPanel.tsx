import Link from "next/link";
import { ShieldCheckIcon, LockClosedIcon, BellAlertIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

export default function SecurityPanel() {
  return (
    <div className="bg-white rounded-2xl border shadow p-5">
      <h2 className="text-lg font-semibold text-gray-900">Security & Protection</h2>
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="h-6 w-6 text-green-600" />
          <div><div className="font-semibold text-gray-900">Protected accounts</div><div className="text-sm text-gray-700">Encryption at rest and in transit.</div></div>
        </div>
        <div className="flex items-start gap-3">
          <LockClosedIcon className="h-6 w-6 text-blue-700" />
          <div><div className="font-semibold text-gray-900">Two-factor authentication</div><div className="text-sm text-gray-700">Add an extra layer of security.</div></div>
        </div>
        <div className="flex items-start gap-3">
          <BellAlertIcon className="h-6 w-6 text-amber-600" />
          <div><div className="font-semibold text-gray-900">Real-time alerts</div><div className="text-sm text-gray-700">Get notified for unusual activity.</div></div>
        </div>
        <div className="flex items-start gap-3">
          <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600" />
          <div><div className="font-semibold text-gray-900">Device protections</div><div className="text-sm text-gray-700">Biometrics supported on mobile.</div></div>
        </div>
      </div>
      <div className="mt-4"><Link href="/profile" className="text-blue-700 hover:underline">Manage security settings →</Link></div>
    </div>
  );
}

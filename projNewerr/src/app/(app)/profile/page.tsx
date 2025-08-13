import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

async function updateName(formData: FormData) {
  "use server";
  const { user } = await requireSession();
  const name = String(formData.get("name") || "").trim();
  if (name) {
    await prisma.user.update({
      where: { id: (user as any).id },
      data: { name },
    });
  }
  redirect("/profile");
}

async function changePassword(formData: FormData) {
  "use server";
  const { user } = await requireSession();
  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  if (!current || !next) throw new Error("Missing fields");

  const db = await prisma.user.findUnique({ where: { id: (user as any).id } });
  if (!db) throw new Error("User not found");
  const ok = await bcrypt.compare(current, db.password);
  if (!ok) throw new Error("Current password is incorrect");

  const hash = await bcrypt.hash(next, 10);
  await prisma.user.update({ where: { id: db.id }, data: { password: hash } });
  redirect("/profile");
}

export default async function ProfilePage() {
  const { user } = await requireSession();
  const dbUser = await prisma.user.findUnique({
    where: { id: (user as any).id },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="bg-blue-600 w-24 h-24 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <span className="text-3xl font-bold">
                {dbUser?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
              <p className="text-blue-200">
                Manage your personal information and security settings
              </p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                <div className="bg-blue-700 px-3 py-1 rounded-full text-xs flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Verified Account
                </div>
                <div className="bg-blue-700 px-3 py-1 rounded-full text-xs flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Secure Login
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Account Information
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {dbUser?.name || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-900">
                    {dbUser?.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {dbUser?.createdAt
                      ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="font-medium text-green-600">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Security Status
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Two-Factor Authentication
                    </p>
                    <p className="font-medium text-gray-900">Not enabled</p>
                  </div>
                  <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Login Alerts</p>
                    <p className="font-medium text-gray-900">Active</p>
                  </div>
                  <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                    Manage
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Password</p>
                    <p className="font-medium text-gray-900">
                      Last changed: 3 months ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Personal Information
                </h2>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Required fields
                </div>
              </div>

              <form action={updateName} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      defaultValue={dbUser?.name || ""}
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 pl-10"
                      placeholder="Enter your full name"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={dbUser?.email || ""}
                      readOnly
                      className="w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm p-3 pl-10"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Contact customer support to change your email address
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Password & Security
                </h2>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Highly sensitive
                </div>
              </div>

              <form action={changePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="current"
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 pl-10"
                      placeholder="Enter your current password"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="next"
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 pl-10"
                      placeholder="Create a new password"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-500">
                        8+ characters
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-500">
                        Uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-500">Number</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-500">
                        Special character
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-6 md:mb-0 md:mr-6">
                  <div className="bg-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold mb-2">Security Guarantee</h3>
                  <p className="text-blue-200">
                    We protect your personal information with bank-level
                    security. All data is encrypted and your accounts are
                    monitored 24/7 for suspicious activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    setUser(u ? JSON.parse(u) : null);
  }, []);

  if (!user) return <div className="max-w-xl mx-auto p-4">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6 flex items-center gap-6 mb-6">
        <div className="w-20 h-20 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-3xl border border-primary-200">
          {user.name?.split(" ").map((w) => w[0]).join("").toUpperCase() || <User className="w-8 h-8" />}
        </div>
        <div>
          <div className="font-semibold text-xl mb-1">{user.name}</div>
          <div className="text-sm text-gray-600 mb-1">{user.email}</div>
          <div className="text-xs text-gray-500">Role: {user.role}</div>
          <div className="text-xs text-gray-400">Company ID: {user.company_id}</div>
        </div>
      </div>
      <div className="bg-blue-50 rounded-lg p-4 text-gray-700">
        <div className="font-semibold mb-2">Settings (Coming Soon)</div>
        <div className="text-xs">You will be able to update your profile and preferences here.</div>
      </div>
    </div>
  );
} 
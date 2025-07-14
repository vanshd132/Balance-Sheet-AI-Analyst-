"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import BalanceSheetUpload from "./BalanceSheetUpload";
import BalanceSheetList from "./BalanceSheetList";
import TopManagementPanel from "./TopManagementPanel";
import { BarChart2, FileUp, Search, Users, TrendingUp, ShieldCheck, Layers3, Sparkles, Building2, UserCircle, LogOut, Zap } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "analyst": return "Financial Analyst";
      case "ceo": return "Chief Executive Officer";
      case "top_management": return "Top Management";
      default: return role.replace("_", " ");
    }
  };

  const getWelcomeMessage = (role) => {
    switch (role) {
      case "analyst": return "Ready to analyze and upload balance sheets?";
      case "ceo": return "Get AI-powered insights for strategic decisions.";
      case "top_management": return "Monitor performance across all group companies.";
      default: return "Welcome to your financial dashboard.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Welcome Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 rounded-full">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Welcome back, {user.name}! 👋
                </h1>
                <p className="text-gray-600 mb-2">
                  {getRoleDisplayName(user.role)} • {getWelcomeMessage(user.role)}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="w-4 h-4" />
                  <span>Company ID: {user.company_id}</span>
                </div>
              </div>
            </div>
            <button
              className="btn-secondary flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/");
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Role-based content */}
        {user.role === "analyst" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                <div className="bg-blue-500 p-3 rounded-full mb-4">
                  <FileUp className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold text-lg mb-2">Upload & Review</div>
                <div className="text-sm text-gray-600">Upload and review balance sheets with detailed analysis</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                <div className="bg-green-500 p-3 rounded-full mb-4">
                  <BarChart2 className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold text-lg mb-2">Analyze Performance</div>
                <div className="text-sm text-gray-600">Deep dive into company performance metrics</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
                <div className="bg-purple-500 p-3 rounded-full mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold text-lg mb-2">Generate Reports</div>
                <div className="text-sm text-gray-600">Create comprehensive financial reports</div>
              </div>
            </div>
            <BalanceSheetUpload companyId={user.company_id} />
            <BalanceSheetList companyId={user.company_id} userRole={user.role} />
          </>
        )}
        {user.role === "ceo" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                <div className="bg-blue-500 p-3 rounded-full mb-4">
                  <Layers3 className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold text-lg mb-2">View Balance Sheets</div>
                <div className="text-sm text-gray-600">Access comprehensive balance sheet data</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                <div className="bg-green-500 p-3 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold text-lg mb-2">AI Insights</div>
                <div className="text-sm text-gray-600">Get strategic AI-powered insights</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                <div className="bg-orange-500 p-3 rounded-full mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold text-lg mb-2">Monitor Metrics</div>
                <div className="text-sm text-gray-600">Track key financial performance indicators</div>
              </div>
            </div>
            <BalanceSheetList companyId={user.company_id} userRole={user.role} />
          </>
        )}
        {user.role === "top_management" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                <div className="bg-blue-500 p-3 rounded-full mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold text-lg mb-2">Group Performance</div>
                <div className="text-sm text-gray-600">Monitor all group companies' performance</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                <div className="bg-green-500 p-3 rounded-full mb-4">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold text-lg mb-2">Compare Verticals</div>
                <div className="text-sm text-gray-600">Compare performance across business verticals</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
                <div className="bg-purple-500 p-3 rounded-full mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="font-semibold text-lg mb-2">AI Recommendations</div>
                <div className="text-sm text-gray-600">Strategic AI-powered recommendations</div>
              </div>
            </div>
            <TopManagementPanel token={localStorage.getItem("token")} />
          </>
        )}
      </div>
    </div>
  );
} 
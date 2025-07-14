"use client";

import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function BalanceSheetCharts({ sheets }) {
  // Prepare data for charts
  const chartData = useMemo(() => {
    return (sheets || [])
      .map((sheet) => ({
        year: sheet.year + (sheet.quarter ? ` Q${sheet.quarter}` : ""),
        assets: sheet.data?.total_assets || 0,
        liabilities: sheet.data?.total_liabilities || 0,
        revenue: sheet.data?.revenue || 0,
        net_income: sheet.data?.net_income || 0,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [sheets]);

  if (!chartData.length) {
    return <div className="card mb-6 text-gray-500">No data to visualize.</div>;
  }

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">Financial Trends</h2>
      <div className="w-full h-72 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="assets" stroke="#2563eb" name="Assets" />
            <Line type="monotone" dataKey="liabilities" stroke="#ef4444" name="Liabilities" />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue" />
            <Line type="monotone" dataKey="net_income" stroke="#f59e42" name="Net Income" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="assets" fill="#2563eb" name="Assets" />
            <Bar dataKey="liabilities" fill="#ef4444" name="Liabilities" />
            <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
            <Bar dataKey="net_income" fill="#f59e42" name="Net Income" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 
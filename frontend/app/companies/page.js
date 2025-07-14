"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Building2 } from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    setUser(u ? JSON.parse(u) : null);
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:5000/api/users/my-companies", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCompanies(res.data.companies || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Companies</h1>
      {loading ? (
        <div>Loading...</div>
      ) : companies.length === 0 ? (
        <div className="text-gray-500">No companies found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((c) => (
            <div key={c.id} className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-2xl border border-primary-200">
                {c.name.split(" ").map((w) => w[0]).join("").toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-lg">{c.name}</div>
                <div className="text-xs text-gray-500 mb-1">Industry: {c.industry || "N/A"}</div>
                <div className="text-xs text-gray-400">Created: {c.created_at ? c.created_at.split("T")[0] : "N/A"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
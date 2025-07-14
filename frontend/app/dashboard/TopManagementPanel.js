"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import BalanceSheetList from "./BalanceSheetList";

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function TopManagementPanel({ token }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/users/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(res.data.companies || []);
        if (res.data.companies && res.data.companies.length > 0) {
          // Prefer 'Reliance Industries' if present, else first company
          const reliance = res.data.companies.find(c => c.name.toLowerCase().includes('reliance industries'));
          setSelectedCompany(reliance ? reliance.id : res.data.companies[0].id);
        }
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, [token]);

  const selected = companies.find((c) => c.id == selectedCompany);

  return (
    <div className="card mb-6">
      {loading ? (
        <div>Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="text-gray-500">No companies found.</div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Company</label>
          <div className="relative w-full max-w-xs">
            <select
              className="input-field pl-12 pr-4 py-2 appearance-none cursor-pointer font-semibold text-lg"
              value={selectedCompany || ''}
              onChange={e => setSelectedCompany(e.target.value)}
              style={{ minHeight: 48 }}
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {selected && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-base border border-primary-200">
                {getInitials(selected.name)}
              </div>
            )}
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▼</div>
          </div>
          {selected && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-200 text-primary-800 rounded-full flex items-center justify-center font-bold text-lg border border-primary-300">
                {getInitials(selected.name)}
              </div>
              <div>
                <div className="font-semibold text-lg">{selected.name}</div>
                <div className="text-xs text-gray-500">Industry: {selected.industry || 'N/A'}</div>
                <div className="text-xs text-gray-400">Created: {selected.created_at ? selected.created_at.split('T')[0] : 'N/A'}</div>
              </div>
            </div>
          )}
        </div>
      )}
      {selectedCompany && (
        <BalanceSheetList companyId={selectedCompany} userRole="top_management" />
      )}
    </div>
  );
} 
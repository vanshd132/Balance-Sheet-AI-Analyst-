"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import BalanceSheetCharts from "./BalanceSheetCharts";
import AIChatPanel from "./AIChatPanel";
import { Eye, FileText, Calendar, User, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

function DetailModal({ open, onClose, sheet }) {
  if (!open || !sheet) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Balance Sheet Details</h3>
            <p className="text-sm text-gray-600">Financial data for {sheet.year} Q{sheet.quarter || 'N/A'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(sheet.data || {}).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 capitalize font-medium">{key.replace(/_/g, ' ')}</span>
              <div className="font-semibold text-gray-800 text-lg">${Number(value).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{sheet.year} {sheet.quarter ? `Q${sheet.quarter}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{sheet.uploaded_by}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BalanceSheetList({ companyId, userRole }) {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchSheets() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/balance-sheet/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSheets(res.data.balance_sheets || []);
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to fetch balance sheets");
      } finally {
        setLoading(false);
      }
    }
    if (companyId) fetchSheets();
  }, [companyId]);

  const companyName = sheets.length > 0 ? sheets[0].company_name || "Selected Company" : "Selected Company";

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Balance Sheets</h2>
          <p className="text-sm text-gray-600">Financial data for {companyName}</p>
        </div>
      </div>

      {sheets.length > 0 && <BalanceSheetCharts sheets={sheets} />}
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading balance sheets...</div>
          </div>
        </div>
      ) : sheets.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Balance Sheets Found</h3>
          <p className="text-gray-600 mb-4">Upload your first balance sheet to get started with financial analysis.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span>Upload a balance sheet above to see data here</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Balance Sheets</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{sheets.length} sheet{sheets.length !== 1 ? 's' : ''} available</span>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Period
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Uploaded By
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sheets.map((sheet, idx) => (
                  <tr key={sheet.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">
                          {sheet.year}
                        </div>
                        {sheet.quarter && (
                          <div className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-medium">
                            Q{sheet.quarter}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sheet.uploaded_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-900">Complete</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="btn-secondary flex items-center gap-2 ml-auto"
                        onClick={() => setSelected(sheet)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <DetailModal open={!!selected} onClose={() => setSelected(null)} sheet={selected} />
      <AIChatPanel companyId={companyId} companyName={companyName} />
    </div>
  );
} 
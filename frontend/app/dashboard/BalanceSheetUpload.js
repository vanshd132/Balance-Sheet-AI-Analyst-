"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Upload, FileText, Database, Calendar, HelpCircle, CheckCircle, AlertCircle } from "lucide-react";

const exampleJson = `{
  "total_assets": 1000000,
  "current_assets": 400000,
  "total_liabilities": 500000,
  "current_liabilities": 200000,
  "total_equity": 500000,
  "revenue": 1200000,
  "net_income": 100000
}`;

export default function BalanceSheetUpload({ companyId }) {
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(2023);
  const [quarter, setQuarter] = useState(4);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("file"); // "file" or "manual"
  const [manualData, setManualData] = useState({
    total_assets: "",
    current_assets: "",
    total_liabilities: "",
    current_liabilities: "",
    total_equity: "",
    revenue: "",
    net_income: ""
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleManualChange = (e) => {
    setManualData({
      ...manualData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("company_id", companyId);
      formData.append("year", year);
      formData.append("quarter", quarter);
      if (mode === "file") {
        if (!file) {
          toast.error("Please select a file.");
          setLoading(false);
          return;
        }
        formData.append("file", file);
      } else {
        // Manual mode: create a Blob from JSON
        const data = {};
        Object.keys(manualData).forEach((k) => {
          if (manualData[k] !== "") data[k] = Number(manualData[k]);
        });
        if (Object.keys(data).length === 0) {
          toast.error("Please fill at least one field.");
          setLoading(false);
          return;
        }
        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        formData.append("file", blob, "manual.json");
      }
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/balance-sheet/upload",
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Balance sheet uploaded successfully! 🎉");
      setFile(null);
      setManualData({
        total_assets: "",
        current_assets: "",
        total_liabilities: "",
        current_liabilities: "",
        total_equity: "",
        revenue: "",
        net_income: ""
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
          <Upload className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Upload Balance Sheet</h2>
          <p className="text-sm text-gray-600">Add new financial data to your company's records</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode Selection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                mode === "file" 
                  ? "bg-blue-100 text-blue-800 border-2 border-blue-300" 
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setMode("file")}
            >
              <FileText className="w-4 h-4" />
              Upload JSON File
            </button>
            <button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                mode === "manual" 
                  ? "bg-blue-100 text-blue-800 border-2 border-blue-300" 
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setMode("manual")}
            >
              <Database className="w-4 h-4" />
              Manual Entry
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HelpCircle className="w-4 h-4" />
            <span>
              {mode === "file" 
                ? "Upload a JSON file with your balance sheet data" 
                : "Enter balance sheet data manually"
              }
            </span>
          </div>
        </div>

        {/* Year and Quarter Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Financial Year
            </label>
            <input
              type="number"
              className="input-field"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2000"
              max="2100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quarter</label>
            <select
              className="input-field"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              required
            >
              <option value={1}>Q1 (Jan-Mar)</option>
              <option value={2}>Q2 (Apr-Jun)</option>
              <option value={3}>Q3 (Jul-Sep)</option>
              <option value={4}>Q4 (Oct-Dec)</option>
            </select>
          </div>
        </div>

        {/* File Upload or Manual Entry */}
        {mode === "file" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Balance Sheet File (JSON)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    {file ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                        <p className="text-xs text-gray-500 mt-1">JSON files only</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <span className="text-sm font-medium text-blue-800">Example JSON Format:</span>
              </div>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">{exampleJson}</pre>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-600 mt-0.5" />
                <span className="text-sm font-medium text-blue-800">Enter Financial Data</span>
              </div>
              <p className="text-xs text-blue-700">Fill in the financial metrics below. Leave empty if not applicable.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(manualData).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1 capitalize">
                    {key.replace(/_/g, " ")}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={manualData[key]}
                    onChange={handleManualChange}
                    className="input-field"
                    min="0"
                    step="any"
                    placeholder="Enter amount..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-lg font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Balance Sheet
            </>
          )}
        </button>
      </form>
    </div>
  );
} 
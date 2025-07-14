"use client";

import { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Bot, Send, Sparkles, MessageCircle, Lightbulb, Clock } from "lucide-react";

function extractSuggestions(aiText) {
  // Look for 'SuggestedQuestions: [ ... ]' and parse the JSON array
  const match = aiText.match(/SuggestedQuestions:\s*(\[.*?\])/s);
  if (!match) return [];
  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

function cleanAIText(aiText) {
  // Remove the SuggestedQuestions: [ ... ] part from the AI answer
  return aiText.replace(/SuggestedQuestions:\s*\[.*?\]\s*$/s, '').trim();
}

export default function AIChatPanel({ companyId, companyName }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const defaultSuggestions = [
    `Show me the latest financial highlights for ${companyName}`,
    `What are the key risks for ${companyName}?`,
    `How has ${companyName}'s revenue changed over time?`,
    `Analyze the debt-to-equity ratio for ${companyName}`
  ];

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input, timestamp: new Date() };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/chat/analyze",
        {
          question: input,
          company_id: companyId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", text: res.data.response, timestamp: new Date() }
      ]);
      setSuggestions(extractSuggestions(res.data.response));
    } catch (err) {
      toast.error(err.response?.data?.error || "AI analysis failed");
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", text: "[Error: AI analysis failed]", timestamp: new Date() }
      ]);
      setSuggestions([]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  function formatAIText(text) {
    // Replace ## or **Heading:** with bold headings
    let formatted = text
      .replace(/\*\*(.+?):\*\*/g, '<strong>$1:</strong>') // **Heading:**
      .replace(/##\s?(.+)/g, '<strong>$1</strong>') // ## Heading
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/\n\s*\*/g, '\n•') // bullet points
      .replace(/^\s*\*/gm, '•') // bullet points at start of line
      .replace(/\n{2,}/g, '<br/><br/>') // double newlines to paragraph
      .replace(/\n/g, '<br/>'); // single newline to line break
    return formatted;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Chat & Analysis</h2>
          <p className="text-sm text-gray-600">Ask questions about <span className="font-semibold">{companyName}</span>'s financial data</p>
        </div>
      </div>

      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 p-2 rounded-full">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Welcome to AI Financial Analysis! 🤖</h3>
              <p className="text-sm text-gray-600 mb-3">
                I can help you analyze {companyName}'s balance sheets, identify trends, and provide insights. 
                Try asking about financial ratios, growth patterns, or risk assessments.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MessageCircle className="w-3 h-3" />
                <span>Powered by Google Gemini AI</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-gray-50 rounded-lg p-4 h-80 overflow-y-auto mb-4 flex flex-col space-y-4">
        {messages.length === 0 && (
          <div className="text-center my-auto">
            <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-gray-500 text-sm">Start the conversation!</div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex items-end gap-3 max-w-2xl">
              {msg.role === "ai" && (
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-2 flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                msg.role === "user" 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md" 
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
              }`}
                style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                dangerouslySetInnerHTML={msg.role === "ai" ? { __html: formatAIText(cleanAIText(msg.text)) } : undefined}
              >
                {msg.role === "user" ? msg.text : null}
              </div>
              {msg.role === "user" && (
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-full p-2 flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex items-end ml-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-2">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-gray-600">Analyzing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="flex gap-3 items-center">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Ask about financial performance, ratios, trends..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn-primary flex items-center gap-2 px-6 py-3"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Send
            </>
          )}
        </button>
      </form>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Try these questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {defaultSuggestions.map((q, i) => (
              <button
                key={i}
                className="btn-secondary text-sm px-3 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => {
                  setInput(q);
                  setTimeout(() => {
                    document.querySelector('input[type="text"]')?.focus();
                  }, 50);
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {messages.length > 0 && suggestions.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">AI Suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((q, i) => (
              <button
                key={i}
                className="btn-secondary text-sm px-3 py-2 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                onClick={() => {
                  setInput(q);
                  setTimeout(() => {
                    document.querySelector('input[type="text"]')?.focus();
                  }, 50);
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
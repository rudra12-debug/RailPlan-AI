"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { useAuth } from "@/context/AuthContext";
import { queryRailwayAI, AiQueryResult } from "@/lib/aiRAGKnowledge";
import {
  Bot,
  Send,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  BookOpen,
  Key,
  Minimize2,
  Maximize2
} from "lucide-react";

interface ChatEntry {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  result?: AiQueryResult;
}

export function IRSahayakCopilot({
  isOpen,
  onClose,
  onNavigateTab,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: "OCC" | "BUNDLER" | "EMERGENCY" | "SANCTIONS") => void;
}) {
  const { assets, trains, blockRequests, t806Sanctions, bundles } = useRailPlan();
  const { user } = useAuth();

  const [inputQuery, setInputQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: `👋 **Namaste ${user?.name || "Officer"}! I am IR-Sahayak (रेल सहायक)** — your AI Railway Operations & Maintenance Copilot.\n\nI am connected to the **National Digital Twin Telemetry Mesh (10 Corridors, 500+ Assets, 50+ Moving Trains)**, monitoring cross-directorate maintenance and statutory compliance under **G&SR 1976 & IRPWM 2020**.\n\nHow may I assist you today?`,
      timestamp: "Just now",
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const PROMPT_CHIPS = [
    "Show high-risk track sections between KM 80 and 120.",
    "Which Civil and OHE blocks can be bundled tomorrow morning?",
    "Check compliance checklist for 25kV OHE isolation under T/806.",
    "Simulate OHE wire snap at Barkhera Ghat (KM 114/2).",
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userEntry: ChatEntry = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => [...prev, userEntry]);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const response = queryRailwayAI(query, {
        assets,
        trains,
        requests: blockRequests,
        sanctions: t806Sanctions,
        bundles,
        currentUser: user,
      });

      const botEntry: ChatEntry = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        result: response,
      };

      setChatHistory((prev) => [...prev, botEntry]);
      setIsTyping(false);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for easy mobile/desktop dismissal */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-label="Close AI Copilot"
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] z-50 bg-[#0C1326]/98 border-l border-[#1A274E] shadow-2xl backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 bg-gradient-to-r from-[#050814] via-[#0C1326] to-[#131E3D] border-b border-[#1A274E] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#131E3D] border border-[#3DFDCE]/30 text-[#3DFDCE]">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-bold text-[#F8FAFC]">IR-Sahayak AI Copilot</h3>
              <span className="text-[10px] font-mono font-bold bg-[#131E3D] text-[#3DFDCE] px-1.5 py-0.2 rounded border border-[#3DFDCE]/40">
                G&SR RAG
              </span>
            </div>
            <p className="text-[11px] text-[#B6BFFF] font-mono">
              National Central OCC • Continuous RAG Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="p-1.5 rounded-lg hover:bg-[#131E3D] text-slate-400 hover:text-slate-200 transition"
            title="Configure Gemini API Key"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Optional API Key Drawer Dropdown */}
      {showKeyConfig && (
        <div className="p-3 bg-[#050814] border-b border-[#1A274E] text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Optional Gemini / OpenAI API Key:</span>
            </span>
            <span className="text-[10px] text-[#3DFDCE] font-mono">Local Fallback Active</span>
          </div>
          <input
            type="password"
            placeholder="Enter AI API Key (sk-...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-[#0C1326] border border-[#1A274E] rounded-lg px-3 py-1.5 text-xs text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#6367FF]"
          />
          <p className="text-[10px] text-[#B6BFFF]">
            If left blank, IR-Sahayak runs entirely on embedded Indian Railways Domain Knowledge (G&SR 1976, IRPWM 2020, CRIS TMS).
          </p>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-xs space-y-2 leading-relaxed ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-[#6367FF] to-[#8494FF] text-white font-semibold rounded-br-none shadow-md"
                  : "bg-[#131E3D] border border-[#1A274E] text-[#F8FAFC] rounded-bl-none shadow-md"
              }`}
            >
              {/* Formatted Message text with whitespace */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Structured Stats Card if present */}
              {msg.result?.statsCard && (
                <div className="p-2.5 rounded-xl bg-[#050814] border border-[#3DFDCE]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#B6BFFF] block">{msg.result.statsCard.title}</span>
                    <span className="text-sm font-bold font-mono text-[#3DFDCE]">
                      {msg.result.statsCard.metric}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#B6BFFF]">{msg.result.statsCard.subtext}</span>
                </div>
              )}

              {/* Relevant G&SR Rules Citations */}
              {msg.result?.relevantRules && msg.result.relevantRules.length > 0 && (
                <div className="pt-2 border-t border-[#1A274E] flex flex-wrap gap-1.5">
                  {msg.result.relevantRules.map((rule) => (
                    <span
                      key={rule.code}
                      className="px-2 py-0.5 rounded bg-[#050814] border border-[#1A274E] text-[10px] font-mono text-[#3DFDCE]"
                    >
                      {rule.code}: {rule.title}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Button if recommended */}
              {msg.result?.suggestedAction && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      if (msg.result?.suggestedAction?.targetTab && onNavigateTab) {
                        onNavigateTab(msg.result.suggestedAction.targetTab);
                        onClose();
                      }
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#6367FF] to-[#8494FF] text-white font-bold text-[11px] flex items-center justify-center space-x-1.5 shadow transition"
                  >
                    <span>{msg.result.suggestedAction.label}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-[#8494FF] px-1 mt-1">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-[#B6BFFF] text-xs font-mono p-2">
            <span className="w-2 h-2 rounded-full bg-[#3DFDCE] animate-ping" />
            <span>IR-Sahayak is consulting G&SR 1976 & live telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-3 bg-[#050814] border-t border-[#1A274E] space-y-1.5">
        <span className="text-[10px] font-mono text-[#B6BFFF] uppercase tracking-wider block">
          Suggested Railway Prompt Chips:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-lg bg-[#131E3D] hover:bg-[#1A274E] border border-[#1A274E] text-[11px] text-[#B6BFFF] hover:text-[#3DFDCE] transition text-left"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 bg-[#050814] border-t border-[#1A274E]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask IR-Sahayak about track health, bundling, G&SR rules..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-[#0C1326] border border-[#1A274E] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#6367FF]"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#6367FF] to-[#8494FF] text-white disabled:opacity-50 transition shadow-md font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
    </>
  );
}

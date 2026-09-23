"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import { 
  ChatMessage, 
  STARTER_PROMPTS, 
  generateChatbotResponse 
} from "@/lib/aiChatbotKnowledge";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ArrowRight, 
  RotateCcw, 
  Minimize2, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  Zap,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export const AiChatbot: React.FC = () => {
  const { user } = useAuth();
  const { 
    requests, 
    maintenanceTasks, 
    bundles, 
    departments, 
    corridors, 
    assets 
  } = useRailPlan();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: `👋 **Namaste! I am your RailPlan AI Assistant (IR-Sahayak).**

I am here to simplify complicated railway maintenance planning, predictive telemetry, task bundling, and approval workflows.

Ask me anything or click one of the quick topics below!`,
      timestamp: "Just now",
      quickReplies: [
        "✨ Explain Task Bundling",
        "📋 How does the approval workflow work?",
        "🔍 Why is Signal S-204 at 87% failure risk?",
        "⚡ What happens in Emergency Replan?",
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const response = generateChatbotResponse(query, {
        user,
        requests,
        maintenanceTasks,
        bundles,
        departments,
        corridors,
        assets,
      });

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionButton: response.actionButton,
        quickReplies: response.quickReplies,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "bot",
        text: `🧹 **Chat history cleared!** How can I assist your railway operations today?`,
        timestamp: "Just now",
        quickReplies: STARTER_PROMPTS.slice(0, 4),
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Trigger Button - Compact, Solid Tactile */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open IR-Sahayak Railway Assistant"
            title="Ask IR-Sahayak AI Copilot"
            className="w-12 h-12 rounded-xl bg-[#6367FF] text-white shadow-[3px_3px_0_#000000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000000] active:translate-y-0.5 active:shadow-[1px_1px_0_#000000] flex items-center justify-center transition-all duration-150 border-2 border-black"
          >
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00FFD2] border-2 border-black rounded-full animate-pulse" />
          </button>
        </div>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 shadow-[6px_6px_0_#000000] flex flex-col overflow-hidden bg-[#022642] border-2 border-black ${
            isExpanded
              ? "inset-4 sm:inset-10 rounded-2xl"
              : "bottom-4 right-4 w-[95vw] sm:w-[440px] h-[640px] max-h-[90vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-[#011B30] border-b-2 border-black flex items-center justify-between relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38]" />
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#022642] flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000000]">
                <Bot className="w-5 h-5 text-[#00FFD2] font-bold" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-black text-white">IR-Sahayak AI</h3>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black bg-[#00FFD2] text-black border border-black shadow-[1px_1px_0_#000000]">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Railway Board Digital Assistant • {user?.departmentName || "Central Authority"}
                </p>
              </div>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center space-x-1.5 text-slate-300">
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-lg bg-[#022642] hover:bg-[#03345A] border border-black text-white transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Minimize" : "Maximize"}
                className="p-1.5 rounded-lg bg-[#022642] hover:bg-[#03345A] border border-black text-white transition hidden sm:block cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 rounded-lg bg-[#FB2077] hover:brightness-110 border border-black text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Context Banner */}
          <div className="px-4 py-2 bg-[#000D18] border-b-2 border-black flex items-center justify-between text-[11px] text-slate-300">
            <span className="truncate">
              Active Officer: <strong className="text-white">{user?.name}</strong> ({user?.designation})
            </span>
            <span className="text-[10px] font-mono font-bold text-[#00FFD2] bg-[#011B30] px-2 py-0.5 rounded border border-black">
              {user?.role === "CENTRAL_ADMIN" ? "Admin Mode" : user?.departmentId}
            </span>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text bg-[#022642]">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${
                    isBot ? "justify-start" : "justify-end flex-row-reverse space-x-reverse"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border-2 border-black shadow-[1px_1px_0_#000000] ${
                      isBot
                        ? "bg-[#011B30] text-[#00FFD2]"
                        : "bg-[#6367FF] text-white"
                    }`}
                  >
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] space-y-2.5 ${isBot ? "" : "text-right"}`}>
                    <div
                      className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line border-2 border-black ${
                        isBot
                          ? "bg-[#011B30] text-white shadow-[2px_2px_0_#000000]"
                          : "bg-[#6367FF] text-white font-bold shadow-[2px_2px_0_#000000]"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Action Button (Deep-link) */}
                    {msg.actionButton && (
                      <div className="pt-1">
                        <Link
                          href={msg.actionButton.href}
                          onClick={() => {
                            if (!isExpanded) setIsOpen(false);
                          }}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#011B30] hover:bg-[#03345A] text-[#00FFD2] border-2 border-black shadow-[2px_2px_0_#000000] font-bold transition text-[11px] group cursor-pointer"
                        >
                          <span>{msg.actionButton.label}</span>
                          <ExternalLink className="w-3 h-3 text-[#00FFD2] group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    )}

                    {/* Quick Replies Suggestion Chips */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {msg.quickReplies.map((reply, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(reply)}
                            className="px-2.5 py-1 rounded-lg bg-[#011B30] hover:bg-[#03345A] border border-black text-[#00FFD2] hover:text-white text-[10px] font-bold transition text-left cursor-pointer shadow-[1px_1px_0_#000000]"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 font-mono px-1">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-2 text-slate-300 p-2 text-xs">
                <div className="w-6 h-6 rounded-lg bg-[#011B30] text-[#00FFD2] flex items-center justify-center border border-black shadow-[1px_1px_0_#000000]">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FFD2] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FFD2] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FFD2] animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-[11px] text-slate-300 ml-1.5 font-mono">Analyzing railway telemetry...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Prompts Strip */}
          <div className="px-3 py-2 bg-[#000D18] border-t-2 border-black overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5">
            <span className="text-[10px] text-[#00FFD2] font-bold uppercase tracking-wider shrink-0 flex items-center mr-1">
              <Zap className="w-3 h-3 text-[#FFFF00] mr-1" /> Suggestions:
            </span>
            {STARTER_PROMPTS.slice(0, 5).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-[#022642] hover:bg-[#03345A] border border-black text-slate-200 hover:text-white text-[10px] font-bold transition shrink-0 cursor-pointer shadow-[1px_1px_0_#000000]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#011B30] border-t-2 border-black flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g. 'How does task bundling work?', 'Explain SR-1042')..."
              className="flex-1 bg-[#000D18] border-2 border-black rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00FFD2] font-medium"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#00FFD2] text-black font-bold border-2 border-black shadow-[2px_2px_0_#000000] transition disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

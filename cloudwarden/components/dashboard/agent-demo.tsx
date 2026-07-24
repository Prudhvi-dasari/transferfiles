"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, X, Zap, Shield, Search, Loader2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";

import ReactMarkdown from 'react-markdown';

export function AgentDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // useChat from ai/react v3
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: "init",
        role: "assistant",
        content: "Cloudwarden Autonomous Agent initialized.\nConnected to AWS, GCP, Azure environments.\nI can execute tasks, audit resources, or search real-time data. What would you like to do?",
      }
    ],
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-agent', handleToggle);
    return () => window.removeEventListener('toggle-agent', handleToggle);
  }, []);

  const renderToolCall = (tool: any) => {
    if (tool.toolName === 'createDocument') {
      return (
        <div key={tool.toolCallId} className="mt-3 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-md">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
            <span className="text-brand-400">📄</span>
            <span className="font-semibold text-slate-200">{tool.args.title}</span>
          </div>
          <div className="p-4 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{tool.args.content}</ReactMarkdown>
          </div>
        </div>
      );
    }
    
    if (tool.toolName === 'webSearch') {
      return (
        <div key={tool.toolCallId} className="italic text-slate-400 mt-2 p-2 border border-slate-800 rounded flex items-center gap-2">
          <Search className="w-3 h-3" />
          Searching the web for: <span className="text-brand-300">"{tool.args.query}"</span>...
        </div>
      );
    }

    if (tool.toolName === 'createTask') {
      return (
        <div key={tool.toolCallId} className="mt-3 bg-slate-900 border border-brand-500/30 rounded-lg p-3 shadow-md flex items-start gap-3">
          <div className="bg-brand-500/20 p-2 rounded text-brand-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200">{tool.args.title}</h4>
            <p className="text-xs text-slate-400 mt-1">{tool.args.description}</p>
            <span className="inline-block mt-2 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase tracking-wider border border-slate-700">
              {tool.args.tag}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div key={tool.toolCallId} className="italic text-slate-500 mt-2 p-2 border border-slate-800 rounded bg-slate-900/50">
        [Executing {tool.toolName}...]
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center gap-2",
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100",
          "bg-slate-900 hover:bg-slate-800 text-brand-400 border border-slate-700"
        )}
      >
        <Terminal className="w-6 h-6" />
        <span className="sr-only">Open AI Agent</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full"></span>
      </button>

      {/* Chat / Sidebar Window */}
      <div
        className={cn(
          "fixed top-0 right-0 w-[450px] max-w-[calc(100vw-2rem)] h-screen bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="font-mono text-sm font-semibold text-slate-200">cloudwarden-agent</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-md flex items-center gap-2 text-xs font-semibold"
          >
            <X className="w-4 h-4" /> CLOSE
          </button>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm flex flex-col gap-5"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex items-start gap-3",
                msg.role === "user" ? "text-brand-300" : "text-slate-300"
              )}
            >
              <span className="shrink-0 mt-0.5 select-none text-slate-600 font-bold">
                {msg.role === "user" ? ">" : "│"}
              </span>
              <div className="leading-relaxed w-full min-w-0">
                {msg.content && (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
                
                {/* Handle tool calls rendering */}
                {(msg as any).toolInvocations?.map((tool: any) => renderToolCall(tool))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2 text-slate-400">
              <span className="shrink-0 mt-0.5">│</span>
              <div className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>processing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask the AI agent..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bot className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

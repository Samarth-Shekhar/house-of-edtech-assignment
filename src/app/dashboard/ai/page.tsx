"use client";

import { useState, useRef, useEffect } from "react";
import { Brain, Send, Loader2, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) throw new Error("AI unavailable");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE data chunks
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                assistantMessage += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantMessage,
                  };
                  return updated;
                });
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please check your AI API key and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "Who are the top candidates across all jobs?",
    "What skills are most in demand?",
    "Give me a hiring pipeline summary",
    "Which candidates should I interview next?",
  ];

  return (
    <div className="animate-fade-in flex flex-col space-y-4" style={{ height: "calc(100vh - 120px)" }}>
      {/* Page Header */}
      <section className="page-header-dark">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              <Sparkles size={12} />
              AI copilot
            </div>
            <h1 className="mt-4 text-2xl font-bold sm:text-3xl tracking-tight">Ask anything about hiring</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70 leading-relaxed">
              Get instant summaries of your pipeline, candidate quality, and hiring momentum.
            </p>
          </div>
        </div>
      </section>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto dashboard-card p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "rgba(212,165,40,0.1)" }}>
              <Brain className="text-[var(--color-accent-mustard)]" size={28} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">How can I help you hire better?</h3>
            <p className="mb-6 max-w-md text-sm text-[var(--color-text-muted)]">
              I have access to your jobs, candidates, and AI analysis data. Ask me anything about your hiring pipeline.
            </p>
            <div className="grid max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="cursor-pointer rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-3 text-left text-xs font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-accent-mustard)] hover:text-[var(--color-text-primary)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--color-accent-mustard)" }}>
                    <Brain className="text-white" size={14} />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--color-accent-mustard)] text-white"
                    : "border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)]"
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.role === "assistant" && !msg.content && loading && (
                    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs">Thinking...</span>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)]">
                    <User className="text-[var(--color-text-secondary)]" size={14} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 dashboard-card p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your candidates, jobs, or pipeline..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-5">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}

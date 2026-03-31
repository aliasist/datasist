import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { DataCenter } from "@shared/schema";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  facility: DataCenter | null; // null = global mode
  onClose: () => void;
}

export default function AIChatPanel({ facility, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Suggested questions
  const suggestions = facility
    ? [
        `What is the environmental impact of ${facility.name}?`,
        `How does ${facility.company}'s renewable energy usage compare to industry average?`,
        `What AI models are hosted here and what do they power?`,
        `What are the community concerns around this facility?`,
      ]
    : [
        "Which facilities have the highest community resistance?",
        "Compare renewable energy usage across all tracked regions",
        "What is the total power consumption of all tracked facilities?",
        "Which countries have the most at-risk data center grids?",
      ];

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const question = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      // Include conversation history for multi-turn context
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await apiRequest("POST", "/api/ai/chat", {
        question,
        facilityId: facility?.id ?? null,
        history,
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error — could not reach DataSist AI. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: "var(--color-surface)",
        borderLeft: "1px solid var(--color-border-strong)",
        fontFamily: "'General Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: "24px",
              height: "24px",
              background: "rgba(113,255,156,0.12)",
              border: "1px solid rgba(113,255,156,0.3)",
            }}
          >
            <Sparkles size={12} style={{ color: "var(--color-green)" }} />
          </div>
          <div className="flex flex-col leading-none">
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-green)", letterSpacing: "0.05em" }}>
              DataSist AI
            </span>
            <span style={{ fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.08em" }}>
              {facility ? `ANALYZING: ${facility.name.slice(0, 24)}…` : "GLOBAL ANALYSIS MODE"}
            </span>
          </div>
        </div>
        <button
          data-testid="ai-panel-close"
          onClick={onClose}
          className="p-1 rounded hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-text-muted)" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            {/* Intro */}
            <div
              className="flex items-start gap-2 p-2.5 rounded"
              style={{
                background: "rgba(113,255,156,0.05)",
                border: "1px solid rgba(113,255,156,0.15)",
              }}
            >
              <Bot size={14} style={{ color: "var(--color-green)", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "11px", lineHeight: "1.65", color: "var(--color-text-muted)" }}>
                {facility
                  ? `I have full intelligence data for ${facility.name}. Ask me about power consumption, community impact, environmental footprint, or the AI models hosted here.`
                  : "I have intelligence data on all tracked facilities worldwide. Ask me about global trends, power consumption, environmental impact, community resistance, or regional comparisons."}
              </p>
            </div>

            {/* Suggestions */}
            <div style={{ fontSize: "9px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>SUGGESTED QUESTIONS</div>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((q) => (
                <button
                  key={q}
                  data-testid={`suggestion-${q.slice(0, 20)}`}
                  onClick={() => sendMessage(q)}
                  className="text-left px-2.5 py-1.5 rounded transition-all"
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-muted)",
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    lineHeight: "1.5",
                  }}
                >
                  <MessageSquare size={9} style={{ display: "inline", marginRight: "6px", color: "var(--color-cyan)" }} />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className="px-3 py-2 rounded"
              style={{
                maxWidth: "90%",
                fontSize: "12px",
                lineHeight: "1.65",
                ...(msg.role === "user"
                  ? {
                      background: "rgba(94,246,255,0.08)",
                      border: "1px solid rgba(94,246,255,0.2)",
                      color: "var(--color-text)",
                    }
                  : {
                      background: "rgba(113,255,156,0.05)",
                      border: "1px solid rgba(113,255,156,0.15)",
                      color: "var(--color-text-muted)",
                    }),
              }}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={10} style={{ color: "var(--color-green)" }} />
                  <span style={{ fontSize: "9px", color: "var(--color-green)", letterSpacing: "0.1em" }}>DATASIST AI</span>
                </div>
              )}
              <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2">
            <div
              className="px-3 py-2 rounded flex items-center gap-2"
              style={{
                background: "rgba(113,255,156,0.05)",
                border: "1px solid rgba(113,255,156,0.15)",
              }}
            >
              <Loader2 size={11} className="animate-spin" style={{ color: "var(--color-green)" }} />
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Analyzing...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 p-2.5 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex items-end gap-2 rounded p-2"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
          }}
        >
          <textarea
            ref={inputRef}
            data-testid="ai-chat-input"
            rows={1}
            placeholder="Ask about this facility..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-text)",
              fontSize: "12px",
              resize: "none",
              lineHeight: "1.5",
              fontFamily: "'General Sans', sans-serif",
              maxHeight: "80px",
              overflowY: "auto",
            }}
          />
          <button
            data-testid="ai-chat-send"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 p-1.5 rounded transition-all"
            style={{
              background: input.trim() && !loading ? "rgba(113,255,156,0.15)" : "transparent",
              border: `1px solid ${input.trim() && !loading ? "rgba(113,255,156,0.35)" : "var(--color-border)"}`,
              color: input.trim() && !loading ? "var(--color-green)" : "var(--color-text-muted)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            }}
          >
            <Send size={12} />
          </button>
        </div>
        <div style={{ fontSize: "9px", color: "var(--color-text-muted)", marginTop: "4px", textAlign: "center", letterSpacing: "0.06em" }}>
          POWERED BY GROQ · LLAMA-3.3-70B · ALIASIST.COM
        </div>
      </div>
    </div>
  );
}

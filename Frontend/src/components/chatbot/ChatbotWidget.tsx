import React, { useMemo, useState } from "react";
import axios from "axios";

type Message = { id: string; role: "user" | "assistant"; content: string };

const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const api = useMemo(() => {
    const base = import.meta.env.VITE_API_URL as string;
    return axios.create({ baseURL: base });
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/chatbot/ask", { question: trimmed });
      const answer: string = res.data?.answer ?? "(no answer)";
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          err?.response?.data?.error || "Kunde inte kontakta chatboten just nu.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: "#22c55e",
          color: "white",
          border: "none",
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          cursor: "pointer",
          zIndex: 9999,
        }}
        aria-label="Open chatbot"
      >
        💬
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 84,
            width: 380,
            maxHeight: 560,
            background: "white",
            borderRadius: 18,
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px 10px 16px",
              background: "#3b82f6",
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🙂
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Innovia AI</div>
            </div>
            <div style={{ fontSize: 13, opacity: 0.95, marginTop: 4 }}>
              Hur kan jag hjälpa dig?
            </div>
          </div>
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflowY: "auto",
              minHeight: 220,
              maxHeight: 400,
              background: "#f2f3f5", // slightly more grey background
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === "user" ? "flex-start" : "flex-end",
                  background: m.role === "user" ? "#ffffff" : "#14b8a6", // user white, bot teal
                  color: m.role === "user" ? "#111827" : "#ffffff",
                  padding: "12px 14px",
                  borderRadius: 14,
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                  boxShadow:
                    m.role === "user"
                      ? "0 1px 0 rgba(0,0,0,0.06) inset"
                      : "0 8px 18px rgba(0,0,0,0.12)",
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ color: "#6b7280", fontSize: 12 }}>Skriver…</div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 14,
              borderTop: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Skriv ett meddelande…"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "#f3f4f6",
                borderRadius: 20,
                padding: "12px 14px",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                border: "none",
                background: "#0ea5e9",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 8px 16px rgba(14,165,233,0.35)",
              }}
            >
              ✈️
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;

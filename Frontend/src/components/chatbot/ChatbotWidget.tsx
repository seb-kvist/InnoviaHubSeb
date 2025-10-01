// ChatbotWidget
// Komponent för en flytande chattknapp och ett chatfönster i appen.
// - Visar en launcher nere till höger som öppnar/stänger chatten
// - Renderar användar- och bot‑meddelanden (vänster/höger)
// - Anropar backend‑endpointen /api/chatbot/ask med frågan
// - Auto‑scrollar ned till senaste meddelandet
// - Styling ligger i ChatbotWidget.css
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./ChatbotWidget.css";

type Message = { id: string; role: "user" | "assistant"; content: string };

const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  // Lokal UI‑state för chatt
  const [messages, setMessages] = useState<Message[]>([]); // meddelandelista
  const [input, setInput] = useState<string>(""); // inmatningstext
  const [loading, setLoading] = useState<boolean>(false); // laddstatus när vi väntar på svar
  const listRef = useRef<HTMLDivElement | null>(null);

  // Axios‑instans mot backend API (baseras på VITE_API_URL)
  const api = useMemo(() => {
    const base = import.meta.env.VITE_API_URL as string;
    return axios.create({ baseURL: base });
  }, []);

  // Skickar användarens fråga till backend och lägger till bot‑svar i listan
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

  // Auto‑scrolla ned till senaste meddelandet när listan uppdateras eller panelen öppnas
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="chatbot-launcher"
        aria-label="Open chatbot"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M7 7h10M7 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 5a3 3 0 013-3h10a3 3 0 013 3v8a3 3 0 01-3 3H9l-4 4v-4H7a3 3 0 01-3-3V5z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-row">
              <div className="chatbot-title">Innovia AI</div>
            </div>
            <div className="chatbot-subtitle">Hur kan jag hjälpa dig?</div>
          </div>
          <div className="chatbot-body" ref={listRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chatbot-bubble ${m.role === "user" ? "user" : "bot"}`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ color: "#6b7280", fontSize: 12 }}>Skriver…</div>
            )}
          </div>
          <div className="chatbot-input-row">
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
              className="chatbot-input"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="chatbot-send"
            >
              {/* paper-plane send icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3.4 2.6l17.7 8a1 1 0 010 1.8L3.4 21.4a1 1 0 01-1.3-1.3l3.2-7.5a1 1 0 010-.7L2.1 3.9A1 1 0 013.4 2.6z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;

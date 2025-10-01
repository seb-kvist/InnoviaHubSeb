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

type Message = { id: string; role: "user" | "assistant"; content: string; ts: string };

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
      ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          err?.response?.data?.error || "Kunde inte kontakta chatboten just nu.",
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        <img src="/img/robot.svg" className="chatbot-icon" alt="Chatbot" />
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
              <div key={m.id} className={`chatbot-row ${m.role === "user" ? "user" : "bot"}`}>
                <div>
                  <div className={`chatbot-bubble ${m.role === "user" ? "user" : "bot"}`}>
                    {m.content}
                  </div>
                  <div className={`chatbot-ts ${m.role === "user" ? "user" : "bot"}`}>{m.ts}</div>
                </div>
              </div>
            ))}
            {loading && (<div className="chatbot-typing">Skriver…</div>)}
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
              <img src="/img/send.svg" className="send-icon" alt="send-icon" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;

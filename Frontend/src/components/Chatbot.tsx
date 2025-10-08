import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "../styles/Chatbot.css";

type Message = { id: string; role: "user" | "assistant"; content: string; ts: string };

const Chatbot: React.FC = () => {
  // State för att visa eller gömma chatten
  const [open, setOpen] = useState<boolean>(false);
  // Lista över alla meddelanden i chatten
  const [messages, setMessages] = useState<Message[]>([]); 
  // Textfältets värde (inmatning från användaren)
  const [input, setInput] = useState<string>(""); 
  // Visar laddning när vi väntar på svar från backend
  const [loading, setLoading] = useState<boolean>(false);
  // Referens till chatlistan för att kunna auto-scrolla
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
    // Lägg till användarens meddelande direkt i listan
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
      // Skicka frågan till backend
      const res = await api.post("/chatbot/ask", { question: trimmed });
      const answer: string = res.data?.answer ?? "(no answer)";
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } 
    // Visa felmeddelande om API-anropet misslyckas
      catch (err: any) {
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

  // Scrollar automatiskt ned till det senaste meddelandet när något nytt tillkommer
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  return (
    <>
      {/* Flytande knapp för att öppna/stänga chatten  + hälsning*/}
      {!open && (
        <div className="chatbot-greeting">Hej! Kan jag hjälpa dig?</div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="chatbot-launcher"
        aria-label="Open chatbot"
      >
        <img src="/img/robot.svg" className="chatbot-icon" alt="Chatbot" />
      </button>

      {/* Chatpanel */}
      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-row">
              <div className="chatbot-header-left">
                <img src="/img/robot.svg" className="chatbot-header-icon" alt="Toshi" />
                <div className="chatbot-title">Toshi: The Innovia Hub Assistant</div>
              </div>
            </div>
            <div className="chatbot-subtitle">Hur kan jag hjälpa dig?</div>
          </div>
          {/* Meddelandelista */}
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

          {/* Inmatningsfält + skicka-knapp */}
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
              <img src="/img/send.svg" className="send-icon" alt="send-icon" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

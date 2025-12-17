import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";
const SESSION_ID = "session-" + Date.now();

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API}/chat/history/${USER_ID}/${SESSION_ID}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message optimistically
    const tempUserMsg = {
      id: "temp-" + Date.now(),
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await axios.post(`${API}/chat`, {
        user_id: USER_ID,
        session_id: SESSION_ID,
        message: userMessage,
      });

      // Add assistant response
      const assistantMsg = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: res.data.message,
        created_at: res.data.created_at,
      };
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, assistantMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("I'm having trouble connecting right now. Can we try that again?");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="chat-page">
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-stone-100">
          <h1 className="text-3xl md:text-4xl mb-2 font-fraunces" data-testid="chat-title">A quiet place to think things through</h1>
          <div className="text-stone-600 leading-relaxed space-y-1">
            <p>You don't need to arrive with clarity.</p>
            <p>You can talk things out here, slowly and without pressure.</p>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
          {messages.length === 0 && (
            <div className="text-center text-stone-500 mt-20 max-w-md mx-auto">
              <p className="font-caveat text-lg leading-relaxed">
                I'll listen and reflect. We don't have to solve anything.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              data-testid={`chat-message-${msg.role}`}
            >
              <div
                className={`max-w-[75%] p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-stone-50 text-stone-700"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start" data-testid="chat-loading">
              <div className="bg-stone-50 p-4 rounded-2xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me what's on your mind…"
              disabled={loading}
              data-testid="chat-input"
              className="flex-1 bg-white border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              data-testid="chat-send-btn"
              className="bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send strokeWidth={1.5} size={18} />
            </button>
          </form>
          <p className="text-xs text-stone-400 text-center mt-3 font-caveat">
            There's no right way to use this space. You can ramble, brain-dump, ask a question — I'll follow your lead gently.
          </p>
        </div>
      </div>
    </div>
  );
}
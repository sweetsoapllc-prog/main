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
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="chat-page">
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="text-primary" strokeWidth={1.5} size={20} />
            </div>
            <div>
              <h1 className="text-2xl" data-testid="chat-title">Quiet Housekeeper</h1>
              <p className="text-sm text-stone-500 font-caveat">Your gentle second brain</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
          {messages.length === 0 && (
            <div className="text-center text-stone-400 mt-20">
              <p className="font-caveat text-xl">Start a conversation...</p>
              <p className="text-sm mt-2">I'm here to help you feel lighter and more supported.</p>
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
              placeholder="Share what's on your mind..."
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
        </div>
      </div>
    </div>
  );
}
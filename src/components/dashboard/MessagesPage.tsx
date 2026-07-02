"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import type { UserRole } from "@/lib/roles";

interface Conversation {
  _id: string;
  lastMessage?: string;
  lastMessageAt: string;
  otherUser?: { _id: string; name: string; email: string };
}

interface Message {
  _id: string;
  text: string;
  createdAt: string;
  senderId: { _id: string; name: string };
}

interface MessagesPageProps {
  role: UserRole;
}

export default function MessagesPage({ role }: MessagesPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMyId(d.user?._id ?? ""));
  }, []);

  const loadConversations = useCallback(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    const load = () => {
      fetch(`/api/messages?conversationId=${activeId}`)
        .then((r) => r.json())
        .then((d) => setMessages(d.messages ?? []));
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [activeId]);

  async function sendMessage() {
    if (!text.trim() || !activeId) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, text }),
    });
    setText("");
    const res = await fetch(`/api/messages?conversationId=${activeId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    loadConversations();
  }

  if (loading) {
    return <div className="text-white/50">Loading messages...</div>;
  }

  return (
    <div>
      <PageHeader title="Messages" subtitle="Secure private conversations" />
      {conversations.length === 0 && !activeId ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start collaborating or hire a freelancer to begin messaging."
        />
      ) : (
        <div className="bb-glass flex h-[calc(100vh-220px)] min-h-[400px] overflow-hidden rounded-2xl">
          <div className="w-full max-w-xs shrink-0 border-r border-white/10 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveId(c._id)}
                className={`w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 ${activeId === c._id ? "bg-purple-500/10" : ""}`}
              >
                <div className="text-sm font-medium">{c.otherUser?.name ?? "User"}</div>
                <div className="mt-0.5 truncate text-xs text-white/40">{c.lastMessage}</div>
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-col">
            {activeId ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m) => {
                    const senderId = typeof m.senderId === "object" ? m.senderId._id : m.senderId;
                    const isMine = String(senderId) === String(myId);
                    return (
                      <div
                        key={m._id}
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMine ? "ml-auto bg-purple-500/20" : "bg-white/5"}`}
                      >
                        <div className="text-[10px] text-white/40">{m.senderId?.name}</div>
                        {m.text}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 border-t border-white/10 p-4">
                  <input
                    className="bb-input flex-1 rounded-xl px-4 py-2.5 text-sm"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                  />
                  <button onClick={sendMessage} className="bb-btn-primary rounded-xl px-4 py-2.5 text-sm">
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-white/40">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

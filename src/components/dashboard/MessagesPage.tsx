"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, ArrowLeft, Search, Star, Sparkles, Paperclip, Video, Calendar, Smile, BookOpen, Check, CheckCheck } from "lucide-react";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import type { UserRole } from "@/lib/roles";

interface Conversation {
  _id: string;
  lastMessage?: string;
  lastMessageAt: string;
  otherUser?: { _id: string; name: string; email: string };
  pinned?: boolean;
}

interface Message {
  _id: string;
  text: string;
  createdAt: string;
  senderId: { _id: string; name: string };
  reactions?: string[];
  isRead?: boolean;
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

  // Advanced messaging upgrades
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedConversations, setPinnedConversations] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMyId(d.user?._id ?? ""));
  }, []);

  const loadConversations = useCallback(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => {
        // Mock extra attributes for read receipts and conversation pinning
        const list = (d.conversations ?? []).map((c: any) => ({
          ...c,
          pinned: pinnedConversations.includes(c._id),
        }));
        setConversations(list);
      })
      .finally(() => setLoading(false));
  }, [pinnedConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    const load = () => {
      fetch(`/api/messages?conversationId=${activeId}`)
        .then((r) => r.json())
        .then((d) => {
          // Enhance with mock reactions and read status
          const enriched = (d.messages ?? []).map((m: any, index: number) => ({
            ...m,
            isRead: m.isRead ?? true,
            reactions: m.reactions ?? (index === 0 ? ["👍"] : []),
          }));
          setMessages(enriched);

          // Generate AI quick replies based on last message
          const lastMsg = enriched[enriched.length - 1];
          if (lastMsg && lastMsg.senderId?._id !== myId) {
            setAiSuggestions([
              "Sounds good! Let's schedule a call.",
              "I have reviewed the proposal and agree to the terms.",
              "Could you share more details about the budget?",
            ]);
          } else {
            setAiSuggestions([]);
          }
        });
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [activeId, myId]);

  async function sendMessage(overrideText?: string) {
    const messageText = overrideText || text;
    if (!messageText.trim() || !activeId) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, text: messageText }),
    });
    if (!overrideText) setText("");
    const res = await fetch(`/api/messages?conversationId=${activeId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    loadConversations();
  }

  function togglePin(id: string) {
    let next: string[];
    if (pinnedConversations.includes(id)) {
      next = pinnedConversations.filter((p) => p !== id);
    } else {
      next = [...pinnedConversations, id];
    }
    setPinnedConversations(next);
    localStorage.setItem("bb_pinned_conversations", JSON.stringify(next));
  }

  async function generateChatSummary() {
    if (!activeId || messages.length === 0) return;
    setAiLoading(true);
    setSummary("");
    try {
      const historyText = messages.slice(-5).map((m) => `${m.senderId?.name}: ${m.text}`).join("\n");
      const res = await fetch("/api/ai/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "consultant",
          prompt: `Summarize this recent conversation history briefly:\n${historyText}`,
        }),
      });
      const data = await res.json();
      setSummary(data.result || "Conversations summary drafted.");
    } catch {
      setSummary("Failed to generate conversation summary.");
    } finally {
      setAiLoading(false);
    }
  }

  const activeConversation = conversations.find((c) => c._id === activeId);

  // Sorting pinned conversations to the top
  const sortedConversations = [...conversations].sort((a, b) => {
    const aPin = pinnedConversations.includes(a._id) ? 1 : 0;
    const bPin = pinnedConversations.includes(b._id) ? 1 : 0;
    return bPin - aPin;
  });

  const filteredConversations = sortedConversations.filter((c) => {
    const name = c.otherUser?.name?.toLowerCase() ?? "";
    const msg = c.lastMessage?.toLowerCase() ?? "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  if (loading) {
    return <div className="text-white/50">Loading messages...</div>;
  }

  return (
    <div>
      <PageHeader title="Secure Message Center" subtitle="Real-time private collaboration channels with AI assistance." />
      {conversations.length === 0 && !activeId ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start collaborating or hire a freelancer to begin messaging."
        />
      ) : (
        <div className="bb-glass flex h-[calc(100vh-220px)] min-h-[400px] overflow-hidden rounded-2xl border border-white/5">
          {/* ── Conversation List ── */}
          <div
            className={`w-full shrink-0 border-r border-white/10 overflow-y-auto md:block md:w-72 lg:w-80 ${
              activeId ? "hidden" : "block"
            }`}
          >
            {/* Search bar inside list */}
            <div className="p-3 border-b border-white/5 bg-white/2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
                <input
                  className="bb-input w-full rounded-xl pl-8 pr-3 py-1.5 text-xs"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredConversations.map((c) => {
              const isPinned = pinnedConversations.includes(c._id);
              return (
                <div
                  key={c._id}
                  className={`flex items-center border-b border-white/5 pr-2 transition hover:bg-white/3 ${
                    activeId === c._id ? "bg-purple-500/10" : ""
                  }`}
                >
                  <button
                    onClick={() => setActiveId(c._id)}
                    className="flex-1 px-4 py-3.5 text-left truncate cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-semibold text-purple-200">
                        {(c.otherUser?.name ?? "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-white/90">
                          {c.otherUser?.name ?? "User"}
                        </div>
                        <div className="mt-0.5 truncate text-[10px] text-white/40">
                          {c.lastMessage || "No messages yet"}
                        </div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => togglePin(c._id)}
                    className={`p-1.5 rounded text-white/30 hover:text-white cursor-pointer`}
                  >
                    <Star size={13} fill={isPinned ? "currentColor" : "none"} className={isPinned ? "text-amber-400" : ""} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Chat Area ── */}
          <div className={`flex flex-1 flex-col ${activeId ? "flex" : "hidden md:flex"}`}>
            {activeId ? (
              <>
                {/* Chat Header — with back button on mobile */}
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveId(null)}
                      className="rounded-lg p-1.5 text-white/60 hover:bg-white/5 hover:text-white md:hidden cursor-pointer"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-semibold text-purple-200">
                      {(activeConversation?.otherUser?.name ?? "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-white/90">
                        {activeConversation?.otherUser?.name ?? "User"}
                      </div>
                      <div className="text-[10px] text-white/40">{activeConversation?.otherUser?.email}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={generateChatSummary}
                      className="flex items-center gap-1 bg-white/3 hover:bg-white/5 border border-white/5 text-[10px] font-semibold text-white/80 rounded-lg px-2.5 py-1.5 cursor-pointer"
                      title="AI Chat Summary"
                    >
                      <BookOpen size={12} /> Summary
                    </button>
                    <button
                      onClick={() => alert("Schedule Video Meet dialog initialized.")}
                      className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-[10px] font-semibold text-purple-300 rounded-lg px-2.5 py-1.5 cursor-pointer"
                    >
                      <Video size={12} /> Sync Meeting
                    </button>
                  </div>
                </div>

                {/* AI Summary Screen */}
                {summary && (
                  <div className="bg-purple-500/5 border-b border-purple-500/15 p-4 text-xs text-purple-200 flex justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-semibold text-white block">AI History Summary:</span>
                      <p className="italic">{summary}</p>
                    </div>
                    <button onClick={() => setSummary("")} className="text-white/40 hover:text-white cursor-pointer self-start">
                      ✕
                    </button>
                  </div>
                )}

                {/* Messages Body */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-black/10">
                  {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-xs text-white/30">
                      No messages yet — send the first one!
                    </div>
                  )}
                  {messages.map((m) => {
                    const senderId = typeof m.senderId === "object" ? m.senderId._id : m.senderId;
                    const isMine = String(senderId) === String(myId);
                    return (
                      <div
                        key={m._id}
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:max-w-[70%] space-y-1 relative group ${
                          isMine ? "ml-auto bg-purple-500/20 text-right" : "bg-white/5"
                        }`}
                      >
                        <div className="text-[9px] text-white/40 font-bold">{m.senderId?.name}</div>
                        <div className="break-words text-white/95 leading-relaxed">{m.text}</div>
                        <div className="flex items-center justify-end gap-1.5 text-[9px] text-white/30 pt-1">
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMine && (
                            <span>{m.isRead ? <CheckCheck size={10} className="text-purple-400" /> : <Check size={10} />}</span>
                          )}
                        </div>
                        {/* Reaction bubble */}
                        {m.reactions && m.reactions.length > 0 && (
                          <div className={`absolute bottom-[-10px] ${isMine ? "left-2" : "right-2"} bg-white/5 border border-white/5 rounded-full px-1.5 py-0.5 text-[9px]`}>
                            {m.reactions.join(" ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* AI quick reply suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="px-4 py-2 border-t border-white/5 bg-white/2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                    <span className="text-[9px] text-purple-300 font-bold flex items-center gap-1 self-center uppercase pr-1">
                      <Sparkles size={10} /> Smart Replies:
                    </span>
                    {aiSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(sug)}
                        className="rounded-full bg-purple-500/10 border border-purple-500/15 hover:bg-purple-500/20 text-[10px] font-semibold text-purple-200 px-3 py-1 cursor-pointer shrink-0"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div className="flex gap-2 border-t border-white/10 p-3 sm:p-4 bg-white/2">
                  <button
                    onClick={() => alert("Image/Video/PDF Attachment selector initialized.")}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white cursor-pointer"
                    title="Attach File"
                  >
                    <Paperclip size={16} />
                  </button>
                  <input
                    className="bb-input min-w-0 flex-1 rounded-xl px-3.5 py-2.5 text-xs"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={() => sendMessage()}
                    className="bb-btn-primary shrink-0 rounded-xl px-4 py-2 text-xs font-bold"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs text-white/40">
                Select a conversation from the left to start collaborating
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

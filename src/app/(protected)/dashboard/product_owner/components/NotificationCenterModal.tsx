"use client";

import { X, Check, Bell, Inbox, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

interface NotificationCenterModalProps {
  onClose: () => void;
}

export default function NotificationCenterModal({ onClose }: NotificationCenterModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  function load() {
    setLoading(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkRead(id: string) {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      load();
    }
  }

  async function handleMarkAllRead() {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    if (res.ok) {
      load();
    }
  }

  const displayed = filter === "all" ? notifications : notifications.filter((n) => !n.read);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bb-glass w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-purple-400" />
            <h3 className="bb-display text-base font-semibold text-white">Centralized Notification Center</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300 font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-white/5 bg-white/2 px-6 py-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1 cursor-pointer transition ${
                filter === "all" ? "bg-purple-500/20 text-purple-200" : "text-white/55 hover:text-white/80"
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-3 py-1 cursor-pointer transition ${
                filter === "unread" ? "bg-purple-500/20 text-purple-200" : "text-white/55 hover:text-white/80"
              }`}
            >
              Unread Only
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-purple-300 hover:text-purple-200 font-semibold cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <p className="text-sm text-white/45">Loading notifications...</p>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <Inbox size={32} className="text-white/20" />
              <p className="text-sm text-white/45">No notifications found.</p>
            </div>
          ) : (
            displayed.map((n) => (
              <div
                key={n._id}
                className={`flex gap-3 rounded-xl p-4 border transition ${
                  n.read ? "bg-white/2 border-white/5 opacity-60" : "bg-purple-500/5 border-purple-500/10"
                }`}
              >
                <div className="mt-0.5 text-purple-400 shrink-0">
                  {n.type === "alert" ? <AlertCircle size={16} /> : <Info size={16} />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white/90">{n.title}</h4>
                    <span className="text-[10px] text-white/45">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-white/60">{n.message}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="self-center flex h-6 w-6 items-center justify-center rounded bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 cursor-pointer"
                    title="Mark Read"
                  >
                    <Check size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function NotificationsSection({ initialPreferences }: { initialPreferences: any }) {
  const [preferences, setPreferences] = useState(initialPreferences || {
    newMessages: true,
    statusUpdates: true,
    proposals: true,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleToggle(key: string) {
    const newVal = !preferences[key];
    const newPrefs = { ...preferences, [key]: newVal };
    setPreferences(newPrefs);
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: newPrefs }),
      });
      if (res.ok) setMessage("Preferences saved");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2000);
    }
  }

  const items = [
    { key: "newMessages", label: "New Messages", desc: "Get notified when someone sends you a message" },
    { key: "statusUpdates", label: "Status Updates", desc: "Get notified when a project or collaboration status changes" },
    { key: "proposals", label: "New Proposals", desc: "Get notified when you receive a new proposal or invite" },
    { key: "marketing", label: "News & Offers", desc: "Receive updates about new features and promotions" },
  ];

  return (
    <div className="bb-glass rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="bb-display text-lg font-medium">Notification Preferences</h2>
        {loading && <Loader2 size={14} className="animate-spin text-white/50" />}
        {message && <span className="text-xs text-green-400 font-medium">{message}</span>}
      </div>

      <div className="space-y-4 pt-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/90">{item.label}</p>
              <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!preferences[item.key]}
                onChange={() => handleToggle(item.key)}
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

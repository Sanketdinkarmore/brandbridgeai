"use client";

import { Activity, Clock } from "lucide-react";

interface ActivityLogItem {
  action: string;
  details: string;
  createdAt: string | Date;
}

interface RecentActivitiesWidgetProps {
  activities: ActivityLogItem[];
}

export default function RecentActivitiesWidget({ activities }: RecentActivitiesWidgetProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <h3 className="bb-display mb-4 flex items-center gap-2 text-base font-semibold text-white">
        <Activity size={18} className="text-purple-400" />
        Recent Activities
      </h3>
      {activities.length === 0 ? (
        <p className="text-sm text-white/45">No activity logged yet.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((act, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-purple-500/10 text-[10px] text-purple-300">
                {act.action.substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <p className="text-white/80">{act.details}</p>
                <span className="flex items-center gap-1 text-[10px] text-white/40">
                  <Clock size={10} />
                  {new Date(act.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

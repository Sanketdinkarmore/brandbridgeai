"use client";

import { Calendar, Video } from "lucide-react";

interface MeetingItem {
  id: string;
  title: string;
  date: string;
  attendees: string;
}

interface UpcomingMeetingsWidgetProps {
  meetings: MeetingItem[];
}

export default function UpcomingMeetingsWidget({ meetings }: UpcomingMeetingsWidgetProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <h3 className="bb-display mb-4 flex items-center gap-2 text-base font-semibold text-white">
        <Calendar size={18} className="text-purple-400" />
        Upcoming Meetings & Syncs
      </h3>
      {meetings.length === 0 ? (
        <p className="text-sm text-white/45">No upcoming meetings scheduled.</p>
      ) : (
        <div className="space-y-3">
          {meetings.map((meet) => (
            <div
              key={meet.id}
              className="flex items-center justify-between rounded-xl bg-white/3 p-3 transition hover:bg-white/5"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-white/90">{meet.title}</h4>
                <p className="text-xs text-white/50">{meet.attendees}</p>
                <span className="inline-block text-[10px] text-purple-300">{meet.date}</span>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 cursor-pointer">
                <Video size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

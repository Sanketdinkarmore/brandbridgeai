"use client";

import type { PerformanceDay } from "../lib/types";

interface PerformanceChartProps {
  data: PerformanceDay[];
  title?: string;
}

export default function PerformanceChart({ data, title }: PerformanceChartProps) {
  if (!data.length) {
    return (
      <div className="bb-glass rounded-2xl p-6">
        {title && <h3 className="bb-display mb-4 text-base font-medium">{title}</h3>}
        <p className="text-sm text-white/45">No performance data yet. Views and requests will appear here over time.</p>
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const maxRequests = Math.max(...data.map((d) => d.collaborationRequests), 1);

  return (
    <div className="bb-glass rounded-2xl p-6">
      {title && <h3 className="bb-display mb-4 text-base font-medium">{title}</h3>}
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-white/50">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-400" /> Views
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" /> Collaboration requests
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex min-w-[480px] items-end gap-2" style={{ height: 180 }}>
          {data.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 140 }}>
                <div
                  className="w-2 rounded-t bg-purple-400/80"
                  style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: day.views ? 4 : 0 }}
                  title={`${day.views} views`}
                />
                <div
                  className="w-2 rounded-t bg-blue-400/80"
                  style={{
                    height: `${(day.collaborationRequests / maxRequests) * 100}%`,
                    minHeight: day.collaborationRequests ? 4 : 0,
                  }}
                  title={`${day.collaborationRequests} requests`}
                />
              </div>
              <span className="text-[10px] text-white/40">
                {day.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

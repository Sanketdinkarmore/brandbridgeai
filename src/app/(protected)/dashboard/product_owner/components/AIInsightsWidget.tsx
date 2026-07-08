"use client";

import { Sparkles, TrendingUp } from "lucide-react";

interface AIInsightsWidgetProps {
  insights: string[];
}

export default function AIInsightsWidget({ insights }: AIInsightsWidgetProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="bb-display flex items-center gap-2 text-base font-semibold text-white">
          <Sparkles size={18} className="text-purple-400" />
          AI Insights & Recommendations
        </h3>
      </div>
      {insights.length === 0 ? (
        <p className="text-sm text-white/45">No recommendations available at the moment.</p>
      ) : (
        <ul className="space-y-3">
          {insights.map((ins, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded-xl bg-purple-500/5 p-3 text-sm text-purple-200 border border-purple-500/10"
            >
              <TrendingUp size={16} className="mt-0.5 shrink-0 text-purple-400" />
              <span>{ins}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

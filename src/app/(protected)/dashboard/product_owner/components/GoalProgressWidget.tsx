"use client";

import { Target } from "lucide-react";

interface GoalItem {
  name: string;
  current: number;
  target: number;
  unit: string;
}

interface GoalProgressWidgetProps {
  goals: GoalItem[];
}

export default function GoalProgressWidget({ goals }: GoalProgressWidgetProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <h3 className="bb-display mb-4 flex items-center gap-2 text-base font-semibold text-white">
        <Target size={18} className="text-purple-400" />
        Goal Progress
      </h3>
      {goals.length === 0 ? (
        <p className="text-sm text-white/45">No goal metrics defined.</p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <div key={goal.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="font-medium text-white/80">{goal.name}</span>
                  <span>
                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                  </span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-purple-300 font-medium">{pct}% Complete</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

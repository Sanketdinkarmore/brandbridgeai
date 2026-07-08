"use client";

import { Eye, Handshake, TrendingUp } from "lucide-react";
import PerformanceChart from "./PerformanceChart";
import type { ProductAnalytics } from "../lib/types";

interface ProductAnalyticsPanelProps {
  analytics: ProductAnalytics;
  productName: string;
}

export default function ProductAnalyticsPanel({ analytics, productName }: ProductAnalyticsPanelProps) {
  const history = analytics.performanceHistory ?? [];

  return (
    <div className="space-y-5">
      <h2 className="bb-display text-lg font-medium">Analytics — {productName}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bb-glass rounded-2xl p-5">
          <Eye size={18} className="text-purple-300" />
          <div className="bb-display mt-3 text-2xl font-semibold">{analytics.views}</div>
          <div className="text-xs text-white/45">Total views</div>
        </div>
        <div className="bb-glass rounded-2xl p-5">
          <Handshake size={18} className="text-blue-300" />
          <div className="bb-display mt-3 text-2xl font-semibold">
            {analytics.collaborationRequests}
          </div>
          <div className="text-xs text-white/45">Collaboration requests</div>
        </div>
        <div className="bb-glass rounded-2xl p-5">
          <TrendingUp size={18} className="text-emerald-300" />
          <div className="bb-display mt-3 text-2xl font-semibold">
            {history.reduce((sum, d) => sum + d.views, 0)}
          </div>
          <div className="text-xs text-white/45">Views (last {history.length || 0} days tracked)</div>
        </div>
      </div>
      <PerformanceChart data={history} title="Performance over time" />
    </div>
  );
}

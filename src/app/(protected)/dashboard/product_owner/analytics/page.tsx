"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  Handshake,
  Download,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Percent,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PoStatCard from "../components/PoStatCard";
import PerformanceChart from "../components/PerformanceChart";
import ProductStatusBadge from "../components/ProductStatusBadge";
import { PO_API_BASE } from "../lib/types";
import type { PerformanceDay } from "../lib/types";

interface AnalyticsSummary {
  totalViews: number;
  totalRequests: number;
  activeProducts: number;
  draftProducts: number;
  archivedProducts: number;
  signedCollaborations: number;
}

interface ProductAnalyticsRow {
  _id: string;
  name: string;
  status: string;
  category?: string;
  marketingBudget?: number;
  analytics?: { views: number; collaborationRequests: number };
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [products, setProducts] = useState<ProductAnalyticsRow[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [timeRange, setTimeRange] = useState("30"); // 7, 30, 90, 365
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetch(`${PO_API_BASE}/analytics`)
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.summary ?? null);
        setProducts(d.products ?? []);
        setPerformanceHistory(d.performanceHistory ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Export functions
  function handleExport(format: "csv" | "excel") {
    let csvContent = "";
    if (format === "csv") {
      csvContent = "Product Name,Category,Status,Views,Collaboration Requests,Budget\n";
      products.forEach((p) => {
        csvContent += `"${p.name}","${p.category ?? "General"}","${p.status}",${p.analytics?.views ?? 0},${p.analytics?.collaborationRequests ?? 0},${p.marketingBudget ?? 0}\n`;
      });
    } else {
      csvContent = "Product Name\tCategory\tStatus\tViews\tCollaboration Requests\tBudget\n";
      products.forEach((p) => {
        csvContent += `"${p.name}"\t"${p.category ?? "General"}"\t"${p.status}"\t${p.analytics?.views ?? 0}\t${p.analytics?.collaborationRequests ?? 0}\t${p.marketingBudget ?? 0}\n`;
      });
    }

    const blob = new Blob([csvContent], {
      type: format === "csv" ? "text/csv" : "application/vnd.ms-excel",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brandbridge_analytics_report.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrintPDF() {
    window.print();
  }

  if (loading) return <div className="text-white/50">Loading analytics...</div>;

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Advanced Workspace Analytics"
          subtitle="Track brand partnerships, funnel metrics, and marketing performance over time."
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs text-white/80 hover:bg-white/10 cursor-pointer"
          >
            <Download size={13} /> CSV
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs text-white/80 hover:bg-white/10 cursor-pointer"
          >
            <Download size={13} /> Excel
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 px-3.5 py-2 text-xs text-purple-300 hover:bg-purple-500/20 cursor-pointer"
          >
            <Download size={13} /> PDF Report
          </button>
        </div>
      </div>

      {/* Interactive Filter Panel */}
      <div className="bb-glass rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Filter size={15} className="text-purple-400" />
          <span className="font-medium">Filter Dashboard</span>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {/* Time range */}
          <div className="flex items-center gap-1 bg-white/3 border border-white/5 rounded-xl px-2.5 py-1">
            <Calendar size={13} className="text-white/40" />
            <select
              className="bg-transparent text-xs text-white/85 outline-none border-none pr-1"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last 12 Months</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-1 bg-white/3 border border-white/5 rounded-xl px-2.5 py-1">
            <select
              className="bg-transparent text-xs text-white/85 outline-none border-none pr-1"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Row */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <PoStatCard label="Total Views" value={String(summary.totalViews)} icon={Eye} />
          <PoStatCard
            label="Collaboration Requests"
            value={String(summary.totalRequests)}
            icon={Handshake}
          />
          <PoStatCard
            label="Conversion Rate"
            value={summary.totalViews ? `${((summary.totalRequests / summary.totalViews) * 100).toFixed(1)}%` : "0%"}
            icon={Percent}
          />
          <PoStatCard
            label="Active Products"
            value={String(summary.activeProducts)}
            icon={BarChart3}
          />
          <PoStatCard
            label="Marketing Budget"
            value={`$${products.reduce((acc, curr) => acc + (curr.marketingBudget ?? 0), 0).toLocaleString()}`}
            icon={DollarSign}
          />
        </div>
      )}

      {/* Chart Layout: Left History, Right Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart data={performanceHistory} title="Workspace trend history (daily views & collaborations)" />
        </div>

        {/* Conversion Funnel Widget */}
        <div className="bb-glass rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="bb-display mb-4 text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-400" />
              Conversion Funnel
            </h3>
            <div className="space-y-4">
              {[
                { stage: "Views/Impressions", count: summary?.totalViews ?? 0, rate: "100%", color: "from-purple-500 to-indigo-500" },
                { stage: "Requests Sent", count: summary?.totalRequests ?? 0, rate: `${summary?.totalViews ? ((summary.totalRequests / summary.totalViews) * 100).toFixed(1) : 0}%`, color: "from-blue-500 to-pink-500" },
                { stage: "Signed Collaborations", count: summary?.signedCollaborations ?? 0, rate: `${summary?.totalViews ? ((summary.signedCollaborations / summary.totalViews) * 100).toFixed(1) : 0}%`, color: "from-pink-500 to-rose-500" },
              ].map((fun, i) => (
                <div key={fun.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{fun.stage}</span>
                    <span className="font-semibold text-white/95">
                      {fun.count.toLocaleString()} ({fun.rate})
                    </span>
                  </div>
                  <div className="h-4 w-full bg-white/5 rounded relative overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${fun.color}`}
                      style={{ width: `${100 - i * 30}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-[10px] text-white/40 flex justify-between border-t border-white/5 pt-3">
            <span>Overall Funnel Success: {summary?.totalViews ? ((summary.signedCollaborations / summary.totalViews) * 100).toFixed(1) : 0}%</span>
            <span>Target: 5.0%</span>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bb-glass rounded-2xl p-6">
        <h2 className="bb-display mb-4 text-base font-semibold text-white">Product Performance Breakdown</h2>
        {filteredProducts.length === 0 ? (
          <p className="text-sm text-white/45">No products to analyze yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/40">
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium text-right">Views</th>
                  <th className="pb-3 pr-4 font-medium text-right">Requests</th>
                  <th className="pb-3 pr-4 font-medium text-right">Conversion Rate</th>
                  <th className="pb-3 font-medium text-right">Budget</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const views = p.analytics?.views ?? 0;
                  const reqs = p.analytics?.collaborationRequests ?? 0;
                  const cr = views ? ((reqs / views) * 100).toFixed(1) + "%" : "0.0%";

                  return (
                    <tr key={p._id} className="border-b border-white/5 text-xs text-white/75 hover:bg-white/1">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/dashboard/product_owner/products/${p._id}`}
                          className="font-semibold text-purple-300 hover:text-purple-200"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <ProductStatusBadge status={p.status} />
                      </td>
                      <td className="py-3 pr-4 text-white/50">{p.category ?? "—"}</td>
                      <td className="py-3 pr-4 text-right font-medium">{views.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right font-medium">{reqs.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-purple-200">{cr}</td>
                      <td className="py-3 text-right font-medium">
                        {p.marketingBudget != null ? `$${p.marketingBudget.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

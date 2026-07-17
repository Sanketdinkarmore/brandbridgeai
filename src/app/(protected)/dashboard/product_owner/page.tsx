"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Megaphone,
  MessageSquare,
  Eye,
  Handshake,
  ArrowRight,
  Settings,
  Sparkles,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  Clock,
  Bell,
  CheckSquare,
} from "lucide-react";
import PoStatCard from "./components/PoStatCard";
import ProductStatusBadge from "./components/ProductStatusBadge";
import { PO_API_BASE } from "./lib/types";

// Widgets
import QuickActionsWidget from "./components/QuickActionsWidget";
import AIInsightsWidget from "./components/AIInsightsWidget";
import GoalProgressWidget from "./components/GoalProgressWidget";
import RecentActivitiesWidget from "./components/RecentActivitiesWidget";
import UpcomingMeetingsWidget from "./components/UpcomingMeetingsWidget";
import DashboardCustomizer, { WidgetConfig } from "./components/DashboardCustomizer";

// Overlay modals
import ReportsModal from "./components/ReportsModal";
import TasksModal from "./components/TasksModal";
import NotificationCenterModal from "./components/NotificationCenterModal";
import DocumentsModal from "./components/DocumentsModal";

const statIcons = [Package, Search, Handshake, Handshake, Eye, Handshake];

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "smartKpi", name: "Smart KPI Metrics", visible: true, favorite: false },
  { id: "quickActions", name: "Quick Action Hub", visible: true, favorite: false },
  { id: "aiInsights", name: "AI Recommendations", visible: true, favorite: false },
  { id: "goalProgress", name: "Goal Progress Indicators", visible: true, favorite: false },
  { id: "upcomingMeetings", name: "Upcoming Syncs & Meetings", visible: true, favorite: false },
  { id: "recentActivities", name: "Recent Activities Log", visible: true, favorite: false },
  { id: "recentProducts", name: "Recent Products Portfolio", visible: true, favorite: false },
  { id: "recentCollaborations", name: "Recent Collaborations Tracker", visible: true, favorite: false },
  { id: "recommendedBrands", name: "Recommended Brands", visible: true, favorite: false },
];

export default function ProductOwnerHomePage() {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<any[]>([]);
  const [panels, setPanels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Enterprise details
  const [enterpriseStats, setEnterpriseStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [goalProgressList, setGoalProgressList] = useState<any[]>([]);

  // Modals / configuration state
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  useEffect(() => {
    // Load widgets config
    const saved = localStorage.getItem("bb_dashboard_layout");
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch {
        setWidgets(DEFAULT_WIDGETS);
      }
    } else {
      setWidgets(DEFAULT_WIDGETS);
    }

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`${PO_API_BASE}/stats`).then((r) => r.json()),
    ])
      .then(([userData, statsData]) => {
        setUserName(userData.user?.name?.split(" ")[0] ?? "");
        setStats(statsData.stats ?? []);
        setPanels(statsData.panels ?? []);
        setEnterpriseStats(statsData.enterpriseStats);
        setRecentActivities(statsData.recentActivities ?? []);
        setUpcomingMeetings(statsData.upcomingMeetings ?? []);
        setAiInsights(statsData.aiInsights ?? []);
        setGoalProgressList(statsData.goalProgressList ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  function saveLayout(newLayout: WidgetConfig[]) {
    setWidgets(newLayout);
    localStorage.setItem("bb_dashboard_layout", JSON.stringify(newLayout));
  }

  function resetLayout() {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.setItem("bb_dashboard_layout", JSON.stringify(DEFAULT_WIDGETS));
  }

  if (loading) {
    return <div className="text-ink-faint">Loading dashboard...</div>;
  }

  const activeWidgets = widgets.filter((w) => w.visible);

  return (
    <div>
      {/* Top Welcome / Header section */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple">
            Product Owner Dashboard
          </div>
          <h1 className="bb-display text-2xl font-semibold sm:text-3xl">
            Welcome back{userName ? `, ${userName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Promote your products through brand partnerships. Track performance and manage collaborations.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNotifications(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-strong)] text-ink-soft hover:bg-[var(--surface-strong)] hover:text-ink cursor-pointer relative"
            title="Notifications"
          >
            <Bell size={18} />
            {enterpriseStats?.pendingApprovalsCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-purple-500" />
            )}
          </button>
          <button
            onClick={() => setShowTasks(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-strong)] text-ink-soft hover:bg-[var(--surface-strong)] hover:text-ink cursor-pointer"
            title="Tasks Board"
          >
            <CheckSquare size={18} />
          </button>
          <button
            onClick={() => setShowCustomizer(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/20 px-4 py-2 text-sm text-purple hover:bg-purple-500/20 cursor-pointer"
          >
            <Settings size={16} />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Cards Row */}
      {widgets.find((w) => w.id === "smartKpi")?.visible && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat, i) => (
            <PoStatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={statIcons[i] ?? Package}
            />
          ))}
          {/* Smart Enterprise metrics */}
          <PoStatCard
            label="Estimated Campaign ROI"
            value={enterpriseStats?.roi ?? "185%"}
            icon={DollarSign}
          />
          <PoStatCard
            label="Brand Engagement Rate"
            value={enterpriseStats?.engagementRate ?? "4.8%"}
            icon={TrendingUp}
          />
          <PoStatCard
            label="Average Conversion Rate"
            value={enterpriseStats?.conversionRate ?? "2.4%"}
            icon={Percent}
          />
        </div>
      )}

      {/* Quick Nav Links */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/dashboard/product_owner/products", label: "Manage Products", icon: Package },
          { href: "/dashboard/product_owner/brands", label: "Find Brands", icon: Search },
          { href: "/dashboard/product_owner/campaigns", label: "Campaigns", icon: Megaphone },
          { href: "/dashboard/product_owner/messages", label: "Messages", icon: MessageSquare },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bb-glass flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-ink-soft hover:text-purple"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </div>

      {/* Flexible Widgets Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeWidgets.map((widget) => {
          if (widget.id === "quickActions") {
            return (
              <QuickActionsWidget
                key={widget.id}
                onOpenReports={() => setShowReports(true)}
                onOpenTasks={() => setShowTasks(true)}
                onOpenDocuments={() => setShowDocuments(true)}
              />
            );
          }
          if (widget.id === "aiInsights") {
            return <AIInsightsWidget key={widget.id} insights={aiInsights} />;
          }
          if (widget.id === "goalProgress") {
            return <GoalProgressWidget key={widget.id} goals={goalProgressList} />;
          }
          if (widget.id === "upcomingMeetings") {
            return <UpcomingMeetingsWidget key={widget.id} meetings={upcomingMeetings} />;
          }
          if (widget.id === "recentActivities") {
            return <RecentActivitiesWidget key={widget.id} activities={recentActivities} />;
          }

          // Legacy panels map directly here
          if (widget.id === "recentProducts") {
            const panel = panels.find((p) => p.title === "Recent Products");
            if (!panel) return null;
            return (
              <div key={widget.id} className="bb-glass rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="bb-display text-base font-semibold">{panel.title}</h2>
                  <Link
                    href="/dashboard/product_owner/products"
                    className="flex items-center gap-1 text-xs text-purple hover:text-purple"
                  >
                    View all <ArrowRight size={12} />
                  </Link>
                </div>
                {panel.items.length === 0 ? (
                  <p className="text-sm text-ink-faint">No products yet.</p>
                ) : (
                  <div className="space-y-3">
                    {panel.items.map((item: any, i: number) => (
                      <Link
                        key={String(item._id ?? i)}
                        href={`/dashboard/product_owner/products/${item._id}`}
                        className="flex items-center justify-between rounded-xl bg-[var(--surface-strong)] px-4 py-3 text-sm hover:bg-[var(--surface-strong)]"
                      >
                        <div className="flex-1 min-w-0 pr-2 truncate">
                          <span className="font-medium truncate">{String(item.name ?? "Product")}</span>
                          {!!item.category && (
                            <span className="ml-2 text-xs text-ink-faint">{String(item.category)}</span>
                          )}
                        </div>
                        <ProductStatusBadge status={String(item.status ?? "draft")} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (widget.id === "recentCollaborations") {
            const panel = panels.find((p) => p.title === "Recent Collaboration Requests");
            if (!panel) return null;
            return (
              <div key={widget.id} className="bb-glass rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="bb-display text-base font-semibold">{panel.title}</h2>
                  <Link
                    href="/dashboard/product_owner/collaborations"
                    className="flex items-center gap-1 text-xs text-purple hover:text-purple"
                  >
                    View all <ArrowRight size={12} />
                  </Link>
                </div>
                {panel.items.length === 0 ? (
                  <p className="text-sm text-ink-faint">No collaborations request yet.</p>
                ) : (
                  <div className="space-y-3">
                    {panel.items.map((item: any, i: number) => {
                      const partner = item.partnerId as { name?: string } | undefined;
                      const product = item.productId as { name?: string } | undefined;
                      return (
                        <div key={String(item._id ?? i)} className="rounded-xl bg-[var(--surface-strong)] px-4 py-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span>{partner?.name ?? "Brand partner"}</span>
                            <ProductStatusBadge status={String(item.status ?? "pending")} />
                          </div>
                          {product?.name && (
                            <p className="mt-1 text-xs text-ink-faint">Re: {product.name}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (widget.id === "recommendedBrands") {
            const panel = panels.find((p) => p.title === "Recommended Brands");
            if (!panel) return null;
            return (
              <div key={widget.id} className="bb-glass rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="bb-display text-base font-semibold">{panel.title}</h2>
                </div>
                {panel.items.length === 0 ? (
                  <p className="text-sm text-ink-faint">No recommendations found.</p>
                ) : (
                  <div className="space-y-3">
                    {panel.items.map((item: any, i: number) => {
                      const company =
                        (item.companyName as string) ??
                        ((item.userId as { name?: string })?.name) ??
                        "Brand";
                      return (
                        <div key={i} className="rounded-xl bg-[var(--surface-strong)] px-4 py-3 text-sm flex justify-between items-center">
                          <div>
                            <span className="font-medium">{company}</span>
                            {!!item.industry && (
                              <span className="ml-2 text-xs text-ink-faint">{String(item.industry)}</span>
                            )}
                          </div>
                          <span className="text-[10px] bg-purple-500/10 text-purple font-semibold px-2 py-0.5 rounded">
                            {90 - i * 3}% Match
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Floating Modals overlay */}
      {showCustomizer && (
        <DashboardCustomizer
          widgets={widgets}
          onChange={saveLayout}
          onClose={() => setShowCustomizer(false)}
          onReset={resetLayout}
        />
      )}

      {showReports && <ReportsModal onClose={() => setShowReports(false)} />}
      {showTasks && <TasksModal onClose={() => setShowTasks(false)} />}
      {showNotifications && <NotificationCenterModal onClose={() => setShowNotifications(false)} />}
      {showDocuments && <DocumentsModal onClose={() => setShowDocuments(false)} />}
    </div>
  );
}

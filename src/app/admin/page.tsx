"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import { analyticsAPI, auditLogAPI } from "../../services/api";
import { Eye, Users, FileText, UserPlus, ArrowUpRight, ShieldAlert } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await analyticsAPI.getDashboardAnalytics();
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        // Fetch recent audit logs for activity feed
        try {
          const auditRes = await auditLogAPI.getAuditLogs({ limit: 5 });
          if (auditRes.data.success) {
            setActivities(auditRes.data.entries || []);
          }
        } catch (auditErr: any) {
          console.warn("Could not load audit feed (user role may not be Super Admin):", auditErr.message);
        }
      } catch (err: any) {
        console.error("Dashboard stats fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse font-serif text-sm tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
            Loading System Metrics...
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Draw clean line path for SVG chart
  const renderTrendChart = () => {
    if (!stats || !stats.trafficTrends || stats.trafficTrends.length === 0) return null;

    const trends = stats.trafficTrends;
    const maxVal = Math.max(...trends.map((t: any) => t.views), 10);
    const height = 120;
    const width = 500;
    const padding = 20;

    const points = trends
      .map((t: any, idx: number) => {
        const x = padding + (idx * (width - padding * 2)) / (trends.length - 1);
        const y = height - padding - (t.views * (height - padding * 2)) / maxVal;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 mt-4">
        <line
          x1={padding}
          y1={padding}
          x2={width - padding}
          y2={padding}
          stroke="#E5E5E5"
          strokeDasharray="3,3"
          className="dark:stroke-neutral-800"
        />
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="#E5E5E5"
          strokeDasharray="3,3"
          className="dark:stroke-neutral-800"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#E5E5E5"
          strokeDasharray="3,3"
          className="dark:stroke-neutral-800"
        />

        <polyline
          fill="none"
          stroke="#A3704C"
          strokeWidth="2"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {trends.map((t: any, idx: number) => {
          const x = padding + (idx * (width - padding * 2)) / (trends.length - 1);
          const y = height - padding - (t.views * (height - padding * 2)) / maxVal;
          return (
            <g key={idx} className="group">
              <circle
                cx={x}
                cy={y}
                r="3.5"
                className="fill-editorial-accent stroke-white dark:stroke-neutral-950 cursor-pointer"
              />
              <title>{`${t.date}: ${t.views} views`}</title>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-850 rounded-sm flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">Total Pageviews</span>
              <p className="text-xl font-bold font-serif leading-none">{stats?.totalViews}</p>
            </div>
            <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-sm">
              <Eye className="w-4 h-4 text-editorial-accent" />
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-850 rounded-sm flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">Unique Visitors</span>
              <p className="text-xl font-bold font-serif leading-none">{stats?.uniqueVisitors}</p>
            </div>
            <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-sm">
              <Users className="w-4 h-4 text-editorial-accent" />
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-850 rounded-sm flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">User Base</span>
              <p className="text-xl font-bold font-serif leading-none">{stats?.totalRegistrations}</p>
            </div>
            <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-sm">
              <UserPlus className="w-4 h-4 text-editorial-accent" />
            </div>
          </div>

          <button
            onClick={() => router.push("/admin/posts/new")}
            className="p-4 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-sm flex items-center justify-between group cursor-pointer shadow-xs text-left w-full"
          >
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Write Article</span>
              <p className="text-sm font-bold font-serif flex items-center">
                Create Post{" "}
                <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </p>
            </div>
            <div className="p-2 bg-neutral-850 dark:bg-white rounded-sm">
              <FileText className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Traffic Trend Chart */}
        <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-850 rounded-sm space-y-2 shadow-xs">
          <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-800 dark:text-neutral-200">
            Pageviews Trend (Last 7 Days)
          </h3>
          {renderTrendChart()}
          <div className="flex justify-between text-[8px] uppercase text-neutral-405 dark:text-neutral-500 px-3 font-semibold">
            {stats?.trafficTrends.map((t: any) => (
              <span key={t.date}>
                {new Date(t.date).toLocaleDateString(undefined, { weekday: "short" })}
              </span>
            ))}
          </div>
        </div>

        {/* Device & Referrer breakdowns grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-850 rounded-sm space-y-4 text-xs shadow-xs">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-900 pb-2">
              Device Acquisition
            </h3>
            <div className="space-y-3">
              {stats?.deviceBreakdown?.map((d: any) => {
                const pct = stats.totalViews ? ((d.count / stats.totalViews) * 100).toFixed(0) : 0;
                return (
                  <div key={d._id} className="space-y-1">
                    <div className="flex justify-between font-semibold uppercase text-[10px]">
                      <span>{d._id || "unknown"}</span>
                      <span>
                        {pct}% ({d.count})
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-editorial-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!stats?.deviceBreakdown || stats.deviceBreakdown.length === 0) && (
                <p className="text-[11px] text-neutral-450 italic">No device metrics recorded yet.</p>
              )}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-850 rounded-sm space-y-4 text-xs shadow-xs">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-900 pb-2">
              Traffic Referrers
            </h3>
            <div className="space-y-2">
              {stats?.referrerBreakdown?.map((r: any) => {
                const refLabel = r._id || "Direct traffic";
                const pct = stats.totalViews ? ((r.count / stats.totalViews) * 100).toFixed(0) : 0;
                return (
                  <div
                    key={r._id}
                    className="flex justify-between items-center py-1.5 border-b border-neutral-100/40 dark:border-neutral-900/40 text-neutral-600 dark:text-neutral-400"
                  >
                    <span className="font-semibold">{refLabel}</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {pct}% ({r.count})
                    </span>
                  </div>
                );
              })}
              {(!stats?.referrerBreakdown || stats.referrerBreakdown.length === 0) && (
                <p className="text-[11px] text-neutral-450 italic">No referrer data compiled.</p>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Activity Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Popular Posts */}
          <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-850 rounded-sm space-y-4 shadow-xs">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-900 pb-2">
              Most Viewed Publications
            </h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-900 text-xs">
              {stats?.topPosts?.map((post: any) => (
                <div key={post._id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center group">
                  <div className="space-y-0.5 pr-4">
                    <Link
                      href={`/post/${post.slug}`}
                      className="font-serif font-bold text-neutral-850 dark:text-neutral-200 hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors block"
                    >
                      {post.title}
                    </Link>
                    <span className="text-[9px] text-neutral-450">
                      Published: {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {post.viewsCount} views
                    </span>
                  </div>
                </div>
              ))}
              {(!stats?.topPosts || stats.topPosts.length === 0) && (
                <p className="text-[11px] text-neutral-450 italic">No publications data yet.</p>
              )}
            </div>
          </div>

          {/* Recent Audit Activities */}
          <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-850 rounded-sm space-y-4 shadow-xs">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-900 pb-2 flex items-center justify-between">
              <span>Security & Audit Logs</span>
              {activities.length > 0 && (
                <Link
                  href="/admin/audit-log"
                  className="text-[9px] uppercase font-bold text-editorial-accent dark:text-editorial-gold hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                </Link>
              )}
            </h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-900 text-[11px] font-mono">
              {activities.length === 0 ? (
                <p className="text-[11px] text-neutral-450 italic py-4">No recent activity logs compiled.</p>
              ) : (
                activities.map((act) => (
                  <div key={act._id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-start gap-3">
                    <div className="space-y-0.5 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300 text-xs">
                          {act.user?.name || "System"}
                        </span>
                        <span
                          className={`text-[8px] font-bold px-1 rounded ${
                            act.action.startsWith("DELETE")
                              ? "bg-red-50 dark:bg-red-950/20 text-red-750 dark:text-red-400"
                              : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-450"
                          }`}
                        >
                          {act.action}
                        </span>
                      </div>
                      <p
                        className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-1 leading-normal"
                        title={act.target}
                      >
                        {act.target}
                      </p>
                    </div>
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap self-center font-sans">
                      {new Date(act.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

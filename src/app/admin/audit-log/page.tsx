"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { auditLogAPI } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function AuditLogPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await auditLogAPI.getAuditLogs();
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err: any) {
      showToast("Failed to load audit logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200/50 dark:border-neutral-900 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
              System Audit Logs
            </h1>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-editorial-accent" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-450 italic">
              No audit logs captured.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-400">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Details / Target</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10">
                      <td className="p-3">
                        <span className="font-semibold text-neutral-805 dark:text-neutral-250">
                          {log.user?.name || "System Process"}
                        </span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block">
                          {log.user?.role || "System"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] uppercase font-bold bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-350 px-2 py-0.5 rounded-sm border border-neutral-250/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-neutral-600 dark:text-neutral-355 max-w-sm truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="p-3 text-[10px] text-neutral-450 dark:text-neutral-500 font-mono">
                        {log.ipAddress || "—"}
                      </td>
                      <td className="p-3 text-[10px] text-neutral-400 dark:text-neutral-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

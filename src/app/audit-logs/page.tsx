


'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { formatDateTime } from '@/lib/utils';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogsPage() {
  const { auditLogs } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (
        !log.userName.toLowerCase().includes(q) &&
        !log.details.toLowerCase().includes(q) &&
        !log.entity.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity', 'Previous Value', 'New Value', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${l.previousValue || ''}"`,
      `"${l.newValue || ''}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeadFlow_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredLogs.length} audit logs`);
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Enterprise Compliance & Audit Logs
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Immutable Trail
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographically timestamped action logs for lead reassignments, quotation revisions, and deal stage changes
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, entity ID, description..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="all">All Actions</option>
            <option value="lead_created">Lead Created</option>
            <option value="lead_assigned">Lead Assigned / Reassigned</option>
            <option value="lead_status_changed">Lead Status Changed</option>
            <option value="quotation_generated">Quotation Generated</option>
            <option value="quotation_revised">Quotation Revised</option>
            <option value="order_converted">Order Converted</option>
            <option value="integration_event_processed">Integration Ingestion</option>
            <option value="duplicate_merged">Duplicate Merge</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredLogs.length}</strong> events
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4">Delta (Prev → New)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-muted-foreground text-[11px]">
                    {formatDateTime(log.timestamp)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-foreground">{log.userName}</div>
                    <div className="text-[10px] text-muted-foreground">{log.userRole}</div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">
                    {log.entity}
                  </td>

                  <td className="py-3 px-4 text-muted-foreground text-xs leading-relaxed max-w-sm">
                    {log.details}
                  </td>

                  <td className="py-3 px-4 text-[11px] whitespace-nowrap">
                    {log.previousValue || log.newValue ? (
                      <div className="flex items-center gap-1 font-mono">
                        {log.previousValue && (
                          <span className="text-muted-foreground line-through">
                            {log.previousValue}
                          </span>
                        )}
                        {log.previousValue && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                        {log.newValue && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            {log.newValue}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

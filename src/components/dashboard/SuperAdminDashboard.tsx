'use client';

import React from 'react';
import { useCRM } from '@/store/crmStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Crown,
  ShieldCheck,
  Server,
  Activity,
  Users,
  Database,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  FileText,
  ShoppingBag,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  ShieldAlert,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export function SuperAdminDashboard() {
  const {
    leads,
    customers,
    orders,
    quotations,
    employees,
    auditLogs,
    resetDemoData,
    exportDataAsJSON,
  } = useCRM();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
  const totalPipelineVal = leads.reduce((sum, l) => sum + (l.estimatedValue || l.budget || 0), 0);
  const activeEmployees = employees.length;

  const roleDistribution = [
    { role: 'Super Admin', count: 1, color: '#9333ea', access: 'Unrestricted Root Access' },
    { role: 'Admin', count: 1, color: '#2563eb', access: 'Operations, Leads, Settings' },
    { role: 'Sales Manager', count: 2, color: '#f59e0b', access: 'Team Scoped (Alpha/Beta)' },
    { role: 'Sales Executive', count: 4, color: '#10b981', access: 'Assigned Leads Only' },
    { role: 'Read-Only / Auditor', count: 1, color: '#64748b', access: 'View Only Reporting' },
  ];

  const systemHealthMetrics = [
    { name: 'IndiaMART Webhook Gateway', status: 'Healthy', latency: '124 ms', uptime: '99.98%' },
    { name: 'Justdial Ingestion API', status: 'Healthy', latency: '168 ms', uptime: '99.94%' },
    { name: 'Deduplication Engine', status: 'Active', latency: '12 ms', uptime: '100%' },
    { name: 'Client Persistence Cache', status: 'Optimal', latency: '< 1 ms', uptime: '100%' },
  ];

  const tenantGrowthData = [
    { month: 'Jun', leads: 22, orders: 4, revenue: 1250000 },
    { month: 'Jul', leads: 28, orders: 6, revenue: 1840000 },
    { month: 'Aug', leads: 34, orders: 8, revenue: 2420000 },
    { month: 'Sep', leads: 41, orders: 11, revenue: 3100000 },
    { month: 'Oct', leads: 48, orders: 15, revenue: 4500000 },
    { month: 'Nov', leads: leads.length, orders: orders.length, revenue: totalRevenue },
  ];

  const handleExportBackup = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leadflow_crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Platform Owner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-neutral-900 border border-purple-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-900/80 text-purple-300 border border-purple-700/60 flex items-center gap-1.5">
              <Crown className="w-3 h-3 text-purple-400" /> Platform Owner Console
            </span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              99.98% System Uptime
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Global Governance & Enterprise Administration
          </h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Apex Engineering Technologies Pvt. Ltd. • Multi-tenant platform cluster, RBAC matrix control, integration webhook gateways, and system-wide audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset entire CRM demo data to initial factory seed state?')) {
                resetDemoData();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* 4 Super Admin High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Platform Ingested Leads</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{leads.length}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>100% data visibility (Unrestricted)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Enterprise Closed Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span>{orders.length} Completed Sales Orders</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Pipeline Potential</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalPipelineVal)}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span>Across 13 pipeline sales stages</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Active Enterprise Users</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{activeEmployees} Employees</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
              <span>5 Security RBAC Tiers Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Platform Growth Chart & RBAC Security Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Trends */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Organization Ingestion & Revenue Trajectory</h3>
              <p className="text-xs text-muted-foreground">Monthly lead velocity vs closed enterprise revenue.</p>
            </div>
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold">
              H2 2026 Audit
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tenantGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.95)',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any, name: string) => [
                    name === 'revenue' ? formatCurrency(val) : val,
                    name === 'revenue' ? 'Revenue' : 'Leads Ingested',
                  ]}
                />
                <Line type="monotone" dataKey="leads" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RBAC Role Distribution */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-500" />
                <span>RBAC Privilege Breakdown</span>
              </h3>
              <Link href="/settings?tab=security" className="text-[11px] text-purple-600 hover:underline">
                Matrix →
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {roleDistribution.map((r) => (
                <div key={r.role} className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                      {r.role}
                    </span>
                    <span className="font-mono font-bold text-foreground">{r.count} seat(s)</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">{r.access}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Granular Actions</span>
            <span className="text-emerald-500 font-semibold">100% Policy Compliant</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: System Health Gateways + Recent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System Gateways */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" />
              <span>External Ingestion & Engine Status</span>
            </h3>
            <Link href="/integrations" className="text-[11px] text-emerald-600 hover:underline">
              Manage Webhooks →
            </Link>
          </div>

          <div className="space-y-3">
            {systemHealthMetrics.map((g) => (
              <div key={g.name} className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">{g.name}</div>
                  <div className="text-[10px] text-muted-foreground">Latency: {g.latency} • Uptime: {g.uptime}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Audit Log Activity */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Recent Super Admin Audit Trail</span>
            </h3>
            <Link href="/audit-logs" className="text-[11px] text-purple-600 hover:underline">
              Full Audit Vault →
            </Link>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-muted/30 border border-border text-xs flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground text-[11px] truncate">{log.action}</span>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {log.details}
                  </p>
                  <div className="text-[9px] text-muted-foreground/60 mt-0.5">
                    User: {log.userName} ({log.userRole})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

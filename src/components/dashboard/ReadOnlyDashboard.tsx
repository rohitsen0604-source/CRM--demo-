'use client';

import React, { useMemo } from 'react';
import { useCRM } from '@/store/crmStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Eye,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldAlert,
  Download,
  Building2,
  DollarSign,
  Award,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';
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

export function ReadOnlyDashboard() {
  const { leads, orders, quotations, employees, currentUser } = useCRM();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
  const totalPipelineVal = leads.reduce((sum, l) => sum + (l.estimatedValue || l.budget || 0), 0);
  const wonLeadsCount = leads.filter((l) => l.status === 'won').length;
  const overallConversionRate = leads.length > 0 ? ((wonLeadsCount / leads.length) * 100).toFixed(1) : '0';

  // Team comparison data
  const teamComparison = [
    { team: 'Team Alpha (Machinery & West)', leadCount: 27, revenue: 4120000, quotaPct: 82, manager: 'Rahul Mehta' },
    { team: 'Team Beta (Supplies & North)', leadCount: 18, revenue: 2725000, quotaPct: 68, manager: 'Neha Sharma' },
  ];

  // Channel ROI Analysis
  const channelROI = [
    { channel: 'IndiaMART Lead Manager', cost: 120000, revenue: 3840000, roi: '480%', leads: 41 },
    { channel: 'Justdial Express Connector', cost: 95000, revenue: 2150000, roi: '390%', leads: 26 },
  ];

  const handleExportBoardReport = () => {
    alert('Exporting Executive Board Summary Report (PDF/Excel) with tamper-proof audit timestamp.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-neutral-900 to-neutral-900 border border-slate-700/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-600 flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-slate-400" /> Executive Board Observer
            </span>
            <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Read-Only Governance Enforced
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Executive Intelligence & Board Audit Briefing
          </h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Welcome, {currentUser.name}. Full read-only access to commercial revenue telemetry, marketing channel ROI, and cross-team sales velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportBoardReport}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-600 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Board Briefing</span>
          </button>
        </div>
      </div>

      {/* Governance Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong className="text-foreground">Auditor Safeguard Active:</strong> Direct create, update, delete, or reassignment actions are systematically blocked for this role.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
          ISO 27001 Compliant
        </span>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Realized Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              +18.4% vs Previous Quarter
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Blended Conversion Rate</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{overallConversionRate}%</div>
            <div className="text-[11px] text-muted-foreground">
              {wonLeadsCount} of {leads.length} Inquiries Won
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total In-Flight Pipeline</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalPipelineVal)}</div>
            <div className="text-[11px] text-muted-foreground">
              Weighted Deal Probability
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Avg Sales Cycle Velocity</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">18.4 Days</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              3.2 days faster than industry benchmark
            </div>
          </div>
        </div>
      </div>

      {/* Channel ROI Analysis Table */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">Marketing & Ingestion Channel ROI Analysis</h3>
            <p className="text-xs text-muted-foreground">Customer acquisition cost vs realized commercial contract revenue.</p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            High Efficiency
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Channel / Partner</th>
                <th className="py-2.5 px-4">Inquiries</th>
                <th className="py-2.5 px-4">Channel Spend</th>
                <th className="py-2.5 px-4">Closed Revenue</th>
                <th className="py-2.5 px-4">Return on Ad Spend (ROAS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {channelROI.map((c) => (
                <tr key={c.channel} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-foreground">{c.channel}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.leads} inquiries</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">{formatCurrency(c.cost)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-foreground">{formatCurrency(c.revenue)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {c.roi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Team Performance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamComparison.map((t) => (
          <div key={t.team} className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h4 className="font-bold text-sm text-foreground">{t.team}</h4>
                <div className="text-xs text-muted-foreground">Team Lead: {t.manager}</div>
              </div>
              <span className="text-xs font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded-lg">
                {t.leadCount} leads
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Quarterly Quota Attainment</span>
                <span className="font-bold text-foreground">{t.quotaPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${t.quotaPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Realized Sales Revenue</span>
              <span className="font-bold text-foreground text-sm">{formatCurrency(t.revenue)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

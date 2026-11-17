'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/store/crmStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  UserCheck,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  Building2,
  ArrowUpRight,
  Filter,
  DollarSign,
  PhoneCall,
  Calendar,
  FileText,
  Boxes,
  ArrowRight,
  ShieldCheck,
  UserPlus,
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

const SOURCE_COLORS: Record<string, string> = {
  indiamart: '#059669',
  justdial: '#d97706',
};

export function AdminDashboard() {
  const {
    leads,
    customers,
    tasks,
    orders,
    quotations,
    employees,
    duplicateReviews,
  } = useCRM();

  const totalLeads = leads.length;
  const unassignedLeads = leads.filter((l) => !l.assignedTo || l.assignedTo === 'emp_unassigned');
  const pendingDuplicates = duplicateReviews.filter((d) => d.status === 'pending_review');
  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'overdue');
  const overdueTasks = tasks.filter((t) => t.status === 'overdue');

  // Rep workload stats
  const repWorkload = useMemo(() => {
    const salesReps = employees.filter((e) => e.role === 'sales_executive' || e.role === 'executive');
    return salesReps.map((rep) => {
      const repLeads = leads.filter((l) => l.assignedTo === rep.id);
      const repPipeline = repLeads.reduce((sum, l) => sum + (l.estimatedValue || l.budget || 0), 0);
      const repWon = repLeads.filter((l) => l.status === 'won').length;
      const capacityPct = Math.min(100, Math.round((repLeads.length / 20) * 100));

      return {
        ...rep,
        leadCount: repLeads.length,
        pipelineVal: repPipeline,
        wonCount: repWon,
        capacityPct,
      };
    });
  }, [employees, leads]);

  // Lead sources
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = { indiamart: 0, justdial: 0 };
    leads.forEach((l) => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    return Object.entries(counts).map(([src, val]) => ({
      name: src === 'indiamart' ? 'IndiaMART' : 'Justdial',
      sourceKey: src,
      value: val,
    }));
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-neutral-900 to-neutral-900 border border-blue-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-900/80 text-blue-300 border border-blue-700/60 flex items-center gap-1.5">
              <UserCheck className="w-3 h-3 text-blue-400" /> Admin Operations Console
            </span>
            <span className="text-[11px] text-blue-300 font-mono">
              Daily Workflow & Pipeline Inflow
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Sales Operations & Team Workload Command Center
          </h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Lead allocation, sales executive quota tracking, quotation workflow, and B2B enquiry throughput.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/leads?view=unassigned"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Assign Pending ({unassignedLeads.length})</span>
          </Link>
          <Link
            href="/pipeline"
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-colors"
          >
            <span>View Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Operational Alerts */}
      {(unassignedLeads.length > 0 || pendingDuplicates.length > 0 || overdueTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {unassignedLeads.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">{unassignedLeads.length} Unassigned Inquiries</div>
                  <div className="text-[10px] text-muted-foreground">Assign to sales reps before SLA expires</div>
                </div>
              </div>
              <Link href="/leads?view=unassigned" className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                Allocate →
              </Link>
            </div>
          )}

          {pendingDuplicates.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">{pendingDuplicates.length} Duplicate Lead Review</div>
                  <div className="text-[10px] text-muted-foreground">Matched by Phone or Email hash</div>
                </div>
              </div>
              <Link href="/integrations" className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Review →
              </Link>
            </div>
          )}

          {overdueTasks.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">{overdueTasks.length} Overdue Follow-ups</div>
                  <div className="text-[10px] text-muted-foreground">Requires immediate rep escalation</div>
                </div>
              </div>
              <Link href="/follow-ups" className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline">
                Inspect →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Active Operational Leads</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{totalLeads}</div>
            <div className="text-[11px] text-muted-foreground">
              {leads.filter((l) => l.status === 'new').length} New • {unassignedLeads.length} Unallocated
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Realized Orders Value</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Across {orders.length} Dispatched Sales Orders
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Quotations in Progress</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{quotations.length} Active Quotes</div>
            <div className="text-[11px] text-muted-foreground">
              GST Calculation & PDF export ready
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tasks & Activities Pending</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{pendingTasks.length} Pending</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              {overdueTasks.length} Escalated overdue
            </div>
          </div>
        </div>
      </div>

      {/* Rep Workload & Capacity Grid */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">Sales Executive Workload & Capacity Utilization</h3>
            <p className="text-xs text-muted-foreground">Monitor assigned lead distribution and prevent sales rep burnout.</p>
          </div>
          <Link href="/team" className="text-xs text-blue-600 hover:underline font-semibold">
            Manage Employees →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {repWorkload.map((rep) => (
            <div key={rep.id} className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-foreground">{rep.fullName || rep.name}</div>
                  <div className="text-[10px] text-muted-foreground">{rep.teamName || 'Sales Rep'}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                  {rep.leadCount} leads
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Capacity (max 20)</span>
                  <span className="font-mono">{rep.capacityPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      rep.capacityPct > 80 ? 'bg-rose-500' : rep.capacityPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${rep.capacityPct}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-[11px] pt-1 border-t border-border/50 text-muted-foreground">
                <span>Pipeline: <span className="font-semibold text-foreground">{formatCurrency(rep.pipelineVal)}</span></span>
                <span>Won: <span className="font-semibold text-emerald-600">{rep.wonCount}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Chart: Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-bold text-foreground">Inquiry Capture by Lead Source</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.sourceKey] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.95)',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {sourceData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SOURCE_COLORS[s.sourceKey] }} />
                <span>{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Operational Action Center</h3>
            <p className="text-xs text-muted-foreground">Quick managerial triggers for daily workflow optimization.</p>
            <div className="mt-4 space-y-2">
              <Link
                href="/leads?view=unassigned"
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                  <span>Assign Unallocated Leads to Sales Team</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/integrations"
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-500" />
                  <span>Review IndiaMART & Justdial Ingestion Webhooks</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/quotations"
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span>Review Pending Commercial Quotations & GST</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
            Operations Head tip: Ensure all new IndiaMART leads receive first contact attempt within 15 minutes to maximize B2B conversion rate.
          </div>
        </div>
      </div>
    </div>
  );
}

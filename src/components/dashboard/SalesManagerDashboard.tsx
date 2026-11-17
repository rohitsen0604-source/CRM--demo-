'use client';

import React, { useMemo } from 'react';
import { useCRM } from '@/store/crmStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  Kanban,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  ArrowUpRight,
  PhoneCall,
  Calendar,
  FileText,
  UserCheck,
  Award,
  ArrowRight,
  UserPlus,
  Target,
  ShoppingBag,
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

export function SalesManagerDashboard() {
  const {
    currentUser,
    scopedLeads,
    scopedTasks,
    scopedQuotations,
    scopedOrders,
    scopedEmployees,
    leads,
  } = useCRM();

  // Scoped to Team Alpha: Rahul Mehta's team
  const teamLeads = scopedLeads; // Exactly 27 leads (Amit + Priya)
  const teamRevenue = scopedOrders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
  const teamPipelineVal = teamLeads.reduce((sum, l) => sum + (l.estimatedValue || l.budget || 0), 0);
  const teamPendingTasks = scopedTasks.filter((t) => t.status === 'pending' || t.status === 'overdue');
  const teamOverdueTasks = scopedTasks.filter((t) => t.status === 'overdue');

  // Team members (Amit Patel, Priya Joshi)
  const teamAlphaMembers = useMemo(() => {
    return scopedEmployees.filter((e) => e.teamId === 'team_alpha' && (e.role === 'sales_executive' || e.role === 'executive'));
  }, [scopedEmployees]);

  const memberStats = useMemo(() => {
    return teamAlphaMembers.map((member) => {
      const mLeads = teamLeads.filter((l) => l.assignedTo === member.id);
      const mPipeline = mLeads.reduce((sum, l) => sum + (l.estimatedValue || l.budget || 0), 0);
      const mWon = mLeads.filter((l) => l.status === 'won').length;
      const mQuotations = scopedQuotations.filter((q) => q.assignedTo === member.id || mLeads.some((l) => l.id === q.relatedLeadId)).length;
      const targetVal = 2500000; // 25 Lakh target
      const wonOrders = scopedOrders.filter((o) => o.assignedSalesExecutiveId === member.id || mLeads.some((l) => l.id === o.relatedLeadId));
      const wonVal = wonOrders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
      const targetPct = Math.min(100, Math.round((wonVal / targetVal) * 100));

      return {
        ...member,
        leadCount: mLeads.length,
        pipelineVal: mPipeline,
        wonCount: mWon,
        wonVal,
        targetVal,
        targetPct,
        quotationsCount: mQuotations,
      };
    });
  }, [teamAlphaMembers, teamLeads, scopedQuotations, scopedOrders]);

  // Lead stages in Team Alpha
  const stageBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      New: 0,
      Assigned: 0,
      Contacted: 0,
      Qualified: 0,
      Negotiation: 0,
      Won: 0,
      Lost: 0,
    };

    teamLeads.forEach((l) => {
      if (l.status === 'new') counts['New']++;
      else if (l.status === 'assigned') counts['Assigned']++;
      else if (['contact_attempted', 'contacted'].includes(l.status)) counts['Contacted']++;
      else if (['qualified', 'needs_analysis'].includes(l.status)) counts['Qualified']++;
      else if (['quotation_sent', 'negotiation', 'review'].includes(l.status)) counts['Negotiation']++;
      else if (l.status === 'won') counts['Won']++;
      else if (['lost', 'disqualified'].includes(l.status)) counts['Lost']++;
    });

    return Object.entries(counts).map(([stage, count]) => ({ stage, count }));
  }, [teamLeads]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-900/80 text-amber-300 border border-amber-700/60 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-amber-400" /> Team Alpha Leader Console
            </span>
            <span className="text-[11px] text-amber-400 font-mono">
              Manager: {currentUser.name}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Team Alpha Performance & Quota Dashboard
          </h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Scoped to Team Alpha ({teamLeads.length} leads). Direct oversight of Amit Patel (Machinery & West) and Priya Joshi (Industrial Supplies & North).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/pipeline"
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Team Pipeline</span>
          </Link>
          <Link
            href="/team"
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-colors"
          >
            <span>Team Members</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Team Alpha KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Team Alpha Active Leads</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{teamLeads.length} Leads</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span>Scoped to Amit (15) + Priya (12)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Team Realized Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(teamRevenue)}</div>
            <div className="text-[11px] text-muted-foreground">
              {scopedOrders.length} Sales Orders Dispatched
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Team Alpha Pipeline Potential</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(teamPipelineVal)}</div>
            <div className="text-[11px] text-muted-foreground">
              Commercial deal negotiations
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Team Tasks & Follow-ups</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{teamPendingTasks.length} Pending</div>
            <div className="text-[11px] text-rose-500 font-medium">
              {teamOverdueTasks.length} Escalated overdue
            </div>
          </div>
        </div>
      </div>

      {/* Team Alpha Head-to-Head Quota & Workload */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Team Alpha Executive Quotas & Achievement</span>
            </h3>
            <p className="text-xs text-muted-foreground">Monthly targets, active lead count, and deals closed.</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground font-semibold">
            Q4 Targets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberStats.map((member) => (
            <div key={member.id} className="p-5 rounded-xl bg-muted/30 border border-border space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-foreground">{member.fullName || member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.title || member.role.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{member.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {member.leadCount} Assigned Leads
                </span>
              </div>

              {/* Target progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Sales Target Attainment</span>
                  <span className="font-bold text-foreground">{member.targetPct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                    style={{ width: `${member.targetPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Achieved: {formatCurrency(member.wonVal)}</span>
                  <span>Target: {formatCurrency(member.targetVal)}</span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center text-xs">
                <div className="p-2 rounded-lg bg-card border border-border/60">
                  <div className="text-muted-foreground text-[10px]">Pipeline</div>
                  <div className="font-bold text-foreground">{formatCurrency(member.pipelineVal)}</div>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border/60">
                  <div className="text-muted-foreground text-[10px]">Won Deals</div>
                  <div className="font-bold text-emerald-600">{member.wonCount} won</div>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border/60">
                  <div className="text-muted-foreground text-[10px]">Quotes</div>
                  <div className="font-bold text-purple-600">{member.quotationsCount} quotes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Alpha Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-bold text-foreground">Team Alpha Pipeline Stage Velocity</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.95)',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manager Actions */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Team Management Actions</h3>
            <p className="text-xs text-muted-foreground">Direct managerial interventions for Team Alpha.</p>
            <div className="mt-4 space-y-2">
              <Link
                href="/leads"
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
              >
                <span>Review Team Alpha Leads (27)</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/follow-ups"
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
              >
                <span>Escalate Overdue Follow-ups ({teamOverdueTasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/quotations"
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
              >
                <span>Inspect Active Quotations ({scopedQuotations.length})</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            Manager Note: Team Alpha is currently at 74% of the monthly target. Push quotation closures before month end.
          </div>
        </div>
      </div>
    </div>
  );
}

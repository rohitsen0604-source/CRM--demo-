'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/store/crmStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Briefcase,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  PhoneCall,
  Calendar,
  FileText,
  MessageSquare,
  ArrowRight,
  Plus,
  Target,
  ExternalLink,
  ShoppingBag,
  Send,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export function SalesExecutiveDashboard() {
  const {
    currentUser,
    scopedLeads,
    scopedTasks,
    scopedQuotations,
    scopedOrders,
    updateTask,
  } = useCRM();

  // Amit Patel: 15 Assigned Leads
  const myLeads = scopedLeads;
  const myRevenue = scopedOrders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
  const myPipelineVal = myLeads.reduce((sum, l) => sum + (l.estimatedValue || l.budget || 0), 0);
  const myTasks = scopedTasks;
  const pendingTasks = myTasks.filter((t) => t.status === 'pending' || t.status === 'overdue');
  const overdueTasks = myTasks.filter((t) => t.status === 'overdue');
  const wonLeads = myLeads.filter((l) => l.status === 'won');

  // Quota calculation
  const personalTarget = 2000000; // 20 Lakhs
  const targetPct = Math.min(100, Math.round((myRevenue / personalTarget) * 100));

  // Quick Action Call / WhatsApp states
  const [activeCallLead, setActiveCallLead] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      {/* Executive Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-emerald-400" /> My Sales Desk
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              Field Rep: {currentUser.name}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Personal Performance & Daily Action Center
          </h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Strictly isolated to your {myLeads.length} assigned leads in Western Region & Industrial Machinery. Follow up promptly to hit your monthly target.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/leads"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Leads ({myLeads.length})</span>
          </Link>
          <Link
            href="/quotations"
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-colors"
          >
            <span>My Quotes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Target Attainment Card */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-foreground">Monthly Sales Target Progress</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {targetPct}% Attained
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${targetPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Achieved: <span className="font-bold text-foreground">{formatCurrency(myRevenue)}</span></span>
          <span>Target: <span className="font-bold text-foreground">{formatCurrency(personalTarget)}</span></span>
          <span>Gap: <span className="font-bold text-amber-500">{formatCurrency(Math.max(0, personalTarget - myRevenue))}</span></span>
        </div>
      </div>

      {/* 4 Personal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Assigned Inquiries</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{myLeads.length} Leads</div>
            <div className="text-[11px] text-muted-foreground">
              {myLeads.filter((l) => ['contact_attempted', 'contacted'].includes(l.status)).length} In Discussion
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">My Pipeline Value</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(myPipelineVal)}</div>
            <div className="text-[11px] text-muted-foreground">
              Across active inquiries
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Deals Closed (Won)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{wonLeads.length} Won Deals</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {formatCurrency(myRevenue)} Revenue
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tasks Due Today</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{pendingTasks.length} Pending</div>
            <div className="text-[11px] text-rose-500 font-medium">
              {overdueTasks.length} Overdue SLA calls
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Attention: Today's Follow-ups & Direct Action Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Follow-ups List */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>My Follow-ups & Scheduled Customer Calls</span>
              </h3>
              <p className="text-xs text-muted-foreground">Complete calls on time to maintain lead engagement score.</p>
            </div>
            <Link href="/follow-ups" className="text-xs text-emerald-600 hover:underline font-semibold">
              View All Tasks →
            </Link>
          </div>

          <div className="space-y-3">
            {pendingTasks.slice(0, 5).map((task) => {
              const matchedLead = myLeads.find((l) => l.id === (task.relatedLeadId || task.leadId));
              const isOverdue = task.status === 'overdue';

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                    isOverdue
                      ? 'bg-rose-500/5 border-rose-500/30'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-xs">{task.taskTitle || task.title}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                        }`}
                      >
                        {isOverdue ? 'OVERDUE' : 'PENDING'}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                      <span>Client: <span className="text-foreground font-medium">{matchedLead?.customerName || 'Customer'}</span></span>
                      <span>Company: <span className="text-foreground font-medium">{matchedLead?.companyName || 'B2B Client'}</span></span>
                      <span>Due: <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatDate(task.dueDate)}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {matchedLead && (
                      <a
                        href={`https://wa.me/${matchedLead.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${matchedLead.customerName}, following up from Apex Engineering regarding your ${matchedLead.productService || matchedLead.requirement} enquiry.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        updateTask(task.id, { status: 'completed' });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium text-[11px] flex items-center gap-1.5 border border-border transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Executive Quick Actions */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Quick Action Shortcuts</h3>
            <p className="text-xs text-muted-foreground">Log communications or create commercial documents.</p>

            <div className="mt-4 space-y-2">
              <Link
                href="/leads"
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-500" />
                  <span>Open Lead Dialer & WhatsApp Log</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/quotations"
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span>Generate New Commercial Quote</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/calendar"
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Schedule Customer Demo / Site Visit</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
            Field Rep Tip: Use the WhatsApp B2B templates in the Leads module to send quotation updates and brochure PDFs in 1-click.
          </div>
        </div>
      </div>
    </div>
  );
}

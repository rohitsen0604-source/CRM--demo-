'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Filter,
  Users,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Clock,
  Zap,
  Building2,
  Award,
  ChevronRight,
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
import { toast } from 'sonner';

type ReportTab =
  | 'source'
  | 'indiamart'
  | 'justdial'
  | 'employee'
  | 'conversion'
  | 'pipeline'
  | 'lost'
  | 'followup'
  | 'ageing'
  | 'revenue'
  | 'quotation'
  | 'acquisition';

function ReportsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const {
    scopedLeads: leads,
    scopedOrders: orders,
    scopedQuotations: quotations,
    scopedTasks: tasks,
    scopedEmployees: employees,
    scopedCustomers: customers,
    normalizedRole
  } = useCRM();

  const getInitialReport = (): ReportTab => {
    if (tabParam === 'sources') return 'source';
    if (tabParam === 'revenue') return 'revenue';
    if (tabParam === 'team') return 'employee';
    return 'source';
  };

  const [activeReport, setActiveReport] = useState<ReportTab>(getInitialReport());

  useEffect(() => {
    if (tabParam === 'sources') setActiveReport('source');
    else if (tabParam === 'revenue') setActiveReport('revenue');
    else if (tabParam === 'team') setActiveReport('employee');
  }, [tabParam]);
  const [selectedRep, setSelectedRep] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  // Filtered dataset
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (selectedRep !== 'all' && l.assignedTo !== selectedRep) return false;
      if (selectedProduct !== 'all' && l.productService !== selectedProduct) return false;
      return true;
    });
  }, [leads, selectedRep, selectedProduct]);

  // Export CSV for active report
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (activeReport === 'source') {
      headers = ['Lead Source', 'Total Leads', 'Won Deals', 'Conversion Rate %', 'Total Revenue Won (INR)'];
      const sources = ['indiamart', 'justdial'];
      rows = sources.map((src) => {
        const srcLeads = leads.filter((l) => l.source === src);
        const won = srcLeads.filter((l) => l.status === 'won').length;
        const rate = srcLeads.length > 0 ? ((won / srcLeads.length) * 100).toFixed(1) : '0';
        const wonOrders = orders.filter((o) => {
          const lead = leads.find((l) => l.id === o.relatedLeadId);
          return lead?.source === src;
        });
        const rev = wonOrders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
        return [src.toUpperCase(), srcLeads.length, won, `${rate}%`, rev];
      });
    } else {
      headers = ['Lead ID', 'Customer Name', 'Company', 'Product', 'Source', 'Status', 'Estimated Value (INR)'];
      rows = filteredLeads.map((l) => [
        `"${l.leadNumber}"`,
        `"${l.customerName}"`,
        `"${l.companyName}"`,
        `"${l.productService}"`,
        `"${l.source}"`,
        `"${l.status}"`,
        l.estimatedValue,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeadFlow_Report_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${activeReport.toUpperCase()} report to CSV`);
  };

  // 1. Source Performance Data
  const sourcePerformanceData = useMemo(() => {
    const sources = ['indiamart', 'justdial'];
    return sources.map((src) => {
      const srcLeads = filteredLeads.filter((l) => l.source === src);
      const won = srcLeads.filter((l) => l.status === 'won').length;
      return {
        name: src === 'indiamart' ? 'IndiaMART' : src === 'justdial' ? 'Justdial' : src.charAt(0).toUpperCase() + src.slice(1),
        leads: srcLeads.length,
        won,
        rate: srcLeads.length > 0 ? parseFloat(((won / srcLeads.length) * 100).toFixed(1)) : 0,
      };
    });
  }, [filteredLeads]);

  // 2. IndiaMART Specific Data
  const indiamartLeads = filteredLeads.filter((l) => l.source === 'indiamart');
  const indiamartWon = indiamartLeads.filter((l) => l.status === 'won').length;

  // 3. Justdial Specific Data
  const justdialLeads = filteredLeads.filter((l) => l.source === 'justdial');
  const justdialWon = justdialLeads.filter((l) => l.status === 'won').length;

  // 7. Lost Leads Analysis
  const lostLeads = filteredLeads.filter((l) => l.status === 'lost' || l.status === 'disqualified');
  const lostReasonsData = useMemo(() => {
    const counts: Record<string, number> = {};
    lostLeads.forEach((l) => {
      const reason = l.lostReason ? l.lostReason.slice(0, 30) + '...' : 'General competitor pricing';
      counts[reason] = (counts[reason] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [lostLeads]);

  // 8. Follow-up Performance Data
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;

  // 9. Lead Ageing (Days since creation)
  const ageingData = useMemo(() => {
    const now = new Date().getTime();
    let d0_7 = 0;
    let d8_15 = 0;
    let d16_30 = 0;
    let d30_plus = 0;

    filteredLeads.forEach((l) => {
      const age = (now - new Date(l.createdAt).getTime()) / 86400000;
      if (age <= 7) d0_7++;
      else if (age <= 15) d8_15++;
      else if (age <= 30) d16_30++;
      else d30_plus++;
    });

    return [
      { range: '0 - 7 Days (Fresh)', count: d0_7 },
      { range: '8 - 15 Days (Active)', count: d8_15 },
      { range: '16 - 30 Days (Mature)', count: d16_30 },
      { range: '30+ Days (Stale)', count: d30_plus },
    ];
  }, [filteredLeads]);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Enterprise Reports & Intelligence
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              12 Deep Analytics Modules
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit channel ROI, rep performance, deal loss reasons, pipeline velocity, and customer acquisition
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 12 Report Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border text-xs">
        {[
          { id: 'source', label: '1. Lead Source' },
          { id: 'indiamart', label: '2. IndiaMART' },
          { id: 'justdial', label: '3. Justdial' },
          { id: 'employee', label: '4. Executive Perf.' },
          { id: 'conversion', label: '5. Lead Conversion' },
          { id: 'pipeline', label: '6. Sales Pipeline' },
          { id: 'lost', label: '7. Lost Leads' },
          { id: 'followup', label: '8. Follow-up SLA' },
          { id: 'ageing', label: '9. Lead Ageing' },
          { id: 'revenue', label: '10. Revenue Trends' },
          { id: 'quotation', label: '11. Quotation Stats' },
          { id: 'acquisition', label: '12. Customer Acq.' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as ReportTab)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${activeReport === tab.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT CONTENT AREA */}
      <div className="space-y-6">
        {/* REPORT 1: LEAD SOURCE PERFORMANCE */}
        {activeReport === 'source' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-foreground">Lead Volume by Acquisition Channel</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourcePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" fontSize={11} stroke="#888888" />
                      <YAxis fontSize={11} stroke="#888888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="leads" name="Leads Captured" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="won" name="Won Deals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-foreground">Conversion Rate % by Channel</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourcePerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis type="number" fontSize={11} stroke="#888888" unit="%" />
                      <YAxis dataKey="name" type="category" fontSize={11} stroke="#888888" width={80} />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Conversion Rate']}
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Source Data Table */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="py-3 px-4">Channel Name</th>
                    <th className="py-3 px-4 text-center">Total Inquiries</th>
                    <th className="py-3 px-4 text-center">Won Orders</th>
                    <th className="py-3 px-4 text-right">Conversion Rate</th>
                    <th className="py-3 px-4 text-right">Channel Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {sourcePerformanceData.map((row) => (
                    <tr key={row.name} className="hover:bg-muted/40">
                      <td className="py-3 px-4 font-bold text-foreground">{row.name}</td>
                      <td className="py-3 px-4 text-center font-semibold">{row.leads}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">{row.won}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">{row.rate}%</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${row.rate >= 20
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {row.rate >= 20 ? 'High Intent' : 'Moderate'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: INDIAMART PERFORMANCE */}
        {activeReport === 'indiamart' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  IndiaMART Inquiries
                </span>
                <div className="text-2xl font-bold text-emerald-600">{indiamartLeads.length}</div>
                <span className="text-[10px] text-muted-foreground">Direct webhook ingestion</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Deals Closed (Won)
                </span>
                <div className="text-2xl font-bold text-emerald-600">{indiamartWon}</div>
                <span className="text-[10px] text-muted-foreground">High industrial pump conversion</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Conversion %
                </span>
                <div className="text-2xl font-bold text-foreground">
                  {indiamartLeads.length > 0
                    ? `${((indiamartWon / indiamartLeads.length) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">Exceeds B2B average</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                IndiaMART Recent Captured Enquiries
              </h4>
              <div className="divide-y divide-border/60">
                {indiamartLeads.slice(0, 6).map((l) => (
                  <div key={l.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground">{l.customerName}</span> ({l.companyName})
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {l.sourceEnquiryId} • {l.productService} • {l.city}
                      </div>
                    </div>
                    <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-muted">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REPORT 3: JUSTDIAL PERFORMANCE */}
        {activeReport === 'justdial' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Justdial Inquiries
                </span>
                <div className="text-2xl font-bold text-amber-600">{justdialLeads.length}</div>
                <span className="text-[10px] text-muted-foreground">Lead Express listener</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Deals Closed (Won)
                </span>
                <div className="text-2xl font-bold text-emerald-600">{justdialWon}</div>
                <span className="text-[10px] text-muted-foreground">Converted accounts</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Conversion %
                </span>
                <div className="text-2xl font-bold text-foreground">
                  {justdialLeads.length > 0
                    ? `${((justdialWon / justdialLeads.length) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
                <span className="text-[10px] text-muted-foreground">Regional phone leads</span>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 7: LOST LEADS ANALYSIS */}
        {activeReport === 'lost' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-foreground">Primary Reasons for Deal Loss</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Mandatory reasons recorded during Kanban stage drop:
              </p>

              <div className="divide-y divide-border/60">
                {lostLeads.map((l) => (
                  <div key={l.id} className="py-3 flex items-start justify-between text-xs gap-4">
                    <div>
                      <div className="font-bold text-foreground">{l.customerName} ({l.companyName})</div>
                      <div className="text-[11px] text-muted-foreground">{l.productService} • {formatCurrency(l.estimatedValue)}</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block p-1.5 rounded bg-rose-50 text-rose-800 text-[11px] font-semibold">
                        {l.lostReason || 'Competitor lower pricing'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REPORT 9: LEAD AGEING */}
        {activeReport === 'ageing' && (
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground">Lead Ageing Analysis</h3>
            <p className="text-xs text-muted-foreground">
              Categorizes enquiries by days elapsed since receipt to avoid lead rot
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageingData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="range" fontSize={11} stroke="#888888" />
                  <YAxis fontSize={11} stroke="#888888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Leads in Age Bracket" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Other Reports fallback to high level summary table */}
        {['employee', 'conversion', 'pipeline', 'followup', 'revenue', 'quotation', 'acquisition'].includes(activeReport) && (
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {activeReport.replace('_', ' ')} Executive Intelligence
              </h3>
              <span className="font-mono text-emerald-600 font-bold">LIVE METRIC CALCULATIONS</span>
            </div>
            <p className="text-muted-foreground">
              Displaying real-time derived state for {activeReport.toUpperCase()} across {filteredLeads.length} filtered records.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                  Total Active Deal Value
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(filteredLeads.reduce((s, l) => s + l.estimatedValue, 0))}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                  Won Conversion Ratio
                </span>
                <span className="text-lg font-bold text-emerald-600">
                  {filteredLeads.length > 0
                    ? `${((filteredLeads.filter((l) => l.status === 'won').length / filteredLeads.length) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                  Pending Actionables
                </span>
                <span className="text-lg font-bold text-amber-600">
                  {tasks.filter((t) => t.status !== 'completed').length} Tasks
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Analytics...</div>}>
      <ReportsContent />
    </Suspense>
  );
}

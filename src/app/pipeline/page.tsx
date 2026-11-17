'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { Lead, LeadStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Kanban,
  Building2,
  DollarSign,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MoveRight,
  X,
  Phone,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface StageConfig {
  id: LeadStatus;
  label: string;
  color: string;
  dotColor: string;
}

const PIPELINE_STAGES: StageConfig[] = [
  { id: 'new', label: '1. New', color: 'border-emerald-500/40 bg-emerald-500/5', dotColor: 'bg-emerald-500' },
  { id: 'assigned', label: '2. Assigned', color: 'border-blue-500/40 bg-blue-500/5', dotColor: 'bg-blue-500' },
  { id: 'contact_attempted', label: '3. Contact Attempted', color: 'border-amber-500/40 bg-amber-500/5', dotColor: 'bg-amber-500' },
  { id: 'contacted', label: '4. Contacted', color: 'border-cyan-500/40 bg-cyan-500/5', dotColor: 'bg-cyan-500' },
  { id: 'qualified', label: '5. Qualified', color: 'border-teal-500/40 bg-teal-500/5', dotColor: 'bg-teal-500' },
  { id: 'quotation_sent', label: '6. Quotation Sent', color: 'border-indigo-500/40 bg-indigo-500/5', dotColor: 'bg-indigo-500' },
  { id: 'negotiation', label: '7. Negotiation', color: 'border-purple-500/40 bg-purple-500/5', dotColor: 'bg-purple-500' },
  { id: 'won', label: '8. Won (Converted)', color: 'border-emerald-600/60 bg-emerald-600/10', dotColor: 'bg-emerald-600' },
  { id: 'lost', label: '9. Lost', color: 'border-rose-500/40 bg-rose-500/5', dotColor: 'bg-rose-500' },
  { id: 'nurture', label: '10. Nurture / Hold', color: 'border-stone-500/40 bg-stone-500/5', dotColor: 'bg-stone-500' },
  { id: 'disqualified', label: '11. Disqualified', color: 'border-neutral-500/40 bg-neutral-500/5', dotColor: 'bg-neutral-500' },
];

export default function PipelinePage() {
  const { 
    scopedLeads: leads, 
    scopedEmployees: employees, 
    normalizedRole,
    can,
    updateLead, 
    convertLeadToCustomerAndOrder 
  } = useCRM();

  const [selectedRep, setSelectedRep] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Lost Reason Modal State
  const [lostModalLead, setLostModalLead] = useState<Lead | null>(null);
  const [lostReasonInput, setLostReasonInput] = useState('');

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (selectedRep !== 'all' && l.assignedTo !== selectedRep) return false;
      if (selectedSource !== 'all' && l.source !== selectedSource) return false;
      return true;
    });
  }, [leads, selectedRep, selectedSource]);

  // Aggregate stats
  const activePipelineValue = useMemo(() => {
    return filteredLeads
      .filter((l) => !['won', 'lost', 'disqualified'].includes(l.status))
      .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  }, [filteredLeads]);

  const wonDealsValue = useMemo(() => {
    return filteredLeads
      .filter((l) => l.status === 'won')
      .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  }, [filteredLeads]);

  // Handle stage change
  const moveLeadToStage = (leadId: string, newStage: LeadStatus, reason?: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    if (newStage === 'lost' && !reason) {
      setLostModalLead(lead);
      return;
    }

    if (newStage === 'won' && lead.status !== 'won') {
      convertLeadToCustomerAndOrder(leadId);
      return;
    }

    updateLead(leadId, {
      status: newStage,
      lostReason: reason || lead.lostReason,
    });
    toast.success(`Moved ${lead.customerName} to ${newStage.toUpperCase()}`);
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      moveLeadToStage(leadId, stageId);
    }
    setDraggedLeadId(null);
  };

  const submitLostReason = () => {
    if (!lostModalLead || !lostReasonInput) {
      toast.error('Please specify the reason for losing this lead');
      return;
    }
    updateLead(lostModalLead.id, {
      status: 'lost',
      lostReason: lostReasonInput,
    });
    toast.info(`Marked lead ${lostModalLead.leadNumber} as Lost`);
    setLostModalLead(null);
    setLostReasonInput('');
  };

  return (
    <AppShell>
      {/* Top Header & Metrics Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Sales Pipeline Kanban
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              11 Continuous Stages
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag and drop deals across stages with automatic activity tracking and validation rules
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border text-xs">
            <span className="text-muted-foreground px-2">Rep:</span>
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="bg-transparent font-semibold text-foreground focus:outline-none"
            >
              <option value="all">All Sales Executives</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border text-xs">
            <span className="text-muted-foreground px-2">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-transparent font-semibold text-foreground focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="indiamart">IndiaMART</option>
              <option value="justdial">Justdial</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-card border border-border">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Active Pipeline Value
          </span>
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(activePipelineValue)}
          </div>
          <span className="text-[10px] text-muted-foreground">In negotiation / qualified</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Total Revenue Won
          </span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(wonDealsValue)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Deals finalized</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Deals in Negotiation
          </span>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {filteredLeads.filter((l) => l.status === 'negotiation' || l.status === 'quotation_sent').length}
          </div>
          <span className="text-[10px] text-muted-foreground">Closing probability: 70%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Conversion Rate
          </span>
          <div className="text-lg font-bold text-emerald-600">
            {filteredLeads.length > 0
              ? `${((filteredLeads.filter((l) => l.status === 'won').length / filteredLeads.length) * 100).toFixed(1)}%`
              : '0%'}
          </div>
          <span className="text-[10px] text-muted-foreground">Overall ratio</span>
        </div>
      </div>

      {/* HORIZONTAL SCROLLABLE KANBAN BOARD */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[2800px] items-start">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
            const stageValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`w-[260px] shrink-0 rounded-2xl border ${stage.color} bg-card/60 p-3 flex flex-col max-h-[75vh]`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                    <span className="font-bold text-xs text-foreground truncate">{stage.label}</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Subtotal of stage value */}
                <div className="text-[11px] text-muted-foreground font-medium pb-2">
                  Total: <strong className="text-foreground">{formatCurrency(stageValue)}</strong>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[150px]">
                  {stageLeads.length === 0 ? (
                    <div className="h-28 border border-dashed border-border/80 rounded-xl flex items-center justify-center text-[11px] text-muted-foreground/60 italic">
                      Drag lead here
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable={normalizedRole !== 'read_only'}
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className={`p-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all space-y-2 group ${
                          normalizedRole === 'read_only' ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        {/* Header: Lead ID & Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            {lead.leadNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              lead.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-extrabold'
                                : lead.priority === 'high'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {lead.priority}
                          </span>
                        </div>

                        {/* Customer & Company */}
                        <div>
                          <div className="font-bold text-xs text-foreground leading-tight">
                            {lead.customerName}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {lead.companyName} • {lead.city}
                          </div>
                        </div>

                        {/* Product / Requirement */}
                        <div className="text-[11px] text-foreground bg-muted/30 p-1.5 rounded-lg truncate">
                          {lead.productService}
                        </div>

                        {/* Deal Value & Assigned Rep */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                          <span className="font-bold text-foreground">
                            {formatCurrency(lead.estimatedValue)}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[90px]">
                            {lead.assignedEmployeeName.split(' ')[0]}
                          </span>
                        </div>

                        {/* Next Follow-up & Source */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                          <span className="uppercase font-semibold text-emerald-600">
                            {lead.source}
                          </span>
                          {lead.nextFollowUp && (
                            <span className="flex items-center gap-0.5 text-amber-600">
                              <Clock className="w-2.5 h-2.5" />
                              {formatDate(lead.nextFollowUp)}
                            </span>
                          )}
                        </div>

                        {/* Quick Move Stage Selector on Hover - hidden for read only */}
                        {normalizedRole !== 'read_only' && (
                          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground font-semibold">Move:</span>
                            <select
                              value={lead.status}
                              onChange={(e) => moveLeadToStage(lead.id, e.target.value as LeadStatus)}
                              className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-semibold text-foreground focus:outline-none cursor-pointer"
                            >
                              {PIPELINE_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REQUIRED LOST REASON MODAL */}
      {lostModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Specify Lost Reason (Mandatory)</span>
              </div>
              <button
                onClick={() => setLostModalLead(null)}
                className="p-1 rounded text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              To move <strong>{lostModalLead.customerName}</strong> ({lostModalLead.companyName}) to
              Lost stage, enterprise governance requires recording the reason for sales analytics.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">Select or Type Lost Reason</label>
              <select
                onChange={(e) => setLostReasonInput(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-xs"
              >
                <option value="">Select typical reason...</option>
                <option value="Competitor offered lower rate (price sensitivity)">
                  Competitor offered lower rate (price sensitivity)
                </option>
                <option value="Delivery lead time too long for client project">
                  Delivery lead time too long for client project
                </option>
                <option value="Client project deferred to next financial quarter">
                  Client project deferred to next financial quarter
                </option>
                <option value="Product specification mismatch (Looking for 2nd hand / customized)">
                  Product specification mismatch (Looking for 2nd hand / customized)
                </option>
                <option value="Customer unreachable after 5+ contact attempts">
                  Customer unreachable after 5+ contact attempts
                </option>
                <option value="Budget cancelled by top management">
                  Budget cancelled by top management
                </option>
              </select>

              <textarea
                rows={2}
                value={lostReasonInput}
                onChange={(e) => setLostReasonInput(e.target.value)}
                placeholder="Or type specific reason details..."
                className="w-full p-2.5 rounded-lg border border-border bg-background text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLostModalLead(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitLostReason}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Move to Lost
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

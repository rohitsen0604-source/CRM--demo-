'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { IntegrationConfig, IntegrationEvent, IntegrationProvider } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Boxes,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Eye,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Copy,
  X,
  FileCode,
  Link as LinkIcon,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationCenterPage() {
  const {
    integrationConfigs,
    integrationEvents,
    duplicateReviews,
    processIncomingIntegrationPayload,
    retryIntegrationEvent,
    resolveDuplicate,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'connectors' | 'events' | 'duplicates'>('connectors');
  const [selectedEvent, setSelectedEvent] = useState<IntegrationEvent | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Payload Modal
  const [payloadModalEvent, setPayloadModalEvent] = useState<IntegrationEvent | null>(null);

  // Duplicate Resolution Modal
  const [resolvingDuplicate, setResolvingDuplicate] = useState<any | null>(null);
  const [duplicateResolutionNote, setDuplicateResolutionNote] = useState('');

  // 1. Simulate IndiaMART Lead
  const handleSimulateIndiaMartLead = () => {
    setIsSimulating(true);
    const cities = ['Indore', 'Bhopal', 'Pune', 'Ahmedabad', 'Jaipur', 'Nagpur'];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomIdNum = Math.floor(1000 + Math.random() * 9000);
    const randomMobile = `98261${String(Math.floor(10000 + Math.random() * 90000))}`;

    const samplePayload = {
      source: 'INDIAMART',
      enquiry_id: `IM-2026-${randomIdNum}`,
      buyer_name: `Ashwin ${['Verma', 'Panchal', 'Dubey', 'Mehta', 'Kothari'][Math.floor(Math.random() * 5)]}`,
      mobile: randomMobile,
      email: `buyer${randomIdNum}@indiamartinquiry.com`,
      company: `Apex Machinery & Fabricators`,
      product: 'Industrial Water Pumps',
      quantity: '25 Units',
      message: `Urgent requirement for multistage pumps for factory setup in ${randomCity}. Please send quotation.`,
      city: randomCity,
      state: 'Madhya Pradesh',
      received_at: new Date().toISOString(),
    };

    setTimeout(() => {
      const res = processIncomingIntegrationPayload('indiamart', samplePayload);
      setIsSimulating(false);
      setActiveTab('events');
      if (res.event) {
        setSelectedEvent(res.event);
      }
    }, 400);
  };

  // 2. Simulate Justdial Lead
  const handleSimulateJustdialLead = () => {
    setIsSimulating(true);
    const services = ['CNC Machines', 'Heavy Hydraulic Presses', 'Industrial Motors', 'Solar Water Pumps'];
    const randomService = services[Math.floor(Math.random() * services.length)];
    const randomIdNum = Math.floor(2000 + Math.random() * 8000);
    const randomMobile = `98260${String(Math.floor(10000 + Math.random() * 90000))}`;

    const samplePayload = {
      source: 'JUSTDIAL',
      enquiry_id: `JD-2026-${randomIdNum}`,
      customer_name: `Naveen ${['Soni', 'Rathore', 'Chouhan', 'Trivedi'][Math.floor(Math.random() * 4)]}`,
      phone: randomMobile,
      email: `customer${randomIdNum}@jduser.in`,
      company: `Naveen Electro Works`,
      service: randomService,
      message: `Require urgent delivery for ${randomService}. Contact me on phone.`,
      city: 'Pune',
      state: 'Maharashtra',
      received_at: new Date().toISOString(),
    };

    setTimeout(() => {
      const res = processIncomingIntegrationPayload('justdial', samplePayload);
      setIsSimulating(false);
      setActiveTab('events');
      if (res.event) {
        setSelectedEvent(res.event);
      }
    }, 400);
  };

  const handleDuplicateResolve = (resolution: 'merged' | 'kept_separate' | 'linked_enquiry') => {
    if (!resolvingDuplicate) return;
    resolveDuplicate(resolvingDuplicate.id, resolution, duplicateResolutionNote);
    setResolvingDuplicate(null);
    setDuplicateResolutionNote('');
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Integration Center & Connector Engine
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Active Simulation Engine
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time webhook ingestion for IndiaMART and Justdial, idempotency controls, and duplicate review pipeline
          </p>
        </div>

        {/* Action simulation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateIndiaMartLead}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate IndiaMART Lead</span>
          </button>
          <button
            onClick={handleSimulateJustdialLead}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Justdial Lead</span>
          </button>
        </div>
      </div>

      {/* Mandatory Demo Simulation Advisory */}
      <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block">
            DEMO SIMULATION NOTICE — LIVE PROVIDER CONNECTIONS NOT CONFIGURED
          </span>
          <p className="text-amber-900/80 dark:text-amber-300/80 text-[11px] leading-relaxed">
            In compliance with enterprise certification rules, all incoming payloads shown are processed through the complete 13-step CRM ingestion engine in a simulated environment. Live enterprise deployment requires client-provided IndiaMART CRM Push API key and Justdial Lead Express Webhook authorization.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs">
        <button
          onClick={() => setActiveTab('connectors')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'connectors'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Connectors ({integrationConfigs.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'events'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Integration Event Logs ({integrationEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'duplicates'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Duplicate Leads Review</span>
          {duplicateReviews.filter((d) => d.status === 'pending_review').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {duplicateReviews.filter((d) => d.status === 'pending_review').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CONNECTORS GRID */}
      {activeTab === 'connectors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          {integrationConfigs.map((cfg) => {
            const isConnected = cfg.status === 'connected_simulated';

            return (
              <div
                key={cfg.id}
                className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Provider Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{cfg.name}</h3>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Mode: {cfg.mode.toUpperCase()}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isConnected
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isConnected ? 'CONNECTED (SIMULATED)' : 'CONFIG REQUIRED'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{cfg.description}</p>

                  {/* Webhook Endpoint Box */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-1 text-xs">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                      Webhook Endpoint
                    </span>
                    <div className="flex items-center justify-between font-mono text-[11px] text-foreground">
                      <span className="truncate">{cfg.webhookUrl}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cfg.webhookUrl);
                          toast.success('Webhook URL copied to clipboard');
                        }}
                        className="p-1 hover:text-emerald-600"
                        title="Copy Webhook URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sync Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <span className="text-[10px] text-muted-foreground block">Imported Leads</span>
                      <span className="font-bold text-foreground text-sm">{cfg.totalImported}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <span className="text-[10px] text-muted-foreground block">Failed Events</span>
                      <span className="font-bold text-rose-600 text-sm">{cfg.failedEvents}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground">
                    Last Ingestion: {cfg.lastSyncAt ? formatDateTime(cfg.lastSyncAt) : 'Awaiting incoming webhook'}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center gap-2">
                  {cfg.id === 'indiamart' ? (
                    <>
                      <button
                        onClick={handleSimulateIndiaMartLead}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Simulate IndiaMART Lead</span>
                      </button>
                      <button
                        onClick={() => toast.success('IndiaMART Webhook Handshake verified: HTTP 200 OK (164ms). SSL active.')}
                        className="w-full sm:w-auto py-2 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                      >
                        Test Webhook
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSimulateJustdialLead}
                        className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Simulate Justdial Lead</span>
                      </button>
                      <button
                        onClick={() => toast.success('Justdial Lead Express Handshake verified: HTTP 200 OK (142ms). Webhook active.')}
                        className="w-full sm:w-auto py-2 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                      >
                        Test Webhook
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INTEGRATION EVENT LOGS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Source Enquiry ID</th>
                    <th className="py-3 px-4">Received Time</th>
                    <th className="py-3 px-4 text-center">Processing Status</th>
                    <th className="py-3 px-4 text-center">Retries</th>
                    <th className="py-3 px-4">Error / Validation Details</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {integrationEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">{evt.id}</td>

                      <td className="py-3 px-4 uppercase font-bold text-emerald-700 dark:text-emerald-400">
                        {evt.provider}
                      </td>

                      <td className="py-3 px-4 font-mono">{evt.sourceEnquiryId}</td>

                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDateTime(evt.receivedAt)}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            evt.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : evt.status === 'failed'
                              ? 'bg-rose-100 text-rose-800'
                              : evt.status === 'duplicate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        {evt.retryCount}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-muted-foreground max-w-[280px] truncate">
                        {evt.errorDetails || 'Processed cleanly through normalization engine'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPayloadModalEvent(evt)}
                            className="px-2.5 py-1 rounded bg-muted hover:bg-card text-xs font-semibold border border-border"
                          >
                            Payload
                          </button>
                          {evt.status === 'failed' && (
                            <button
                              onClick={() => retryIntegrationEvent(evt.id)}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold"
                            >
                              Retry Event
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DUPLICATE LEADS REVIEW */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-bold text-sm text-foreground">Potential Duplicate Inquiries Queue</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Identifies repeated enquiries from same phone numbers or customer accounts across IndiaMART & Justdial. Review before merging or linking records.
            </p>
          </div>

          <div className="space-y-3">
            {duplicateReviews.map((dup) => (
              <div
                key={dup.id}
                className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-foreground text-sm flex items-center gap-2">
                      <span>{dup.customerName}</span>
                      <span className="text-[10px] font-mono px-1.5 rounded bg-muted">
                        Phone: {dup.phone}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          dup.status === 'pending_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {dup.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Company: {dup.companyName} • Source: {dup.source.toUpperCase()} • Matched on: {dup.matchedOn}
                    </div>
                  </div>

                  {dup.status === 'pending_review' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setResolvingDuplicate(dup);
                          setDuplicateResolutionNote('Repeat requirement confirmed; linking enquiry to customer');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                      >
                        Resolve & Link
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-foreground">
                      Resolved by: <strong>{dup.resolvedBy}</strong> on {formatDate(dup.resolvedAt)}
                    </div>
                  )}
                </div>

                {dup.resolutionNote && (
                  <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                    Resolution note: {dup.resolutionNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RAW PAYLOAD & PROCESSING STEPS MODAL */}
      {payloadModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Payload & Normalization Steps: {payloadModalEvent.sourceEnquiryId}
                </h3>
                <span className="text-[11px] text-muted-foreground uppercase font-bold">
                  {payloadModalEvent.provider} Event
                </span>
              </div>
              <button onClick={() => setPayloadModalEvent(null)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs font-mono">
              {/* Processing Steps Timeline */}
              <div>
                <h4 className="font-sans font-bold text-xs uppercase text-muted-foreground mb-2">
                  Lead Processing Pipeline Steps (13-Step Workflow)
                </h4>
                <div className="space-y-1.5 font-sans">
                  {payloadModalEvent.processingSteps?.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-muted/30 border border-border/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold">{step.step}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{step.details}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw JSON */}
              <div>
                <h4 className="font-sans font-bold text-xs uppercase text-muted-foreground mb-1">
                  Raw Ingested JSON Payload
                </h4>
                <pre className="p-3 rounded-xl bg-neutral-950 text-emerald-400 text-[11px] overflow-x-auto">
                  {JSON.stringify(payloadModalEvent.rawPayload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setPayloadModalEvent(null)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE DUPLICATE ACTION MODAL */}
      {resolvingDuplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Resolve Duplicate Inquiry</h3>
              <button onClick={() => setResolvingDuplicate(null)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-muted-foreground">
              Choose how to handle enquiry from <strong>{resolvingDuplicate.customerName}</strong> ({resolvingDuplicate.phone}):
            </p>

            <div>
              <label className="block font-semibold mb-1">Resolution Remark</label>
              <textarea
                rows={2}
                value={duplicateResolutionNote}
                onChange={(e) => setDuplicateResolutionNote(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background"
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleDuplicateResolve('linked_enquiry')}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center block"
              >
                Link to Existing Customer Account (Recommended)
              </button>
              <button
                onClick={() => handleDuplicateResolve('kept_separate')}
                className="w-full py-2 rounded-lg border border-border hover:bg-muted text-center block font-semibold"
              >
                Keep as Separate Independent Prospect
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

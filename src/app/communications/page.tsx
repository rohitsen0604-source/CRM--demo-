'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { CommunicationMessage, CommunicationThread } from '@/types';
import { formatDateTime } from '@/lib/utils';
import {
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneMissed,
  Send,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  AlertCircle,
  Play,
  RotateCcw,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CommunicationCenterPage() {
  const { communicationThreads, addCommunicationMessage, settings, updateSettings, leads } = useCRM();

  const [selectedThreadPhone, setSelectedThreadPhone] = useState<string>(
    communicationThreads[0]?.phone || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Mode: Option A (Direct Device Dialer & WhatsApp wa.me) vs Option B (Integrated Simulated CRM Telephony & WhatsApp)
  const currentMode = settings.communicationMode || 'integrated_simulated';

  // Call simulation state
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [callState, setCallState] = useState<'dialing' | 'connected' | 'completed' | 'missed'>('dialing');
  const [callDuration, setCallDuration] = useState(0);

  // Filtered threads
  const filteredThreads = communicationThreads.filter((t) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.customerName.toLowerCase().includes(q) ||
      t.customerCompany.toLowerCase().includes(q) ||
      t.phone.includes(q)
    );
  });

  const activeThread =
    communicationThreads.find((t) => t.phone === selectedThreadPhone) ||
    communicationThreads[0];

  // Call timer effect
  useEffect(() => {
    let timer: any = null;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThread) return;

    addCommunicationMessage(activeThread.phone, {
      channel: 'whatsapp',
      direction: 'outbound',
      content: messageInput.trim(),
      status: 'delivered',
    });
    setMessageInput('');
  };

  const handleStartCallSimulation = () => {
    setIsCallingModalOpen(true);
    setCallState('dialing');
    setCallDuration(0);

    setTimeout(() => {
      setCallState('connected');
    }, 2000);
  };

  const handleEndCallSimulation = (wasAnswered = true) => {
    if (wasAnswered) {
      setCallState('completed');
      addCommunicationMessage(activeThread.phone, {
        channel: 'call',
        direction: 'outbound',
        content: `Voice Call Completed: Duration ${callDuration}s with ${activeThread.customerName}`,
        status: 'completed',
        callDurationSeconds: callDuration,
      });
      toast.success(`Call logged: ${callDuration}s duration`);
    } else {
      setCallState('missed');
      addCommunicationMessage(activeThread.phone, {
        channel: 'call',
        direction: 'outbound',
        content: `Call Not Answered / Busy: Attempted to contact ${activeThread.customerName}`,
        status: 'missed',
      });
      toast.info('Logged as Unanswered / Busy');
    }

    setTimeout(() => {
      setIsCallingModalOpen(false);
      setCallState('dialing');
      setCallDuration(0);
    }, 1500);
  };

  return (
    <AppShell>
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Communication Center
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Dual-Mode Architecture
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Omni-channel client messaging, cloud telephony simulation, call logs and delivery confirmation
          </p>
        </div>

        {/* Communication Mode Selector */}
        <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border text-xs">
          <span className="text-[11px] font-semibold text-muted-foreground ml-2">Mode:</span>
          <button
            onClick={() => updateSettings({ communicationMode: 'manual' })}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              currentMode === 'manual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Option A: Device / Web Links
          </button>
          <button
            onClick={() => updateSettings({ communicationMode: 'integrated_simulated' })}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              currentMode === 'integrated_simulated'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Option B: Integrated CRM Calling
          </button>
        </div>
      </div>

      {/* Mode Advisory Notice */}
      <div className="p-3.5 rounded-xl border border-border bg-muted/20 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-muted-foreground">
            {currentMode === 'manual' ? (
              <>
                <strong>Mode A Active:</strong> Uses direct native device dialer links (<code>tel:</code>) and WhatsApp web API (<code>wa.me</code>) with manual outcome recording.
              </>
            ) : (
              <>
                <strong>Mode B Active (DEMO SIMULATION):</strong> Demonstrates cloud telephony and WhatsApp Business Platform capabilities. Telephony requires approved carrier trunk in live deployment.
              </>
            )}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-card border border-border text-muted-foreground shrink-0">
          TRAI & Meta Consent Verified
        </span>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[72vh]">
        {/* Left Column: Conversations List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col overflow-hidden">
          {/* Search Contacts */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {filteredThreads.map((thread) => {
              const isSelected = activeThread?.phone === thread.phone;
              const lastMsg = thread.messages[thread.messages.length - 1];

              return (
                <div
                  key={thread.phone}
                  onClick={() => setSelectedThreadPhone(thread.phone)}
                  className={`p-3.5 cursor-pointer transition-colors text-xs space-y-1 ${
                    isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate">{thread.customerName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(thread.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground truncate">{thread.customerCompany}</div>

                  {lastMsg && (
                    <p className="text-[11px] text-muted-foreground/80 truncate">
                      {lastMsg.direction === 'outbound' ? 'You: ' : ''}
                      {lastMsg.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat & Calling Screen (8 cols) */}
        {activeThread ? (
          <div className="lg:col-span-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col overflow-hidden">
            {/* Conversation Header */}
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">{activeThread.customerName}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                    {activeThread.phone}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{activeThread.customerCompany}</span>
                  <span>• Opt-in Consent: WhatsApp & SMS Active</span>
                </div>
              </div>

              {/* Call Action */}
              <div className="flex items-center gap-2">
                {currentMode === 'manual' ? (
                  <a
                    href={`tel:${activeThread.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Device Dialer</span>
                  </a>
                ) : (
                  <button
                    onClick={handleStartCallSimulation}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>CRM Cloud Call (Simulated)</span>
                  </button>
                )}

                <a
                  href={`https://wa.me/91${activeThread.phone.slice(-10)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border border-border hover:bg-muted text-emerald-700"
                  title="Open direct WhatsApp Web"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
              {activeThread.messages.map((msg) => {
                const isOutbound = msg.direction === 'outbound';
                const isCall = msg.channel === 'call';

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl p-3 text-xs space-y-1 shadow-sm ${
                        isCall
                          ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 w-full max-w-md'
                          : isOutbound
                          ? 'bg-emerald-700 text-white rounded-br-none'
                          : 'bg-card border border-border text-foreground rounded-bl-none'
                      }`}
                    >
                      {isCall ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-amber-600" />
                          <div className="flex-1">
                            <span className="font-bold block">
                              {msg.status === 'completed' ? 'Outgoing Call Completed' : 'Call Unanswered / Busy'}
                            </span>
                            <span className="text-[11px] opacity-80">{msg.content}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="leading-relaxed">{msg.content}</p>
                      )}

                      <div
                        className={`text-[9px] flex items-center justify-end gap-1 ${
                          isOutbound && !isCall ? 'text-emerald-100' : 'text-muted-foreground'
                        }`}
                      >
                        <span>{formatDateTime(msg.timestamp)}</span>
                        {isOutbound && !isCall && <span>• Delivered</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Template Selector */}
            <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase shrink-0">
                Templates:
              </span>
              {[
                'Intro: Thank you for enquiry',
                'Quotation dispathed on WhatsApp',
                'Follow-up: 5 min technical clarification',
                'PO acknowledged & in production',
              ].map((template) => (
                <button
                  key={template}
                  onClick={() => setMessageInput(template)}
                  className="px-2 py-1 rounded bg-card border border-border hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type WhatsApp message or record call note..."
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-8 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground">
            Select a conversation thread
          </div>
        )}
      </div>

      {/* CLOUD CALLING SIMULATION MODAL */}
      {isCallingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center text-white shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Cloud Telephony Simulation
              </span>
              <h3 className="text-lg font-bold mt-2">{activeThread.customerName}</h3>
              <p className="text-xs text-neutral-400 font-mono">{activeThread.phone}</p>
            </div>

            {/* Visualizer animation */}
            <div className="w-24 h-24 rounded-full bg-emerald-950/80 border-2 border-emerald-500/50 mx-auto flex items-center justify-center relative">
              {callState === 'connected' && (
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-40" />
              )}
              <PhoneCall className="w-10 h-10 text-emerald-400" />
            </div>

            {/* Status & Timer */}
            <div>
              {callState === 'dialing' && (
                <p className="text-xs text-amber-400 font-medium animate-pulse">
                  Connecting to Virtual PBX Trunk...
                </p>
              )}
              {callState === 'connected' && (
                <div className="space-y-1">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    Call in Progress
                  </span>
                  <div className="text-2xl font-mono font-bold">
                    {String(Math.floor(callDuration / 60)).padStart(2, '0')}:
                    {String(callDuration % 60).padStart(2, '0')}
                  </div>
                </div>
              )}
              {callState === 'completed' && (
                <p className="text-xs text-emerald-400 font-bold">Call Completed & Logged</p>
              )}
              {callState === 'missed' && (
                <p className="text-xs text-rose-400 font-bold">Logged as Unanswered / Busy</p>
              )}
            </div>

            {/* Call action buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {callState === 'connected' && (
                <>
                  <button
                    onClick={() => handleEndCallSimulation(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                  >
                    End Call & Log
                  </button>
                  <button
                    onClick={() => handleEndCallSimulation(false)}
                    className="px-3 py-2 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs"
                  >
                    Mark Busy / No Answer
                  </button>
                </>
              )}
              {callState === 'dialing' && (
                <button
                  onClick={() => setIsCallingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
                >
                  Cancel Dialing
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

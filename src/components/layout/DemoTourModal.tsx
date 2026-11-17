'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Users,
  Phone,
  FileText,
  ShoppingBag,
  BarChart3,
} from 'lucide-react';
import { useCRM } from '@/store/crmStore';

const TOUR_STEPS = [
  {
    step: 1,
    title: '1. Login as Admin',
    desc: 'Begin as Super Admin (Vikramaditya Singhania) to inspect company-wide metrics and configuration.',
    route: '/dashboard',
    userEmail: 'admin@leadflow.demo',
    icon: ShieldCheck,
  },
  {
    step: 2,
    title: '2. View Executive Dashboard',
    desc: 'Explore real-time KPI cards: Total Leads, Revenue Won, Conversion Rates and Source breakdown.',
    route: '/dashboard',
    icon: BarChart3,
  },
  {
    step: 3,
    title: '3. Open IndiaMART Integration',
    desc: 'Inspect the IndiaMART Lead Manager connection status, webhooks and synchronization logs.',
    route: '/integrations',
    icon: Zap,
  },
  {
    step: 4,
    title: '4. Simulate a New IndiaMART Lead',
    desc: 'Click "Simulate New Lead" on the IndiaMART card to ingest a realistic industrial pump enquiry.',
    route: '/integrations',
    icon: Zap,
  },
  {
    step: 5,
    title: '5. Verify Lead Captured in CRM',
    desc: 'View the newly created lead appearing in the centralized leads table with enquiry ID and details.',
    route: '/leads',
    icon: Users,
  },
  {
    step: 6,
    title: '6. Check Automatic Employee Assignment',
    desc: 'Notice how the assignment engine routed the lead to an active executive (e.g. Rahul Sharma).',
    route: '/leads',
    icon: Users,
  },
  {
    step: 7,
    title: '7. Switch to Sales Executive Role',
    desc: 'Login as Rahul Sharma (rahul@leadflow.demo) to experience the frontline sales executive workspace.',
    route: '/leads',
    userEmail: 'rahul@leadflow.demo',
    icon: ShieldCheck,
  },
  {
    step: 8,
    title: '8. Open Assigned Lead Details',
    desc: 'Inspect customer requirements, timeline, contact options, activities, and communication history.',
    route: '/leads',
    icon: Users,
  },
  {
    step: 9,
    title: '9. Record Customer Call & Comms',
    desc: 'Log call remarks, simulate an outbound WhatsApp template, or click device dialer.',
    route: '/communications',
    icon: Phone,
  },
  {
    step: 10,
    title: '10. Schedule Follow-up Task',
    desc: 'Schedule next follow-up call. Watch it sync with the lead, calendar and task manager.',
    route: '/follow-ups',
    icon: CheckCircle2,
  },
  {
    step: 11,
    title: '11. Move Lead in Pipeline (Kanban)',
    desc: 'Drag and drop the lead card across stages: from Contacted into Qualified or Negotiation.',
    route: '/pipeline',
    icon: Compass,
  },
  {
    step: 12,
    title: '12. Generate Professional Quotation',
    desc: 'Create an itemized GST quotation with automatic calculation and print/PDF generation.',
    route: '/quotations',
    icon: FileText,
  },
  {
    step: 13,
    title: '13. Mark Quotation Accepted',
    desc: 'Update quotation status to Accepted once the client confirms purchase agreement.',
    route: '/quotations',
    icon: FileText,
  },
  {
    step: 14,
    title: '14. Convert Lead to Customer & Sales Order',
    desc: 'One-click conversion creates permanent customer record and official sales order with deal value.',
    route: '/sales-orders',
    icon: ShoppingBag,
  },
  {
    step: 15,
    title: '15. Return to Admin Workspace',
    desc: 'Switch back to Super Admin to observe how all modules interconnected and updated.',
    route: '/dashboard',
    userEmail: 'admin@leadflow.demo',
    icon: ShieldCheck,
  },
  {
    step: 16,
    title: '16. Inspect Updated Analytics & Revenue',
    desc: 'Review reports, employee leaderboard, deal funnel and audit logs reflecting new business won.',
    route: '/reports',
    icon: BarChart3,
  },
];

export function DemoTourModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { switchUser } = useCRM();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const Icon = currentStep.icon;

  const handleGoToStep = () => {
    if (currentStep.userEmail) {
      switchUser(currentStep.userEmail);
    }
    router.push(currentStep.route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Client Presentation Walkthrough</h2>
              <p className="text-[11px] text-muted-foreground">
                Step-by-step interactive workflow demonstration (16 steps)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </span>
              <span className="text-muted-foreground">
                {Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step Card */}
          <div className="p-5 rounded-xl border border-border bg-muted/30 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{currentStep.title}</h3>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Target Route: <strong className="text-emerald-600 font-semibold">{currentStep.route}</strong>
                  {currentStep.userEmail && ` • Role Switch: ${currentStep.userEmail}`}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-13">
              {currentStep.desc}
            </p>
          </div>

          {/* Quick jump step picker */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              All 16 Demonstration Milestones
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.step}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-9 rounded-lg text-xs font-bold transition-all border ${
                    currentStepIndex === idx
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : idx < currentStepIndex
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {step.step}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <button
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleGoToStep}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/10"
          >
            <span>Jump to this Step</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentStepIndex(Math.min(TOUR_STEPS.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === TOUR_STEPS.length - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

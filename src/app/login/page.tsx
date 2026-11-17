'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, 
  Crown, UserCheck, Users, Briefcase, Eye as EyeIcon, CheckCircle2,
  Share2, BarChart3, Clock, ChevronRight, Sparkles, Building2
} from 'lucide-react';
import { useCRM, getRoleDashboardPath } from '@/store/crmStore';
import { DEMO_USERS } from '@/data/seedData';
import { toast } from 'sonner';

interface DemoAccount {
  name: string;
  role: string;
  email: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
  avatarBg: string;
  dashboardPath: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Vikramaditya Singhania',
    role: 'SUPER ADMIN',
    email: 'superadmin@leadflow.demo',
    title: 'Platform Owner',
    description: 'Full system privileges, multi-tenant configs, security audit logs, DB resets, and RBAC matrix.',
    icon: Crown,
    badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700/60',
    avatarBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    dashboardPath: '/super-admin/dashboard',
  },
  {
    name: 'Ankit Verma',
    role: 'ADMIN',
    email: 'admin@leadflow.demo',
    title: 'Daily Operations Head',
    description: 'Operational lead tracking, assignments, pipeline control, employee records, and integrations.',
    icon: UserCheck,
    badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700/60',
    avatarBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    dashboardPath: '/admin/dashboard',
  },
  {
    name: 'Rahul Mehta',
    role: 'SALES MANAGER',
    email: 'manager@leadflow.demo',
    title: 'Team Alpha Leader',
    description: 'Scoped to Team Alpha (27 leads), Amit & Priya performance, reassignments, team targets.',
    icon: Users,
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/60',
    avatarBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    dashboardPath: '/manager/dashboard',
  },
  {
    name: 'Amit Patel',
    role: 'SALES EXECUTIVE',
    email: 'rahul@leadflow.demo',
    title: 'Senior Sales Executive',
    description: 'Personal workspace (15 assigned leads), direct WhatsApp/Call triggers, personal follow-ups.',
    icon: Briefcase,
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60',
    avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    dashboardPath: '/executive/dashboard',
  },
  {
    name: 'Aditya Birla',
    role: 'READ-ONLY / MANAGEMENT',
    email: 'viewer@leadflow.demo',
    title: 'Executive Board Observer',
    description: 'Executive KPI dashboards, ROI analysis, pipeline analytics with write operations disabled.',
    icon: EyeIcon,
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    avatarBg: 'bg-gradient-to-br from-slate-500 to-zinc-700',
    dashboardPath: '/management/dashboard',
  },
];

const PLATFORM_HIGHLIGHTS = [
  {
    title: 'Centralized Lead Management',
    desc: 'Unified single-pane ingestion and deduplication across all incoming customer enquiries.',
    icon: Building2,
  },
  {
    title: 'IndiaMART Lead Ingestion',
    desc: 'Real-time buyer enquiry ingestion via Push Webhook and hourly CRM Pull API.',
    icon: Zap,
  },
  {
    title: 'Justdial Express Connector',
    desc: 'Direct Justdial Lead Express webhook listener with instant phone normalization.',
    icon: Share2,
  },
  {
    title: 'Smart Lead Assignment Engine',
    desc: 'Automated round-robin, capacity-balanced, and territory-based lead distribution.',
    icon: UserCheck,
  },
  {
    title: 'Visual Sales Pipeline',
    desc: 'Intuitive Kanban tracking from New Inquiry to Negotiation and Won Deal.',
    icon: Clock,
  },
  {
    title: 'Follow-up Automation & 1-Click Dialers',
    desc: 'Direct WhatsApp templates and simulated phone dialers with activity logging.',
    icon: CheckCircle2,
  },
  {
    title: 'Sales Performance & Channel ROI Analytics',
    desc: 'Comprehensive executive BI dashboards with conversion rates and rep benchmarks.',
    icon: BarChart3,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useCRM();

  const [email, setEmail] = useState('superadmin@leadflow.demo');
  const [password, setPassword] = useState('Demo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const ok = login(email, password);
      setLoading(false);
      if (ok) {
        const cleanEmail = email.trim().toLowerCase();
        const demoUser = DEMO_ACCOUNTS.find((d) => d.email === cleanEmail);
        const targetPath = demoUser ? demoUser.dashboardPath : getRoleDashboardPath(DEMO_USERS[cleanEmail]?.role);
        router.push(targetPath);
      }
    }, 350);
  };

  const handleQuickLogin = (demo: DemoAccount) => {
    setEmail(demo.email);
    setPassword('Demo@123');
    setLoading(true);

    setTimeout(() => {
      const ok = login(demo.email, 'Demo@123');
      setLoading(false);
      if (ok) {
        toast.success(`Welcome back, ${demo.name}! Logged in as ${demo.role}.`);
        router.push(demo.dashboardPath);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-stretch relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-purple-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* LEFT SECTION: Enterprise Branding, Overview & Capabilities (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-neutral-900/90 via-neutral-950 to-neutral-950 border-r border-neutral-800/80 p-12 flex-col justify-between relative z-10">
        <div className="space-y-8">
          {/* Logo & Edition Pill */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <Zap className="w-6 h-6 fill-current text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">LeadFlow</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-900/60 text-emerald-400 font-bold border border-emerald-700/60">
                  CRM
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Enterprise Multi-Role Platform
              </span>
            </div>
          </div>

          {/* Headline & Mission */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-[11px] font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dedicated IndiaMART & Justdial Sales Automation</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Turn Every Enquiry Into an Opportunity
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Capture buyer leads in real time, automatically route them to sales executives, accelerate communications over WhatsApp and phone, and drive conversion velocity with zero lead leakage.
            </p>
          </div>

          {/* Highlights List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Platform Architecture & Features
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {PLATFORM_HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div
                    key={h.title}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-neutral-200">{h.title}</div>
                      <div className="text-[11px] text-neutral-400 leading-tight">{h.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="pt-6 border-t border-neutral-800/80 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-xl font-extrabold text-emerald-400">99.4%</div>
            <div className="text-[10px] text-neutral-400 font-medium mt-0.5">Ingestion Rate</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-xl font-extrabold text-white">2 Sources</div>
            <div className="text-[10px] text-neutral-400 font-medium mt-0.5">IndiaMART & Justdial</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-xl font-extrabold text-teal-400">&lt; 3 sec</div>
            <div className="text-[10px] text-neutral-400 font-medium mt-0.5">Auto-Assignment</div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Sign In Form + 5 Role Switcher Cards */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 overflow-y-auto z-10">
        <div className="w-full max-w-lg space-y-6">
          {/* Mobile Brand Header (Visible only on smaller screens) */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current text-emerald-100" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">LeadFlow CRM</span>
              <p className="text-[11px] text-neutral-400">IndiaMART & Justdial Sales Engine</p>
            </div>
          </div>

          {/* Sign In Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Sign In to LeadFlow CRM</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your credentials or choose a pre-configured demo account below.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@leadflow.demo"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Password</label>
                  <span className="text-[11px] text-emerald-400 font-mono">Demo: Demo@123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-950 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Remember session</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-xs"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Launch Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 5 One-Click Demo Personas */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                  Select Demo Role (1-Click Login)
                </span>
              </div>
              <span className="text-[10px] bg-neutral-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">
                Pass: Demo@123
              </span>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((demo) => {
                const Icon = demo.icon;
                const isSelected = email === demo.email;

                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleQuickLogin(demo)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-3 group cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800/90 border-emerald-500/70 ring-1 ring-emerald-500/40 shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-800/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${demo.avatarBg} shadow-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-100 group-hover:text-emerald-300 transition-colors">
                            {demo.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold tracking-wider uppercase ${demo.badgeColor}`}>
                            {demo.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono truncate hidden sm:inline">
                          {demo.email}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                        {demo.description}
                      </p>
                    </div>

                    <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800/60">
              <span>Pure Client-Side State (No database)</span>
              <span className="text-emerald-400 font-medium">Session Stored in LocalStorage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

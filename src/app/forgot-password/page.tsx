'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your corporate email address');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Simulated recovery instructions generated');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 fill-current text-emerald-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            LeadFlow <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-400 font-semibold border border-emerald-800">CRM</span>
          </h1>
          <p className="text-xs text-neutral-400">
            Account Access & Security Recovery
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {!submitted ? (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <KeyRound className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Password Recovery</span>
                </div>
                <h2 className="text-lg font-bold text-white">Forgot your password?</h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Enter your registered work email to receive simulated password recovery instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="e.g. superadmin@leadflow.demo"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Request Recovery Link</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Recovery Request Processed</h2>
                <p className="text-xs text-neutral-400">
                  A simulated password recovery token has been prepared for <span className="text-neutral-200 font-mono">{email}</span>.
                </p>
              </div>

              {/* Demo Mode Advisory */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-left text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DEMO MODE NOTICE</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Password recovery is simulated. No actual email is sent across the external network.
                </p>
                <div className="pt-2 text-[11px] text-neutral-300 border-t border-amber-900/50 mt-2 space-y-0.5">
                  <div>Default Demo Password: <span className="font-mono font-bold text-emerald-400">Demo@123</span></div>
                  <div className="text-neutral-400 text-[10px]">Valid for all 5 pre-configured demo roles.</div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Accounts Quick Reference */}
          <div className="pt-4 border-t border-neutral-800 text-left space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Pre-Configured Demo Accounts (Password: Demo@123)
            </span>
            <div className="grid grid-cols-1 gap-1 text-[11px] text-neutral-300 font-mono">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="text-purple-400">Super Admin:</span>
                <span className="text-neutral-400">superadmin@leadflow.demo</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="text-blue-400">Admin:</span>
                <span className="text-neutral-400">admin@leadflow.demo</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="text-amber-400">Sales Manager:</span>
                <span className="text-neutral-400">manager@leadflow.demo</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="text-emerald-400">Sales Executive:</span>
                <span className="text-neutral-400">rahul@leadflow.demo</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="text-slate-400">Read-Only:</span>
                <span className="text-neutral-400">viewer@leadflow.demo</span>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

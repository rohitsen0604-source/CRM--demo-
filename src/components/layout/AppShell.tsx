'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearch } from './GlobalSearch';
import { QuickCreateModal } from './QuickCreateModal';
import { DemoTourModal } from './DemoTourModal';
import { useCRM } from '@/store/crmStore';
import { ShieldAlert, ArrowLeft, RefreshCw, Lock, Crown } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);

  const {
    isLoaded,
    currentUser,
    normalizedRole,
    switchUser,
    isSessionExpired,
    toggleSessionExpirySimulation,
    isAuthenticated,
    getRoleDashboardPath,
  } = useCRM();

  useEffect(() => {
    if (isLoaded && !isAuthenticated && pathname !== '/login' && pathname !== '/forgot-password') {
      router.replace('/login');
    }
  }, [isLoaded, isAuthenticated, pathname, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white animate-spin">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Loading LeadFlow CRM Environment...
        </p>
      </div>
    );
  }

  // Session Expiry Screen Check
  if (isSessionExpired) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center px-4 relative">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Session Inactive / Expired</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Your security session for <span className="text-white font-medium">{currentUser.email}</span> has timed out under simulated idle security policies.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Security Audit Context</div>
            <div className="text-neutral-300">Role: <span className="font-semibold text-emerald-400">{normalizedRole.toUpperCase()}</span></div>
            <div className="text-neutral-500 text-[11px]">Auto session invalidation prevents credential reuse on shared demo workstations.</div>
          </div>

          <button
            onClick={() => toggleSessionExpirySimulation()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-authenticate & Resume Session</span>
          </button>
        </div>
      </div>
    );
  }

  // Route Authorization Verification
  const checkRouteAuthorized = (): { authorized: boolean; reason?: string } => {
    // Public routes
    if (pathname === '/login' || pathname === '/forgot-password') return { authorized: true };

    // Super Admin has unrestricted access to all modules
    if (normalizedRole === 'super_admin') return { authorized: true };

    // Role Dashboard Isolation
    if (pathname === '/super-admin/dashboard' && normalizedRole !== 'super_admin') {
      return {
        authorized: false,
        reason: 'The Super Admin Dashboard requires Platform Owner credentials. Your active profile is ' + normalizedRole.replace('_', ' ').toUpperCase() + '.'
      };
    }
    if (pathname === '/admin/dashboard' && normalizedRole !== 'admin') {
      return {
        authorized: false,
        reason: 'The Admin Operations Dashboard requires CRM Administrator authority. Your active profile is ' + normalizedRole.replace('_', ' ').toUpperCase() + '.'
      };
    }
    if (pathname === '/manager/dashboard' && normalizedRole !== 'sales_manager') {
      return {
        authorized: false,
        reason: 'The Sales Manager Dashboard is restricted to Sales Leadership (Team Alpha). Your active profile is ' + normalizedRole.replace('_', ' ').toUpperCase() + '.'
      };
    }
    if (pathname === '/executive/dashboard' && normalizedRole !== 'sales_executive') {
      return {
        authorized: false,
        reason: 'The Sales Executive Personal Desk is reserved for assigned sales executives. Your active profile is ' + normalizedRole.replace('_', ' ').toUpperCase() + '.'
      };
    }
    if (pathname === '/management/dashboard' && normalizedRole !== 'read_only') {
      return {
        authorized: false,
        reason: 'The Executive Board / Management Overview is tailored exclusively for Read-Only observers.'
      };
    }

    // Audit Logs: Super Admin only
    if (pathname === '/audit-logs' || pathname.startsWith('/audit-logs/')) {
      return {
        authorized: false,
        reason: 'Audit logs contain tamper-proof security access events and are strictly restricted to the Super Admin platform owner.'
      };
    }

    // Integration Center & Webhook Simulator: Super Admin and Admin only
    if (pathname === '/integrations' || pathname.startsWith('/integrations/')) {
      if (normalizedRole !== 'admin') {
        return {
          authorized: false,
          reason: 'Webhook ingestion pipelines, API token management, and lead deduplication settings are restricted to Super Admin and Admin operations.'
        };
      }
    }

    // Team Management: Super Admin, Admin, and Sales Manager only
    if (pathname === '/team' || pathname.startsWith('/team/')) {
      if (normalizedRole === 'sales_executive' || normalizedRole === 'read_only') {
        return {
          authorized: false,
          reason: 'Team member administration, quota allocation, and performance appraisal are restricted to managerial and executive roles.'
        };
      }
    }

    // Communication Center: Super Admin, Admin, Sales Manager, Sales Executive
    if (pathname === '/communications' || pathname.startsWith('/communications/')) {
      if (normalizedRole === 'read_only') {
        return {
          authorized: false,
          reason: 'Direct call/WhatsApp logging is disabled for Read-Only audit accounts.'
        };
      }
    }

    return { authorized: true };
  };

  const routeAuth = checkRouteAuthorized();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Header */}
      <Header
        isCollapsed={isCollapsed}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
      />

      {/* Main Content Workspace */}
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-64'
          }`}
      >
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          {!routeAuth.authorized ? (
            /* Enterprise 403 Forbidden Access Screen */
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/50 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-lg shadow-rose-950/10">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-300 font-mono">
                  HTTP 403: Forbidden Access
                </span>
                <h1 className="text-2xl font-bold text-foreground">
                  Access Restricted by Role Governance
                </h1>
                <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  {routeAuth.reason}
                </p>
              </div>

              {/* Context card */}
              <div className="p-4 rounded-xl bg-card border border-border text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-semibold text-foreground">Current Session Identity</span>
                  <span className="text-[10px] font-mono uppercase bg-muted px-2 py-0.5 rounded font-bold text-emerald-600">
                    {normalizedRole.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                  <div>User: <span className="text-foreground font-medium">{currentUser.name}</span></div>
                  <div>Email: <span className="text-foreground font-mono">{currentUser.email}</span></div>
                  <div>Requested Path: <span className="text-rose-600 dark:text-rose-400 font-mono">{pathname}</span></div>
                  <div>Team: <span className="text-foreground">{currentUser.teamName || 'Global'}</span></div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => router.push(getRoleDashboardPath(normalizedRole))}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Authorized Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    switchUser('superadmin@leadflow.demo');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs flex items-center justify-center gap-2 border border-border transition-colors cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-purple-500" />
                  <span>Elevate to Super Admin (Demo)</span>
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      {/* Modals */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickCreateModal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} />
      <DemoTourModal isOpen={isDemoTourOpen} onClose={() => setIsDemoTourOpen(false)} />
    </div>
  );
}

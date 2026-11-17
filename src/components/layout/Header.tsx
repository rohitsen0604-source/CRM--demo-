'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  Compass,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  User,
  LogOut,
  RefreshCw,
  Crown,
  Briefcase,
  Eye,
  KeyRound,
  Lock,
  Timer,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useCRM, getRoleDashboardPath } from '@/store/crmStore';
import Link from 'next/link';
import { DEMO_USERS } from '@/data/seedData';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function Header({
  isCollapsed,
  onOpenSearch,
  onOpenQuickCreate,
  onOpenDemoTour,
}: {
  isCollapsed: boolean;
  onOpenSearch: () => void;
  onOpenQuickCreate: () => void;
  onOpenDemoTour: () => void;
}) {
  const router = useRouter();
  const {
    currentUser,
    switchUser,
    activeRole,
    normalizedRole,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
    changePassword,
    toggleSessionExpirySimulation,
    logout,
  } = useCRM();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = changePassword(oldPassword, newPassword);
    if (ok) {
      setOldPassword('');
      setNewPassword('');
      setIsPasswordModalOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Role pill styles
  const getRoleBadgeClasses = () => {
    switch (normalizedRole) {
      case 'super_admin': return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';
      case 'sales_manager': return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
      case 'sales_executive': return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
      case 'read_only': return 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getRoleIcon = () => {
    switch (normalizedRole) {
      case 'super_admin': return Crown;
      case 'admin': return UserCheck;
      case 'sales_manager': return UserCheck;
      case 'sales_executive': return Briefcase;
      case 'read_only': return Eye;
      default: return User;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-30 h-16 bg-card/90 backdrop-blur-md border-b border-border transition-all duration-300 flex items-center justify-between px-6 ${isCollapsed ? 'left-20' : 'left-64'
          }`}
      >
        {/* Left side: Search & Demo indicator */}
        <div className="flex items-center gap-4">
          {/* Search Input Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-3 px-3 py-1.5 w-60 md:w-72 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs border border-border/60 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">Search leads, customers, quotes...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* Active Role Quick Indicator */}
          <div className="hidden lg:flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${getRoleBadgeClasses()}`}>
              <RoleIcon className="w-3 h-3" />
              <span>{normalizedRole.replace('_', ' ')}</span>
            </span>
            {currentUser.teamName && (
              <span className="text-[11px] text-muted-foreground">
                ({currentUser.teamName})
              </span>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5">
          {/* Guided Walkthrough Tour Button */}
          <button
            onClick={onOpenDemoTour}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-700 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Tour</span>
          </button>

          {/* Quick Create Action - disabled for read-only */}
          {normalizedRole !== 'read_only' && (
            <button
              onClick={onOpenQuickCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Quick Create</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Toggle light / dark theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-card" />
              )}
            </button>

            {isNotifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-card border border-border shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 font-bold">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                  {notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        setIsNotifMenuOpen(false);
                        if (notif.relatedEntity?.type === 'lead') router.push('/leads');
                        else if (notif.relatedEntity?.type === 'quotation') router.push('/quotations');
                        else if (notif.relatedEntity?.type === 'task') router.push('/follow-ups');
                        else if (notif.relatedEntity?.type === 'integration') router.push('/integrations');
                      }}
                      className={`px-4 py-3 hover:bg-muted/50 cursor-pointer text-xs transition-colors flex gap-3 ${!notif.isRead ? 'bg-muted/20 font-medium' : 'text-muted-foreground'
                        }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        <div
                          className={`w-2 h-2 rounded-full ${notif.type === 'new_lead'
                              ? 'bg-emerald-500'
                              : notif.type === 'escalation' || notif.type === 'integration_failure'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                        />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="font-semibold text-foreground text-[11px] leading-tight">
                          {notif.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-2">
                          {notif.message}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 pt-0.5">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-border bg-muted/20 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setIsNotifMenuOpen(false)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs transition-colors cursor-pointer"
            >
              <div className="flex flex-col text-left">
                <span className="font-semibold text-foreground truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  {normalizedRole.replace('_', ' ')}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-card border border-border shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Switch Role Account
                    </p>
                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                      Demo Mode
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Instantly experience LeadFlow from each persona's perspective:
                  </p>
                </div>

                <div className="p-1 space-y-1">
                  {Object.entries(DEMO_USERS).map(([email, user]) => {
                    const isCurrent = currentUser.email.toLowerCase() === email.toLowerCase();
                    const roleLabel = (user.role || '').replace('_', ' ').toUpperCase();
                    return (
                      <button
                        key={email}
                        onClick={() => {
                          switchUser(email);
                          setIsRoleMenuOpen(false);
                          router.push(getRoleDashboardPath(user.role));
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${isCurrent
                            ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                            : 'hover:bg-muted text-foreground'
                          }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-semibold">{user.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {email} • <span className="uppercase font-semibold text-emerald-600 dark:text-emerald-400">{roleLabel}</span>
                          </span>
                        </div>
                        {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Profile & Security Options */}
                <div className="px-3 pt-2 border-t border-border mt-1 space-y-1">
                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      setIsPasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Change Password Simulation</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      toggleSessionExpirySimulation();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Simulate Session Inactivity Timeout</span>
                  </button>

                  {normalizedRole === 'super_admin' && (
                    <button
                      onClick={() => {
                        setIsRoleMenuOpen(false);
                        if (confirm('Are you sure you want to reset all CRM demo data to initial factory state?')) {
                          resetDemoData();
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Demo Environment</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-xs transition-colors cursor-pointer border-t border-border/40 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Simulation Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-foreground">Change Password Simulation</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Simulate an enterprise password change for <span className="font-semibold text-foreground">{currentUser.email}</span>. Demo password is <span className="font-mono text-emerald-600">Demo@123</span>.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Demo@123"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted/40 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">New Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted/40 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

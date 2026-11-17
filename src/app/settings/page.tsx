'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import {
  Settings,
  Building2,
  Users,
  ShieldCheck,
  Zap,
  Bell,
  Boxes,
  MessageSquare,
  Lock,
  Database,
  RefreshCw,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  RotateCcw,
  User,
  KeyRound,
  Crown,
  Eye,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

type SettingsTab =
  | 'general'
  | 'profile'
  | 'roles'
  | 'leads'
  | 'assignment'
  | 'notifications'
  | 'integrations'
  | 'communication'
  | 'security'
  | 'data';

function SettingsContent() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');

  const {
    settings,
    updateSettings,
    assignmentRules,
    updateAssignmentRules,
    resetDemoData,
    exportDataAsJSON,
    currentUser,
    normalizedRole,
    changePassword,
    rolePermissions,
    updateRolePermission,
  } = useCRM();

  const getInitialTab = (): SettingsTab => {
    if (requestedTab === 'organization') return 'general';
    if (requestedTab === 'security') return 'security';
    if (requestedTab === 'profile') return 'profile';
    if (requestedTab === 'roles') return 'roles';
    if (requestedTab === 'data') return 'data';

    if (normalizedRole === 'sales_executive' || normalizedRole === 'read_only') {
      return 'profile';
    }
    return 'general';
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>(getInitialTab());

  useEffect(() => {
    if (requestedTab === 'organization') setActiveTab('general');
    else if (requestedTab === 'security') setActiveTab('security');
    else if (requestedTab === 'profile') setActiveTab('profile');
    else if (requestedTab === 'roles') setActiveTab('roles');
    else if (requestedTab === 'data') setActiveTab('data');
  }, [requestedTab]);

  // General Form
  const [generalForm, setGeneralForm] = useState({
    companyName: settings.companyName,
    companyPhone: settings.companyPhone,
    companyEmail: settings.companyEmail,
    companyAddress: settings.companyAddress,
    companyGstin: settings.companyGstin,
    currency: settings.currency,
    timeZone: settings.timeZone,
    dateFormat: settings.dateFormat,
  });

  // Password Change Simulation in Profile Tab
  const [oldPassInput, setOldPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');

  // Assignment selection
  const [activeAssignment, setActiveAssignment] = useState(settings.activeAssignmentRule);

  // Reset confirmation modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(generalForm);
    toast.success('General enterprise settings updated');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = changePassword(oldPassInput, newPassInput);
    if (ok) {
      setOldPassInput('');
      setNewPassInput('');
    }
  };

  const handleSaveAssignment = () => {
    updateAssignmentRules(assignmentRules, activeAssignment);
    toast.success(`Active lead assignment engine updated to: ${activeAssignment.toUpperCase()}`);
  };

  const handleDownloadJSONBackup = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LeadFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded complete CRM JSON backup');
  };

  const handlePerformReset = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
  };

  // Determine which tabs to display based on the active role
  const allTabs: { id: SettingsTab; label: string; icon: React.ElementType; minRole: string[] }[] = [
    { id: 'profile', label: 'My User Profile', icon: User, minRole: ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'read_only'] },
    { id: 'general', label: 'Enterprise Profile', icon: Building2, minRole: ['super_admin', 'admin'] },
    { id: 'roles', label: 'RBAC Permissions Matrix', icon: Users, minRole: ['super_admin', 'admin'] },
    { id: 'assignment', label: 'Lead Assignment Engine', icon: ShieldCheck, minRole: ['super_admin', 'admin', 'sales_manager'] },
    { id: 'leads', label: 'Pipeline & Stage Rules', icon: Zap, minRole: ['super_admin', 'admin'] },
    { id: 'notifications', label: 'Notification Alerts', icon: Bell, minRole: ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'read_only'] },
    { id: 'integrations', label: 'Integration Webhooks', icon: Boxes, minRole: ['super_admin', 'admin'] },
    { id: 'security', label: 'Security & Access Vault', icon: Lock, minRole: ['super_admin'] },
    { id: 'data', label: 'Data Management & Reset', icon: Database, minRole: ['super_admin'] },
  ];

  const visibleTabs = allTabs.filter((t) => t.minRole.includes(normalizedRole));

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Enterprise Governance & Workspace Settings
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Role: {normalizedRole.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure enterprise parameters, RBAC matrices, assignment routing, and user preferences
          </p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Navigation Tabs */}
        <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-2 space-y-1 text-xs">
          {visibleTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold transition-colors cursor-pointer ${isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Contents */}
        <div className="lg:col-span-9 rounded-2xl bg-card border border-border p-6 shadow-sm">
          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">User Profile & Session Information</h3>
                <p className="text-muted-foreground text-[11px]">
                  Identity and authorization scope assigned to your workstation session
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</div>
                  <div className="text-sm font-bold text-foreground">{currentUser.name}</div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Work Email Address</div>
                  <div className="text-sm font-mono font-bold text-foreground">{currentUser.email}</div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Assigned Role & Privilege Tier</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    {normalizedRole.replace('_', ' ')}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Organizational Unit / Team</div>
                  <div className="text-sm font-bold text-foreground">
                    {currentUser.teamName || 'Global Operations'}
                  </div>
                </div>
              </div>

              {/* Password change simulation */}
              <div className="pt-4 border-t border-border space-y-3">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  <span>Update Workstation Password</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Default demo password is <span className="font-mono text-emerald-600">Demo@123</span>.
                </p>

                <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                  <div>
                    <label className="block text-[11px] font-medium mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Demo@123"
                      value={oldPassInput}
                      onChange={(e) => setOldPassInput(e.target.value)}
                      className="w-full p-2 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="New password (min 6)"
                      value={newPassInput}
                      onChange={(e) => setNewPassInput(e.target.value)}
                      className="w-full p-2 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
              <div className="border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">General Enterprise Profile</h3>
                <p className="text-muted-foreground text-[11px]">
                  Branding and business identity appearing on Quotations and Invoices
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Company Registered Name</label>
                  <input
                    type="text"
                    value={generalForm.companyName}
                    onChange={(e) => setGeneralForm({ ...generalForm, companyName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Company GSTIN</label>
                  <input
                    type="text"
                    value={generalForm.companyGstin}
                    onChange={(e) => setGeneralForm({ ...generalForm, companyGstin: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Official Contact Phone</label>
                  <input
                    type="text"
                    value={generalForm.companyPhone}
                    onChange={(e) => setGeneralForm({ ...generalForm, companyPhone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Official Email</label>
                  <input
                    type="email"
                    value={generalForm.companyEmail}
                    onChange={(e) => setGeneralForm({ ...generalForm, companyEmail: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Base Currency</label>
                  <input
                    type="text"
                    value={generalForm.currency}
                    onChange={(e) => setGeneralForm({ ...generalForm, currency: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Time Zone</label>
                  <input
                    type="text"
                    value={generalForm.timeZone}
                    onChange={(e) => setGeneralForm({ ...generalForm, timeZone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Date Format</label>
                  <input
                    type="text"
                    value={generalForm.dateFormat}
                    onChange={(e) => setGeneralForm({ ...generalForm, dateFormat: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Save Enterprise Profile
                </button>
              </div>
            </form>
          )}

          {/* TAB: RBAC PERMISSIONS MATRIX */}
          {activeTab === 'roles' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">Role-Based Access Control (RBAC) Matrix</h3>
                  <p className="text-muted-foreground text-[11px]">
                    Enforced permissions across all 5 operational tiers
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  Enforced
                </span>
              </div>

              <div className="border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-muted/40 font-bold border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Role Tier</th>
                      <th className="py-2.5 px-3">Lead Scope</th>
                      <th className="py-2.5 px-3">Create / Edit</th>
                      <th className="py-2.5 px-3">Delete Lead</th>
                      <th className="py-2.5 px-3">Assign Reps</th>
                      <th className="py-2.5 px-3">Integrations</th>
                      <th className="py-2.5 px-3">Audit Logs</th>
                      <th className="py-2.5 px-3">Reset Demo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr className="hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-bold text-purple-600 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" /> Super Admin
                      </td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">All 45 Leads</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Authorized</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ All Reps</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Control</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Vault</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Permitted</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-bold text-blue-600 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> Admin
                      </td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">All 45 Leads</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Authorized</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ All Reps</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Control</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked (403)</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-bold text-amber-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Sales Manager
                      </td>
                      <td className="py-2.5 px-3 text-amber-600 font-bold">Team Alpha (27)</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Team Only</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked</td>
                      <td className="py-2.5 px-3 text-amber-600 font-bold">✓ Team Alpha Only</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked (403)</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked (403)</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-bold text-emerald-600 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> Sales Executive
                      </td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">Assigned (15)</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Own Leads Only</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked (403)</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked (403)</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-bold text-slate-500 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Read-Only
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">View Permitted</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ View Only</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked (403)</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked (403)</td>
                      <td className="py-2.5 px-3 text-rose-500 font-medium">✕ Blocked</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ASSIGNMENT ENGINE */}
          {activeTab === 'assignment' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Lead Assignment Routing Engine</h3>
                <p className="text-muted-foreground text-[11px]">
                  Configures how incoming IndiaMART and Justdial enquiries are routed to sales reps
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'round_robin',
                    name: 'Round Robin Distribution',
                    desc: 'Sequentially passes each incoming lead across all active sales reps in cyclical turn.',
                  },
                  {
                    id: 'workload_balanced',
                    name: 'Workload-Balanced Intelligent Routing',
                    desc: 'Assigns new leads to the representative with the fewest open/active follow-ups.',
                  },
                  {
                    id: 'city_territory',
                    name: 'Territory & City Pin-Code Based',
                    desc: 'Routes leads by inquiry location (e.g. Maharashtra to Amit, Delhi-NCR to Priya).',
                  },
                  {
                    id: 'product_category',
                    name: 'Product Category Specialization',
                    desc: 'Dispatches machinery to industrial reps and packaging to packaging specialists.',
                  },
                ].map((engine) => (
                  <div
                    key={engine.id}
                    onClick={() => setActiveAssignment(engine.id as any)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${activeAssignment === engine.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-border hover:bg-muted/40'
                      }`}
                  >
                    <input
                      type="radio"
                      checked={activeAssignment === engine.id}
                      onChange={() => setActiveAssignment(engine.id as any)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-foreground text-xs">{engine.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{engine.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <button
                  onClick={handleSaveAssignment}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Apply Assignment Engine
                </button>
              </div>
            </div>
          )}

          {/* TAB: DATA MANAGEMENT & RESET (Super Admin Only) */}
          {activeTab === 'data' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Data Management & Platform Reset</h3>
                <p className="text-muted-foreground text-[11px]">
                  Backup CRM state to JSON or reset database to factory presentation state
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                <h4 className="font-bold text-foreground text-xs">JSON Backup Export</h4>
                <p className="text-[11px] text-muted-foreground">
                  Export all leads, customers, quotations, sales orders, tasks, and audit logs into a single structured JSON file.
                </p>
                <button
                  onClick={handleDownloadJSONBackup}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted font-bold text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              {/* Reset Demo Data Card */}
              <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reset Demo Environment to Factory Initial State</span>
                </div>
                <p className="text-rose-900/80 dark:text-rose-300/80 text-[11px] leading-relaxed">
                  This action restores all 45 leads, 25 customers, quotations, sales orders, tasks, and employees back to the initial demo state.
                </p>

                {normalizedRole === 'super_admin' ? (
                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data...</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-rose-600 font-semibold">
                    Reset restricted to Super Admin role.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SECURITY & ACCESS VAULT */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Security Policies & Authentication Controls</h3>
                <p className="text-muted-foreground text-[11px]">
                  Enterprise login safeguards, session timeout simulation, and password policies
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                  <div className="font-bold text-xs text-foreground">Multi-Factor Authentication (MFA)</div>
                  <p className="text-[11px] text-muted-foreground">
                    Enforced for Super Admin and Admin tiers via TOTP authenticator tokens.
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                  <div className="font-bold text-xs text-foreground">Session Expiration Safeguard</div>
                  <p className="text-[11px] text-muted-foreground">
                    Inactivity timeout set to 15 minutes to prevent workstation hijacking.
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    ENFORCED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK TABS */}
          {['leads', 'notifications', 'integrations', 'communication'].includes(activeTab) && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                  {activeTab} Configuration
                </h3>
                <p className="text-muted-foreground text-[11px]">
                  Operational parameters and rule definitions
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                <p className="text-muted-foreground leading-relaxed">
                  Active policy settings are enforced in real time across the application state. All changes are stored securely in browser LocalStorage.
                </p>
                <div className="flex items-center gap-2 text-emerald-600 font-semibold pt-1">
                  <Check className="w-4 h-4" />
                  <span>Standard enterprise defaults validated</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR RESET DEMO DATA */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Confirm Factory Reset</h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to restore initial client demonstration data? All locally created test records will be restored to original values.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePerformReset}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Yes, Reset Environment
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

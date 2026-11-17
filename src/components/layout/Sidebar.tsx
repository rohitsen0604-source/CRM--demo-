'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  CheckSquare,
  Calendar,
  MessageSquare,
  FileText,
  ShoppingBag,
  UserCheck,
  BarChart3,
  Boxes,
  Bell,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  PieChart,
  UserPlus,
  ShieldCheck,
  Crown,
  Briefcase,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useCRM, getRoleDashboardPath } from '@/store/crmStore';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const { 
    currentUser, 
    activeRole, 
    normalizedRole,
    scopedLeads, 
    scopedTasks, 
    scopedQuotations,
    scopedOrders,
    duplicateReviews 
  } = useCRM();

  const pendingTasksCount = scopedTasks.filter((t) => t.status === 'pending' || t.status === 'overdue').length;
  const pendingDuplicates = duplicateReviews.filter((d) => d.status === 'pending_review').length;
  const unassignedCount = scopedLeads.filter((l) => !l.assignedTo || l.assignedTo === 'emp_unassigned').length;

  // Build role-tailored navigation structures
  const getNavSections = (): NavSection[] => {
    switch (normalizedRole) {
      case 'super_admin':
        return [
          {
            section: 'PLATFORM GOVERNANCE',
            items: [
              { name: 'Global Overview', href: '/super-admin/dashboard', icon: LayoutDashboard },
              { name: 'Organization', href: '/settings?tab=organization', icon: Building2 },
              { name: 'User Management', href: '/team', icon: UserCheck, badge: 9 },
            ],
          },
          {
            section: 'SALES PIPELINE',
            items: [
              { name: 'All Leads', href: '/leads', icon: Users, badge: scopedLeads.length },
              { name: 'Customers', href: '/customers', icon: Building2 },
              { name: 'Sales Pipeline', href: '/pipeline', icon: Kanban },
              { 
                name: 'Follow-ups', 
                href: '/follow-ups', 
                icon: CheckSquare, 
                badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, 
                badgeColor: 'bg-amber-500 text-white' 
              },
            ],
          },
          {
            section: 'REVENUE & REPORTS',
            items: [
              { name: 'Quotations', href: '/quotations', icon: FileText, badge: scopedQuotations.length },
              { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingBag, badge: scopedOrders.length },
              { name: 'Team Management', href: '/team', icon: Users },
              { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
            ],
          },
          {
            section: 'INTEGRATIONS & SECURITY',
            items: [
              { 
                name: 'Integration Center', 
                href: '/integrations', 
                icon: Boxes, 
                badge: pendingDuplicates > 0 ? pendingDuplicates : undefined, 
                badgeColor: 'bg-emerald-600 text-white' 
              },
              { name: 'Integration Logs', href: '/integrations?tab=logs', icon: SlidersHorizontal },
              { name: 'Audit Logs', href: '/audit-logs', icon: ShieldAlert },
              { name: 'Security & RBAC', href: '/settings?tab=security', icon: ShieldCheck },
              { name: 'System Settings', href: '/settings', icon: Settings },
            ],
          },
        ];

      case 'admin':
        return [
          {
            section: 'BUSINESS OPERATIONS',
            items: [
              { name: 'Business Overview', href: '/admin/dashboard', icon: LayoutDashboard },
              { name: 'Leads Directory', href: '/leads', icon: Users, badge: scopedLeads.length },
              { name: 'Customers', href: '/customers', icon: Building2 },
              { name: 'Sales Pipeline', href: '/pipeline', icon: Kanban },
            ],
          },
          {
            section: 'TASKS & COMMS',
            items: [
              { 
                name: 'Follow-ups', 
                href: '/follow-ups', 
                icon: CheckSquare, 
                badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, 
                badgeColor: 'bg-amber-500 text-white' 
              },
              { name: 'Calendar', href: '/calendar', icon: Calendar },
              { name: 'Quotations', href: '/quotations', icon: FileText },
              { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingBag },
            ],
          },
          {
            section: 'OPERATIONS & SETUP',
            items: [
              { name: 'Employees', href: '/team', icon: UserCheck },
              { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
              { 
                name: 'Integration Status', 
                href: '/integrations', 
                icon: Boxes, 
                badge: pendingDuplicates > 0 ? pendingDuplicates : undefined, 
                badgeColor: 'bg-emerald-600 text-white' 
              },
              { name: 'Operational Settings', href: '/settings', icon: Settings },
            ],
          },
        ];

      case 'sales_manager':
        return [
          {
            section: 'TEAM ALPHA OVERSIGHT',
            items: [
              { name: 'Team Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
              { name: 'Team Leads', href: '/leads', icon: Users, badge: scopedLeads.length },
              { name: 'Team Pipeline', href: '/pipeline', icon: Kanban },
              { name: 'Team Members', href: '/team', icon: UserCheck },
              { 
                name: 'Assignments Queue', 
                href: '/leads?view=unassigned', 
                icon: UserPlus,
                badge: unassignedCount > 0 ? unassignedCount : undefined,
                badgeColor: 'bg-amber-500 text-white'
              },
            ],
          },
          {
            section: 'ACTIVITIES & DEALS',
            items: [
              { 
                name: 'Team Follow-ups', 
                href: '/follow-ups', 
                icon: CheckSquare, 
                badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, 
                badgeColor: 'bg-amber-500 text-white' 
              },
              { name: 'Team Calendar', href: '/calendar', icon: Calendar },
              { name: 'Quotations', href: '/quotations', icon: FileText, badge: scopedQuotations.length },
              { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingBag, badge: scopedOrders.length },
              { name: 'Team Reports', href: '/reports', icon: BarChart3 },
            ],
          },
        ];

      case 'sales_executive':
        return [
          {
            section: 'MY WORKSPACE',
            items: [
              { name: 'My Dashboard', href: '/executive/dashboard', icon: LayoutDashboard },
              { name: 'My Leads', href: '/leads', icon: Users, badge: scopedLeads.length },
              { name: 'My Pipeline', href: '/pipeline', icon: Kanban },
              { name: 'My Customers', href: '/customers', icon: Building2 },
            ],
          },
          {
            section: 'DAILY ACTIONS',
            items: [
              { 
                name: 'My Follow-ups', 
                href: '/follow-ups', 
                icon: CheckSquare, 
                badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, 
                badgeColor: 'bg-amber-500 text-white' 
              },
              { name: 'My Calendar', href: '/calendar', icon: Calendar },
              { name: 'Communication Center', href: '/communications', icon: MessageSquare },
            ],
          },
          {
            section: 'MY DEALS & TARGETS',
            items: [
              { name: 'My Quotations', href: '/quotations', icon: FileText, badge: scopedQuotations.length },
              { name: 'My Sales Orders', href: '/sales-orders', icon: ShoppingBag, badge: scopedOrders.length },
              { name: 'My Performance', href: '/reports', icon: TrendingUp },
              { name: 'My Profile', href: '/settings?tab=profile', icon: Settings },
            ],
          },
        ];

      case 'read_only':
        return [
          {
            section: 'EXECUTIVE INTELLIGENCE',
            items: [
              { name: 'Management Overview', href: '/management/dashboard', icon: LayoutDashboard },
              { name: 'Sales Reports', href: '/reports', icon: BarChart3 },
              { name: 'Lead Source ROI', href: '/reports?tab=sources', icon: PieChart },
              { name: 'Revenue Reports', href: '/reports?tab=revenue', icon: TrendingUp },
              { name: 'Team Performance', href: '/reports?tab=team', icon: Users },
            ],
          },
        ];

      default:
        return [
          {
            section: 'GENERAL',
            items: [
              { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
              { name: 'Leads', href: '/leads', icon: Users },
            ],
          },
        ];
    }
  };

  const navSections = getNavSections();

  const getRoleIcon = () => {
    switch (normalizedRole) {
      case 'super_admin': return Crown;
      case 'admin': return UserCheck;
      case 'sales_manager': return Users;
      case 'sales_executive': return Briefcase;
      case 'read_only': return Eye;
      default: return Users;
    }
  };

  const getRoleBadgeClasses = () => {
    switch (normalizedRole) {
      case 'super_admin': return 'bg-purple-900/60 text-purple-300 border-purple-800';
      case 'admin': return 'bg-blue-900/60 text-blue-300 border-blue-800';
      case 'sales_manager': return 'bg-amber-900/60 text-amber-300 border-amber-800';
      case 'sales_executive': return 'bg-emerald-900/60 text-emerald-300 border-emerald-800';
      case 'read_only': return 'bg-slate-800 text-slate-300 border-slate-700';
      default: return 'bg-neutral-800 text-neutral-300';
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link href={getRoleDashboardPath(normalizedRole)} className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/20 shrink-0">
            <Zap className="w-5 h-5 fill-current text-emerald-100" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                LeadFlow <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">CRM</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-medium truncate">
                Sales Automation
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Badge Indicator */}
      {!isCollapsed ? (
        <div className="px-4 py-2.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-muted">
              <RoleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getRoleBadgeClasses()}`}>
                  {normalizedRole.replace('_', ' ')}
                </span>
                {currentUser.teamName && (
                  <span className="text-[10px] text-muted-foreground font-medium truncate">
                    {currentUser.teamName}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-medium text-foreground truncate mt-0.5">
                {currentUser.name}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2 flex justify-center border-b border-border" title={`${currentUser.name} (${normalizedRole})`}>
          <RoleIcon className="w-4 h-4 text-emerald-500" />
        </div>
      )}

      {/* Navigation items list */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {navSections.map((group) => (
          <div key={group.section} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                {group.section}
              </div>
            )}
            {group.items.map((item) => {
              const itemPath = item.href.split('?')[0];
              const isActive = pathname === itemPath;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                        item.badgeColor || 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && item.badge !== undefined && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-border bg-muted/30">
        {!isCollapsed ? (
          <div className="rounded-lg p-2.5 bg-card border border-border/70 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> RBAC Enforced
              </span>
              <span className="text-[10px] font-mono px-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {normalizedRole === 'super_admin' && 'Global root scope: Multi-tenant & System configurations'}
              {normalizedRole === 'admin' && 'Enterprise scope: Daily operations & integrations management'}
              {normalizedRole === 'sales_manager' && 'Team scope: Team Alpha leads & executive workload'}
              {normalizedRole === 'sales_executive' && 'Individual scope: 15 personal assigned leads'}
              {normalizedRole === 'read_only' && 'Restricted scope: Audit & KPI reporting only (read-only)'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="RBAC Scoped Workspace">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          </div>
        )}
      </div>
    </aside>
  );
}

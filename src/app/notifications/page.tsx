'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { NotificationItem } from '@/types';
import { formatDateTime } from '@/lib/utils';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  ShoppingBag,
  FileText,
  UserCheck,
  Filter,
  Check,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCRM();

  const [filterType, setFilterType] = useState<string>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    if (notif.relatedEntity?.type === 'lead') router.push('/leads');
    else if (notif.relatedEntity?.type === 'quotation') router.push('/quotations');
    else if (notif.relatedEntity?.type === 'task') router.push('/follow-ups');
    else if (notif.relatedEntity?.type === 'order') router.push('/sales-orders');
    else if (notif.relatedEntity?.type === 'integration') router.push('/integrations');
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Notification & Alert Center
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time notifications for incoming enquiries, task reminders, manager escalations and closed orders
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-emerald-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs overflow-x-auto">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'new_lead', label: 'New Enquiries' },
          { id: 'escalation', label: 'Escalations' },
          { id: 'followup_due', label: 'Follow-ups' },
          { id: 'lead_won', label: 'Deals Won' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              filterType === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Items List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
            <Bell className="w-8 h-8 mx-auto opacity-30 mb-2" />
            <p className="font-semibold text-sm">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.isRead;

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 text-xs ${
                  isUnread
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm'
                    : 'border-border bg-card hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.type === 'escalation' || notif.type === 'integration_failure'
                        ? 'bg-rose-100 text-rose-700'
                        : notif.type === 'lead_won' || notif.type === 'quotation_accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : notif.type === 'new_lead'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {notif.type === 'escalation' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    ) : notif.type === 'lead_won' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-xs">{notif.title}</h3>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-card" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/70 block pt-0.5">
                      {formatDateTime(notif.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  <span className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                    <span>View Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}

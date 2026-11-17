'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';

export default function SuperAdminDashboardPage() {
  return (
    <AppShell>
      <SuperAdminDashboard />
    </AppShell>
  );
}

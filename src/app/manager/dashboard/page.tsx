'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SalesManagerDashboard } from '@/components/dashboard/SalesManagerDashboard';

export default function SalesManagerDashboardPage() {
  return (
    <AppShell>
      <SalesManagerDashboard />
    </AppShell>
  );
}

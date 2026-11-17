'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ReadOnlyDashboard } from '@/components/dashboard/ReadOnlyDashboard';

export default function ManagementDashboardPage() {
  return (
    <AppShell>
      <ReadOnlyDashboard />
    </AppShell>
  );
}

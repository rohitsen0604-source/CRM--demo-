'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SalesExecutiveDashboard } from '@/components/dashboard/SalesExecutiveDashboard';

export default function SalesExecutiveDashboardPage() {
  return (
    <AppShell>
      <SalesExecutiveDashboard />
    </AppShell>
  );
}

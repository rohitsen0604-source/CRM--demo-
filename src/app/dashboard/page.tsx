'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCRM, getRoleDashboardPath } from '@/store/crmStore';
import { AppShell } from '@/components/layout/AppShell';

export default function DashboardPage() {
  const router = useRouter();
  const { normalizedRole, isLoaded } = useCRM();

  useEffect(() => {
    if (isLoaded) {
      const target = getRoleDashboardPath(normalizedRole);
      router.replace(target);
    }
  }, [normalizedRole, isLoaded, router]);

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">
          Navigating to authorized role workspace...
        </p>
      </div>
    </AppShell>
  );
}

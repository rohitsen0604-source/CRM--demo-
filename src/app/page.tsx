'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCRM, getRoleDashboardPath } from '@/store/crmStore';

export default function HomePage() {
  const router = useRouter();
  const { isLoaded, isAuthenticated, normalizedRole } = useCRM();

  useEffect(() => {
    if (isLoaded) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        router.replace(getRoleDashboardPath(normalizedRole));
      }
    }
  }, [isLoaded, isAuthenticated, normalizedRole, router]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-neutral-400 font-medium">Initializing LeadFlow CRM...</p>
    </div>
  );
}

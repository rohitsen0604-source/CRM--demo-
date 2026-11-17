import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CRMProvider } from '@/store/crmStore';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeadFlow CRM | Enterprise Lead Management & Sales Automation',
  description: 'Enterprise CRM solution for IndiaMART & Justdial lead capture, sales pipelines, quotations, and multi-channel workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased bg-background text-foreground`}>
        <CRMProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </CRMProvider>
      </body>
    </html>
  );
}

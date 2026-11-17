'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, Building2, FileText, ShoppingBag, UserCheck, ArrowRight } from 'lucide-react';
import { useCRM } from '@/store/crmStore';
import { formatCurrency } from '@/lib/utils';

export function GlobalSearch({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { leads, customers, quotations, orders, employees } = useCRM();
  const [query, setQuery] = useState('');

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredLeads = q
    ? leads.filter(
        (l) =>
          l.customerName.toLowerCase().includes(q) ||
          l.companyName.toLowerCase().includes(q) ||
          l.leadNumber.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.productService.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const filteredCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.customerNumber.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.phone.includes(q)
      ).slice(0, 4)
    : [];

  const filteredQuotations = q
    ? quotations.filter(
        (quot) =>
          quot.quotationNumber.toLowerCase().includes(q) ||
          quot.customerCompany.toLowerCase().includes(q) ||
          quot.customerName.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredOrders = q
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerCompany.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredEmployees = q
    ? employees.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const totalResults =
    filteredLeads.length +
    filteredCustomers.length +
    filteredQuotations.length +
    filteredOrders.length +
    filteredEmployees.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, companies, quotes, phone numbers..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:text-foreground font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm font-medium">Type a name, phone, order # or company to search</p>
              <p className="text-xs text-muted-foreground/70">
                Try searching: <span className="font-semibold text-foreground">Sharma</span>,{' '}
                <span className="font-semibold text-foreground">Pumps</span>, or{' '}
                <span className="font-semibold text-foreground">Indore</span>
              </p>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">No matches found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Check spelling or try a phone number or company keyword
              </p>
            </div>
          )}

          {/* Leads */}
          {filteredLeads.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-emerald-600" /> Leads ({filteredLeads.length})
              </div>
              <div className="space-y-1">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => {
                      onClose();
                      router.push(`/leads?selected=${lead.id}`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{lead.customerName}</span>
                        <span className="text-[10px] font-mono px-1.5 rounded bg-muted font-normal text-muted-foreground">
                          {lead.leadNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {lead.status}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {lead.companyName} • {lead.productService} • {lead.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">
                        {formatCurrency(lead.estimatedValue)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {lead.assignedEmployeeName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-emerald-600" /> Customers ({filteredCustomers.length})
              </div>
              <div className="space-y-1">
                {filteredCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      onClose();
                      router.push(`/customers?selected=${cust.id}`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        {cust.name} ({cust.company})
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {cust.customerNumber} • {cust.city}, {cust.state} • {cust.phone}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(cust.customerValue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quotations */}
          {filteredQuotations.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1 flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-emerald-600" /> Quotations ({filteredQuotations.length})
              </div>
              <div className="space-y-1">
                {filteredQuotations.map((quot) => (
                  <div
                    key={quot.id}
                    onClick={() => {
                      onClose();
                      router.push(`/quotations?selected=${quot.id}`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        {quot.quotationNumber} • {quot.customerCompany}
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        Status: <span className="uppercase font-semibold">{quot.status}</span> • Valid: {quot.validUntil}
                      </div>
                    </div>
                    <div className="font-bold text-foreground">
                      {formatCurrency(quot.grandTotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {filteredOrders.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1 flex items-center gap-1.5">
                <ShoppingBag className="w-3 h-3 text-emerald-600" /> Sales Orders ({filteredOrders.length})
              </div>
              <div className="space-y-1">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onClose();
                      router.push(`/sales-orders?selected=${ord.id}`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        {ord.orderNumber} • {ord.customerCompany}
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {ord.assignedSalesExecutive} • {ord.orderDate}
                      </div>
                    </div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(ord.orderValue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Search spans Leads, Customers, Quotations & Orders</span>
          <span className="font-mono text-[10px]">ENTER to view</span>
        </div>
      </div>
    </div>
  );
}

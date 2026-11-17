'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { Customer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingBag,
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit3,
  X,
  MessageSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

function CustomersContent() {
  const searchParams = useSearchParams();
  const initialSelectedId = searchParams.get('selected');

  const { 
    scopedCustomers: customers, 
    scopedLeads: leads, 
    scopedQuotations: quotations, 
    scopedOrders: orders, 
    scopedEmployees: employees, 
    normalizedRole,
    can,
    createCustomer, 
    updateCustomer, 
    addCommunicationMessage 
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Customer for Profile Drawer
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(initialSelectedId || null);
  const [profileTab, setProfileTab] = useState<'orders' | 'enquiries' | 'quotations' | 'notes'>('orders');

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    address: '',
    gstin: '',
    relationshipOwner: employees[0]?.fullName || 'Rahul Sharma',
    relationshipOwnerId: employees[0]?.id || 'emp_1',
    notes: '',
  });

  // Unique cities list
  const citiesList = useMemo(() => {
    return Array.from(new Set(customers.map((c) => c.city))).sort();
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.company.toLowerCase().includes(q) &&
          !c.phone.includes(q) &&
          !c.customerNumber.toLowerCase().includes(q) &&
          !c.city.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (selectedCity !== 'all' && c.city !== selectedCity) return false;
      if (selectedTier !== 'all' && c.status !== selectedTier) return false;
      return true;
    });
  }, [customers, searchTerm, selectedCity, selectedTier]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedCustomer = customers.find((c) => c.id === viewingCustomerId);

  // Linked entities for selected customer
  const customerOrders = orders.filter((o) => o.customerId === selectedCustomer?.id);
  const customerQuotations = quotations.filter((q) => q.customerId === selectedCustomer?.id || q.customerCompany.toLowerCase() === selectedCustomer?.company.toLowerCase());
  const customerLeads = leads.filter((l) => l.customerId === selectedCustomer?.id || l.phone === selectedCustomer?.phone);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      city: 'Indore',
      state: 'Madhya Pradesh',
      address: '',
      gstin: '',
      relationshipOwner: employees[0]?.fullName || 'Rahul Sharma',
      relationshipOwnerId: employees[0]?.id || 'emp_1',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      company: cust.company,
      phone: cust.phone,
      email: cust.email,
      city: cust.city,
      state: cust.state,
      address: cust.address || '',
      gstin: cust.gstin || '',
      relationshipOwner: cust.relationshipOwner,
      relationshipOwnerId: cust.relationshipOwnerId,
      notes: cust.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.phone) {
      toast.error('Name, Company and Phone are mandatory');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        ...formData,
      });
    } else {
      createCustomer({
        ...formData,
        customerValue: 0,
        totalOrders: 0,
        totalQuotations: 0,
        totalEnquiries: 1,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Customer Accounts</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {customers.length} Accounts
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage long-term client relationships, repeat orders, past enquiries and quotations
          </p>
        </div>

        {can('create', 'customers') && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Customer</span>
          </button>
        )}
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, contact person, phone..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="all">All Cities</option>
            {citiesList.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="all">All Tiers</option>
            <option value="vip">VIP Accounts</option>
            <option value="active">Active Accounts</option>
          </select>
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Showing <strong>{filteredCustomers.length}</strong> accounts
        </div>
      </div>

      {/* CUSTOMERS DATA TABLE */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Company & Client Name</th>
                <th className="py-3 px-4">Phone / Email</th>
                <th className="py-3 px-4">City & State</th>
                <th className="py-3 px-4 text-center">Enquiries</th>
                <th className="py-3 px-4 text-center">Quotes</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Lifetime Value</th>
                <th className="py-3 px-4">Account Owner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                    {cust.customerNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <span>{cust.company}</span>
                      {cust.status === 'vip' && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{cust.name}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono text-foreground">{cust.phone}</div>
                    <div className="text-[10px] text-muted-foreground">{cust.email}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-foreground">{cust.city}</div>
                    <div className="text-[10px] text-muted-foreground">{cust.state}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold">{cust.totalEnquiries || 1}</td>
                  <td className="py-3 px-4 text-center font-bold">{cust.totalQuotations || 0}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">
                    {cust.totalOrders || 0}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(cust.customerValue)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                    {cust.relationshipOwner}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingCustomerId(cust.id)}
                        className="px-2.5 py-1 rounded bg-muted hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                      {can('edit', 'customers') && (
                        <button
                          onClick={() => openEditModal(cust)}
                          className="p-1 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-border bg-card disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-border bg-card disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOMER 360 PROFILE DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/20 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {selectedCustomer.customerNumber}
                  </span>
                  {selectedCustomer.status === 'vip' && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      VIP Account
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-foreground">{selectedCustomer.company}</h2>
                <p className="text-xs text-muted-foreground">Contact: {selectedCustomer.name}</p>
              </div>
              <button
                onClick={() => setViewingCustomerId(null)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & LTV Ribbon */}
            <div className="p-4 bg-muted/30 border-b border-border grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Lifetime Value
                </span>
                <div className="text-base font-bold text-emerald-600">
                  {formatCurrency(selectedCustomer.customerValue)}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Account Owner
                </span>
                <div className="text-xs font-bold text-foreground">
                  {selectedCustomer.relationshipOwner}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  GSTIN
                </span>
                <div className="text-xs font-mono font-semibold text-foreground truncate">
                  {selectedCustomer.gstin || '23AABCS1429B1Z8'}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-border px-6 gap-4 bg-muted/10">
              {[
                { id: 'orders', label: `Sales Orders (${customerOrders.length})` },
                { id: 'enquiries', label: `Linked Enquiries (${customerLeads.length})` },
                { id: 'quotations', label: `Quotations (${customerQuotations.length})` },
                { id: 'notes', label: 'Client Notes' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setProfileTab(t.id as any)}
                  className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
                    profileTab === t.id
                      ? 'border-emerald-600 text-emerald-600 font-bold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {profileTab === 'orders' && (
                <div className="space-y-3">
                  {customerOrders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                      <ShoppingBag className="w-8 h-8 mx-auto opacity-30 mb-2" />
                      <p className="text-xs">No completed sales orders recorded yet for this account.</p>
                    </div>
                  ) : (
                    customerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-xl border border-border bg-card space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-700">
                            {ord.orderNumber}
                          </span>
                          <span className="font-bold text-foreground">
                            {formatCurrency(ord.orderValue)}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Order Date: {ord.orderDate} • Status:{' '}
                          <span className="uppercase font-semibold text-emerald-600">
                            {ord.orderStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded">
                          Terms: {ord.paymentTerms}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {profileTab === 'enquiries' && (
                <div className="space-y-3">
                  {customerLeads.map((l) => (
                    <div
                      key={l.id}
                      className="p-3.5 rounded-xl border border-border bg-card space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold">{l.leadNumber}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-muted">
                          {l.status}
                        </span>
                      </div>
                      <div className="font-medium">{l.productService}</div>
                      <p className="text-[11px] text-muted-foreground">{l.requirement}</p>
                    </div>
                  ))}
                </div>
              )}

              {profileTab === 'quotations' && (
                <div className="space-y-3">
                  {customerQuotations.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold">{q.quotationNumber}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Status: <span className="uppercase font-semibold">{q.status}</span> • Valid until {q.validUntil}
                        </div>
                      </div>
                      <div className="font-bold text-foreground">
                        {formatCurrency(q.grandTotal)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profileTab === 'notes' && (
                <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-[11px]">Commercial Notes</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedCustomer.notes || 'No specific commercial notes recorded.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {editingCustomer ? `Edit: ${editingCustomer.company}` : 'Create Customer Account'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="23AABCF8820M1Z4"
                    className="w-full p-2 rounded-lg border border-border bg-background font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">Loading customers...</div>}>
      <CustomersContent />
    </Suspense>
  );
}

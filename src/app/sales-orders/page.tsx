'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { OrderStatus, SalesOrder } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  X,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

function SalesOrdersContent() {
  const searchParams = useSearchParams();
  const initialSelected = searchParams.get('selected');

  const { 
    scopedOrders: orders, 
    scopedCustomers: customers, 
    scopedLeads: leads, 
    scopedQuotations: quotations, 
    scopedEmployees: employees, 
    normalizedRole,
    can,
    updateSalesOrder, 
    createSalesOrder 
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Preview Order Modal
  const [previewOrder, setPreviewOrder] = useState<SalesOrder | null>(
    initialSelected ? orders.find((o) => o.id === initialSelected) || null : null
  );

  // Create Order Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerCompany: 'Sharma Industrial Solutions',
    customerName: 'Manoj Sharma',
    orderValue: 850000,
    orderDate: new Date().toISOString().split('T')[0],
    assignedSalesExecutive: 'Rahul Sharma',
    assignedSalesExecutiveId: 'emp_1',
    orderStatus: 'confirmed' as OrderStatus,
    paymentTerms: '30% Advance, 70% against dispatch',
    billingAddress: 'Plot 42, Sector C, Sanwer Road, Indore, MP',
    shippingAddress: 'Plot 42, Sector C, Sanwer Road, Indore, MP',
    notes: 'Standard manufacturing dispatch schedule',
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
  const completedCount = orders.filter((o) => o.orderStatus === 'completed').length;
  const inProcessingCount = orders.filter((o) => o.orderStatus === 'processing' || o.orderStatus === 'confirmed').length;

  const filteredOrders = orders.filter((o) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (
        !o.orderNumber.toLowerCase().includes(q) &&
        !o.customerCompany.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    return true;
  });

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    updateSalesOrder(orderId, { orderStatus: nextStatus });
    toast.success(`Sales Order status updated to: ${nextStatus.toUpperCase()}`);
    if (previewOrder?.id === orderId) {
      setPreviewOrder({ ...previewOrder, orderStatus: nextStatus });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSalesOrder({
      ...formData,
    });
    setIsModalOpen(false);
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Sales Orders & Revenue Operations
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {orders.length} Confirmed Orders
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage won deal conversions, dispatch fulfillment, logistics and order receivables
          </p>
        </div>

        {normalizedRole !== 'read_only' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Sales Order</span>
          </button>
        )}
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Revenue Booked
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[10px] text-muted-foreground">Cumulative confirmed deals</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Orders in Production / Transit
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {inProcessingCount}
          </div>
          <span className="text-[10px] text-muted-foreground">Pending dispatch or clearance</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Delivered & Commissioned
          </span>
          <div className="text-2xl font-bold text-emerald-600">
            {completedCount}
          </div>
          <span className="text-[10px] text-muted-foreground">Payments collected</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order #, company name..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold"
          >
            <option value="all">All Order Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">In Production / Processing</option>
            <option value="completed">Completed & Commissioned</option>
            <option value="pending_confirmation">Pending Confirmation</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredOrders.length}</strong> orders
        </div>
      </div>

      {/* ORDERS DATA TABLE */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Client Company</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4 text-right">Order Value (INR)</th>
                <th className="py-3 px-4">Account Executive</th>
                <th className="py-3 px-4 text-center">Fulfillment Status</th>
                <th className="py-3 px-4">Payment Terms</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                    <button
                      onClick={() => setPreviewOrder(ord)}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{ord.orderNumber}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">{ord.customerCompany}</div>
                    <div className="text-[11px] text-muted-foreground">{ord.customerName}</div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                    {formatDate(ord.orderDate)}
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatCurrency(ord.orderValue)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                    {ord.assignedSalesExecutive}
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        ord.orderStatus === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.orderStatus === 'confirmed'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {ord.orderStatus.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-muted-foreground truncate max-w-[200px]">
                    {ord.paymentTerms}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewOrder(ord)}
                        className="px-2.5 py-1 rounded bg-muted hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold"
                      >
                        Inspect
                      </button>
                      {ord.orderStatus !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(ord.id, 'completed')}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold"
                          title="Mark Delivered & Completed"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SALES ORDER DETAIL MODAL */}
      {previewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-foreground">
                  Order Record: {previewOrder.orderNumber}
                </span>
              </div>
              <button onClick={() => setPreviewOrder(null)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-foreground">{previewOrder.customerCompany}</span>
                  <span className="text-base font-bold text-emerald-600">
                    {formatCurrency(previewOrder.orderValue)}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Contact: {previewOrder.customerName} • Date: {formatDate(previewOrder.orderDate)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Account Owner: <strong>{previewOrder.assignedSalesExecutive}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-[11px]">Update Fulfillment Status</label>
                <div className="flex gap-2">
                  {(['confirmed', 'processing', 'completed', 'cancelled'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(previewOrder.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                        previewOrder.orderStatus === st
                          ? 'bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                <span className="font-semibold block text-[11px]">Commercial & Shipping Terms:</span>
                <p className="text-muted-foreground">{previewOrder.paymentTerms}</p>
                <p className="text-muted-foreground pt-1">
                  Shipping Address: {previewOrder.shippingAddress || 'Factory Address, Indore'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewOrder(null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SALES ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Create Sales Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerCompany}
                    onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Order Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.orderValue}
                    onChange={(e) => setFormData({ ...formData, orderValue: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-border bg-background font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Order Date</label>
                  <input
                    type="date"
                    required
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment & Commercial Terms</label>
                <input
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                />
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
                  Confirm & Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function SalesOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">Loading sales orders...</div>}>
      <SalesOrdersContent />
    </Suspense>
  );
}

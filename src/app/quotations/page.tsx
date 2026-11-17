'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { Quotation, QuotationItem, QuotationStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  FileText,
  Plus,
  Search,
  Download,
  Printer,
  Copy,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  History,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

function QuotationsContent() {
  const searchParams = useSearchParams();
  const initialSelected = searchParams.get('selected');

  const {
    scopedQuotations: quotations,
    scopedLeads: leads,
    scopedCustomers: customers,
    scopedEmployees: employees,
    normalizedRole,
    can,
    createQuotation,
    updateQuotation,
    reviseQuotation,
    deleteQuotation,
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Preview / Print Modal
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(
    initialSelected ? quotations.find((q) => q.id === initialSelected) || null : null
  );

  // Create / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  // Line items state in modal
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [relatedLeadId, setRelatedLeadId] = useState('');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [terms, setTerms] = useState(
    '1. 30% Advance with PO, 70% against dispatch.\n2. 12 months comprehensive warranty.\n3. Freight and transit insurance extra at actuals.\n4. Subject to Indore jurisdiction.'
  );

  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: 'item_1',
      productName: '15 HP Multistage High Pressure Pump',
      description: 'SS304 impellers, 12 stages, 140m head, 50 m3/hr discharge',
      hsnCode: '84137010',
      quantity: 2,
      unit: 'Units',
      unitPrice: 110000,
      discountPercent: 5,
      taxPercent: 18,
      taxAmount: 37620,
      totalAmount: 246620,
    },
  ]);

  // Revision Modal State
  const [revisingQuotation, setRevisingQuotation] = useState<Quotation | null>(null);
  const [revisionReason, setRevisionReason] = useState('');

  // Calculations for active form
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountTotal = items.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * (item.discountPercent || 0)) / 100,
    0
  );
  const taxTotal = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const grandTotal = subtotal - discountTotal + taxTotal;

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const nextItems = [...items];
    const item = { ...nextItems[index], [field]: value };

    const itemSubtotal = item.unitPrice * item.quantity;
    const itemDiscount = (itemSubtotal * (item.discountPercent || 0)) / 100;
    const taxableAmount = itemSubtotal - itemDiscount;
    const taxAmount = (taxableAmount * (item.taxPercent || 18)) / 100;
    const totalAmount = taxableAmount + taxAmount;

    item.taxAmount = Math.round(taxAmount);
    item.totalAmount = Math.round(totalAmount);

    nextItems[index] = item;
    setItems(nextItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item_${Date.now()}`,
        productName: 'Heavy Duty Industrial Pump',
        description: 'Standard technical specifications',
        hsnCode: '84137010',
        quantity: 1,
        unit: 'Units',
        unitPrice: 75000,
        discountPercent: 0,
        taxPercent: 18,
        taxAmount: 13500,
        totalAmount: 88500,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const openCreateModal = () => {
    setEditingQuotation(null);
    setCustomerName('Manoj Sharma');
    setCustomerCompany('Sharma Industrial Solutions');
    setCustomerEmail('manoj@sharmasolutions.com');
    setCustomerPhone('9826110001');
    setCustomerAddress('Plot 42, Sector C, Sanwer Road, Indore, MP');
    setCustomerGstin('23AABCS1429B1Z8');
    setRelatedLeadId(leads[0]?.id || '');
    setItems([
      {
        id: `item_${Date.now()}`,
        productName: 'FlowTech Centrifugal Slurry Pump 25 HP',
        description: 'High chrome impeller with dual mechanical seals',
        hsnCode: '84137010',
        quantity: 2,
        unit: 'Units',
        unitPrice: 145000,
        discountPercent: 5,
        taxPercent: 18,
        taxAmount: 49590,
        totalAmount: 325090,
      },
    ]);
    setIsFormOpen(true);
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerCompany || items.length === 0) {
      toast.error('Customer and at least one item are required');
      return;
    }

    if (editingQuotation) {
      updateQuotation(editingQuotation.id, {
        customerName,
        customerCompany,
        customerEmail,
        customerPhone,
        customerAddress,
        customerGstin,
        relatedLeadId,
        items,
        validUntil,
        termsAndConditions: terms,
      });
    } else {
      createQuotation({
        customerName,
        customerCompany,
        customerEmail,
        customerPhone,
        customerAddress,
        customerGstin,
        relatedLeadId,
        items,
        validUntil,
        termsAndConditions: terms,
        status: 'sent',
      });
    }
    setIsFormOpen(false);
  };

  const handleDuplicate = (quot: Quotation) => {
    createQuotation({
      ...quot,
      notes: `Duplicated from ${quot.quotationNumber}`,
      status: 'draft',
    });
    toast.success(`Duplicated ${quot.quotationNumber} into a new draft quotation!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredQuotations = quotations.filter((q) => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (
        !q.quotationNumber.toLowerCase().includes(s) &&
        !q.customerCompany.toLowerCase().includes(s) &&
        !q.customerName.toLowerCase().includes(s)
      ) {
        return false;
      }
    }
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    return true;
  });

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Quotation & Proposal Management
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {quotations.length} Proposals
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create itemized GST quotations, calculate totals automatically, manage revisions, and print/download branded PDFs
          </p>
        </div>

        {can('create', 'quotations') && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Quotation</span>
          </button>
        )}
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
              placeholder="Search quotation number, company..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="revised">Revised</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredQuotations.length}</strong> quotations
        </div>
      </div>

      {/* QUOTATIONS TABLE */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Quote Number</th>
                <th className="py-3 px-4">Client Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4 text-right">Grand Total (INR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Prepared By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredQuotations.map((quot) => (
                <tr key={quot.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                    <button
                      onClick={() => setPreviewQuotation(quot)}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{quot.quotationNumber}</span>
                      {quot.version > 1 && (
                        <span className="text-[10px] font-mono px-1 rounded bg-muted">
                          v{quot.version}
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">{quot.customerCompany}</div>
                    <div className="text-[11px] text-muted-foreground">{quot.customerName}</div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono">{quot.customerPhone}</div>
                    <div className="text-[10px] text-muted-foreground">{quot.customerEmail}</div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                    {formatDate(quot.createdAt)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                    {formatDate(quot.validUntil)}
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(quot.grandTotal)}
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${quot.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : quot.status === 'revised'
                          ? 'bg-indigo-100 text-indigo-800'
                          : quot.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {quot.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                    {quot.assignedEmployeeName.split(' ')[0]}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewQuotation(quot)}
                        className="px-2.5 py-1 rounded bg-muted hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold"
                        title="Preview & Print PDF"
                      >
                        Preview / Print
                      </button>
                      <button
                        onClick={() => handleDuplicate(quot)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                        title="Duplicate Quotation"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {quot.status !== 'accepted' && (
                        <button
                          onClick={() => {
                            updateQuotation(quot.id, { status: 'accepted' });
                            toast.success(`Quotation ${quot.quotationNumber} marked Accepted!`);
                          }}
                          className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"
                          title="Mark Accepted"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
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

      {/* BRANDED QUOTATION PREVIEW & PRINT MODAL */}
      {previewQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-foreground">
                  Official Quotation Preview: {previewQuotation.quotationNumber} (v{previewQuotation.version})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => {
                    handlePrint();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setPreviewQuotation(null)}
                  className="p-1 text-muted-foreground hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Branded Document Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-white text-neutral-900 space-y-6 print:p-0">
              {/* Company Header */}
              <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                    FLOWTECH MACHINERY INDIA PVT LTD
                  </h2>
                  <p className="text-xs text-neutral-600">
                    Industrial Pumps • CNC Centers • Heavy Hydraulic Presses
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Plot 108, Sanwer Road Industrial Area, Sector B, Indore, MP 452015
                  </p>
                  <p className="text-xs text-neutral-500 font-mono">
                    GSTIN: 23AABCF8820M1Z4 • Phone: +91 (0731) 429-8800
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-sm font-bold uppercase text-emerald-700 tracking-wider">
                    PROFORMA QUOTATION
                  </span>
                  <div className="text-xs font-mono font-bold">{previewQuotation.quotationNumber}</div>
                  <div className="text-[11px] text-neutral-500">
                    Date: {formatDate(previewQuotation.createdAt)}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Valid Until: {formatDate(previewQuotation.validUntil)}
                  </div>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-2 gap-6 text-xs border border-neutral-200 p-4 rounded-lg bg-neutral-50">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-neutral-500">Billed & Consigned To:</span>
                  <div className="font-bold text-sm text-neutral-900">{previewQuotation.customerCompany}</div>
                  <div>Attention: {previewQuotation.customerName}</div>
                  <div>{previewQuotation.customerAddress || 'Sanwer Road Industrial Area, Indore, MP'}</div>
                  <div className="font-mono">GSTIN: {previewQuotation.customerGstin || '23AABCS1429B1Z8'}</div>
                  <div>Mobile: {previewQuotation.customerPhone}</div>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold uppercase text-neutral-500">Commercial Summary:</span>
                  <div>Sales Representative: <strong>{previewQuotation.assignedEmployeeName}</strong></div>
                  <div>Payment Terms: 30% Advance, 70% Dispatch</div>
                  <div>Dispatch Schedule: 2-3 Weeks from Advance</div>
                  <div>
                    Status: <strong className="uppercase text-emerald-700">{previewQuotation.status}</strong>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 border-b border-neutral-200 font-bold text-neutral-700 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">HSN Code</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">Disc %</th>
                      <th className="py-2.5 px-3 text-right">GST (18%)</th>
                      <th className="py-2.5 px-3 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {previewQuotation.items.map((item, idx) => (
                      <tr key={item.id} className="text-neutral-800">
                        <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-neutral-900">{item.productName}</div>
                          <div className="text-[11px] text-neutral-600">{item.description}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{item.hsnCode || '84137010'}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-center">{item.discountPercent}%</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.taxAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {formatCurrency(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Summary */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-1.5 border border-neutral-200 p-3 rounded-lg bg-neutral-50">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(previewQuotation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Total Discount:</span>
                    <span className="font-mono text-emerald-700">
                      - {formatCurrency(previewQuotation.discountTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>GST (Tax):</span>
                    <span className="font-mono">{formatCurrency(previewQuotation.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-300">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-700">
                      {formatCurrency(previewQuotation.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms and Signatures */}
              <div className="pt-4 border-t border-neutral-200 space-y-4 text-[11px] text-neutral-600">
                <div>
                  <h4 className="font-bold text-neutral-800 uppercase mb-1">Standard Terms & Conditions:</h4>
                  <p className="whitespace-pre-line leading-relaxed">{previewQuotation.termsAndConditions}</p>
                </div>

                <div className="flex justify-between items-end pt-8">
                  <div>
                    <p className="text-[10px] text-neutral-500">Customer Acceptance & Signature</p>
                    <div className="w-48 border-b border-neutral-400 mt-6" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900">For FLOWTECH MACHINERY INDIA PVT LTD</p>
                    <div className="w-48 border-b border-neutral-400 mt-6 ml-auto" />
                    <p className="text-[10px] text-neutral-500 mt-1">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUOTATION MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {editingQuotation ? `Edit ${editingQuotation.quotationNumber}` : 'Create Itemized Quotation'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Client Info Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Customer Company *</label>
                  <input
                    type="text"
                    required
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    placeholder="e.g. Patel Engineering Works"
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ketan Patel"
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9826110002"
                    className="w-full p-2 rounded-lg border border-border bg-background font-mono"
                  />
                </div>
              </div>

              {/* Items Table Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Itemized Products & Services
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                            Product Name
                          </label>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                            className="w-full p-1.5 rounded border border-border bg-background"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                            Unit Price (₹)
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                            className="w-full p-1.5 rounded border border-border bg-background font-mono"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full p-1.5 rounded border border-border bg-background font-mono text-center"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                            Disc %
                          </label>
                          <input
                            type="number"
                            value={item.discountPercent}
                            onChange={(e) =>
                              handleItemChange(idx, 'discountPercent', Number(e.target.value))
                            }
                            className="w-full p-1.5 rounded border border-border bg-background font-mono text-center"
                          />
                        </div>
                        <div className="sm:col-span-2 text-right">
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                            Total (GST 18%)
                          </label>
                          <span className="font-mono font-bold text-foreground block pt-1">
                            {formatCurrency(item.totalAmount)}
                          </span>
                        </div>
                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 rounded text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Math summary box */}
              <div className="p-4 rounded-xl border border-border bg-card flex justify-end">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount Total:</span>
                    <span className="font-mono text-emerald-600">- {formatCurrency(discountTotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST Total (18%):</span>
                    <span className="font-mono">{formatCurrency(taxTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-foreground pt-2 border-t border-border">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save & Generate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">Loading quotations...</div>}>
      <QuotationsContent />
    </Suspense>
  );
}
}
}
}
}
}
}

'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { Lead, LeadPriority, LeadSource, LeadStatus } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit3,
  Phone,
  MessageSquare,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  Clock,
  ArrowUpDown,
  Send,
  Building2,
  Mail,
  MapPin,
  Tag,
  Paperclip,
  Check,
  FileSpreadsheet,
  Upload,
  PhoneCall,
  ExternalLink,
  Play,
  Square,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

function LeadsContent() {
  const searchParams = useSearchParams();
  const initialSelectedId = searchParams.get('selected');

  const {
    scopedLeads: leads,
    scopedEmployees: employees,
    scopedTasks: tasks,
    scopedQuotations: quotations,
    currentUser,
    normalizedRole,
    can,
    createLead,
    updateLead,
    deleteLead,
    bulkAssignLeads,
    bulkUpdateLeadStatus,
    bulkImportLeads,
    createTask,
    addCommunicationMessage,
    convertLeadToCustomerAndOrder,
  } = useCRM();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Sorting
  const [sortBy, setSortBy] = useState<'createdAt' | 'customerName' | 'estimatedValue' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Multi-select
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkActionTargetEmp, setBulkActionTargetEmp] = useState('');
  const [bulkActionTargetStatus, setBulkActionTargetStatus] = useState<LeadStatus>('contacted');

  // Lead Detail Profile Modal
  const [viewingLeadId, setViewingLeadId] = useState<string | null>(initialSelectedId || null);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'activities' | 'communication' | 'followups' | 'quotations' | 'history'>('overview');

  // Edit / Create Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Quick Action Modals inside Detail Drawer
  const [newRemark, setNewRemark] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState(new Date().toISOString().split('T')[0]);
  const [newFollowUpTime, setNewFollowUpTime] = useState('14:00');
  const [newFollowUpDesc, setNewFollowUpDesc] = useState('');

  // Delete confirmation
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Quick WhatsApp Modal State
  const [quickWhatsAppLead, setQuickWhatsAppLead] = useState<Lead | null>(null);
  const [whatsAppText, setWhatsAppText] = useState('');
  const [activeTemplateKey, setActiveTemplateKey] = useState('intro');

  // Quick Call Modal State
  const [quickCallLead, setQuickCallLead] = useState<Lead | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimerActive, setCallTimerActive] = useState(false);
  const [callDisposition, setCallDisposition] = useState('requirement_gathered');
  const [callNotes, setCallNotes] = useState('');

  // Bulk Import & Update (CSV & Excel) State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [parsedImportData, setParsedImportData] = useState<any[]>([]);
  const [importStats, setImportStats] = useState({ total: 0, toUpdate: 0, toCreate: 0 });
  const [isParsing, setIsParsing] = useState(false);

  // Call Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (callTimerActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [callTimerActive]);

  // Form State
  const [formData, setFormData] = useState<Partial<Lead>>({
    customerName: '',
    companyName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    productService: 'Industrial Water Pumps',
    requirement: '',
    quantity: '1 Unit',
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    source: 'indiamart',
    priority: 'medium',
    status: 'new',
    estimatedValue: 450000,
    assignedTo: employees[0]?.id || '',
    notes: '',
  });

  // Filtered & Sorted Leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (l) =>
          l.customerName.toLowerCase().includes(q) ||
          l.companyName.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.leadNumber.toLowerCase().includes(q) ||
          l.productService.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q)
      );
    }

    if (selectedSource !== 'all') {
      result = result.filter((l) => l.source === selectedSource);
    }

    if (selectedEmployee !== 'all') {
      result = result.filter((l) => l.assignedTo === selectedEmployee);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((l) => l.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      result = result.filter((l) => l.priority === selectedPriority);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortBy === 'estimatedValue') {
        comparison = a.estimatedValue - b.estimatedValue;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [leads, searchTerm, selectedSource, selectedEmployee, selectedStatus, selectedPriority, sortBy, sortOrder]);

  const totalPages = Math.ceil(processedLeads.length / pageSize) || 1;
  const paginatedLeads = processedLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedLead = leads.find((l) => l.id === viewingLeadId);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Quick WhatsApp Handlers
  const openQuickWhatsApp = (lead: Lead) => {
    setQuickWhatsAppLead(lead);
    setActiveTemplateKey('intro');
    const repName = lead.assignedEmployeeName || 'FlowTech Representative';
    setWhatsAppText(
      `Namaste ${lead.customerName} ji, thank you for contacting FlowTech Machinery regarding ${lead.productService || lead.requirement}. I am ${repName}. How may we assist you with technical specifications and commercial quotation today?`
    );
  };

  const handleApplyTemplate = (key: string) => {
    if (!quickWhatsAppLead) return;
    setActiveTemplateKey(key);
    const repName = quickWhatsAppLead.assignedEmployeeName || 'FlowTech Representative';
    if (key === 'intro') {
      setWhatsAppText(
        `Namaste ${quickWhatsAppLead.customerName} ji, thank you for contacting FlowTech Machinery regarding ${quickWhatsAppLead.productService || quickWhatsAppLead.requirement}. I am ${repName}. How may we assist you with technical specifications and commercial quotation today?`
      );
    } else if (key === 'quotation') {
      setWhatsAppText(
        `Hello ${quickWhatsAppLead.customerName} ji, sharing technical datasheet and quotation overview for ${quickWhatsAppLead.productService}. Please review and let us know if any customized specifications or discount terms are required.`
      );
    } else if (key === 'visit') {
      setWhatsAppText(
        `Namaste ${quickWhatsAppLead.customerName} ji, our technical sales engineer is scheduling plant visits in ${quickWhatsAppLead.city} this week. Would tomorrow or Thursday work for an on-site product demonstration?`
      );
    } else if (key === 'delivery') {
      setWhatsAppText(
        `Hello ${quickWhatsAppLead.customerName} ji, following up regarding the order confirmation for ${quickWhatsAppLead.productService}. Please let us know if you need proforma invoice details for advance processing.`
      );
    }
  };

  const handleSendWhatsApp = () => {
    if (!quickWhatsAppLead) return;
    const cleanPhone = (quickWhatsAppLead.phone || '').replace(/\D/g, '').slice(-10);
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsAppText)}`;

    addCommunicationMessage(quickWhatsAppLead.phone, {
      channel: 'whatsapp',
      content: whatsAppText,
      status: 'delivered',
    });

    window.open(waUrl, '_blank');
    toast.success(`WhatsApp chat opened with ${quickWhatsAppLead.customerName}`);
    setQuickWhatsAppLead(null);
  };

  // Quick Call Handlers
  const openQuickCall = (lead: Lead) => {
    setQuickCallLead(lead);
    setCallDuration(0);
    setCallTimerActive(true);
    setCallDisposition('requirement_gathered');
    setCallNotes('');
  };

  const handleCompleteCall = () => {
    if (!quickCallLead) return;
    const dispositionLabels: Record<string, string> = {
      requirement_gathered: 'Requirement Discussed / Interested',
      quotation_requested: 'Commercial Quotation Requested',
      callback_requested: 'Call Back Later / Scheduled',
      busy: 'Line Busy / Disconnected',
      not_reachable: 'Not Reachable / Switched Off',
      wrong_number: 'Wrong Number / Invalid Prospect',
    };

    const finalNote = callNotes
      ? `${dispositionLabels[callDisposition]}: ${callNotes}`
      : dispositionLabels[callDisposition];

    addCommunicationMessage(quickCallLead.phone, {
      channel: 'call',
      content: `${finalNote} (Call Duration: ${formatSeconds(callDuration)})`,
      status: 'completed',
      callDurationSeconds: callDuration || 60,
    });

    updateLead(quickCallLead.id, {
      lastContactedAt: new Date().toISOString(),
      notes: quickCallLead.notes
        ? `${quickCallLead.notes}\n[Call Log ${formatDateTime(new Date().toISOString())} - ${formatSeconds(callDuration)}]: ${finalNote}`
        : `[Call Log - ${formatSeconds(callDuration)}]: ${finalNote}`,
    });

    toast.success(`Call logged for ${quickCallLead.customerName} (${formatSeconds(callDuration)})`);
    setQuickCallLead(null);
    setCallTimerActive(false);
  };

  // Handle Export CSV
  const handleExportCSV = (customLeads?: Lead[]) => {
    const targetLeads = customLeads || processedLeads;
    const headers = [
      'Lead ID',
      'Lead Number',
      'Customer Name',
      'Company Name',
      'Phone',
      'Email',
      'City',
      'State',
      'Product / Requirement',
      'Source',
      'Priority',
      'Status',
      'Assigned Executive',
      'Estimated Value (INR)',
      'Created Date',
      'Next Follow-up',
      'Notes',
    ];

    const rows = targetLeads.map((l) => [
      `"${l.id}"`,
      `"${l.leadNumber}"`,
      `"${l.customerName.replace(/"/g, '""')}"`,
      `"${l.companyName.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      `"${l.city}"`,
      `"${l.state}"`,
      `"${(l.productService || l.productRequirement || l.requirement || '').replace(/"/g, '""')}"`,
      `"${l.source}"`,
      `"${l.priority}"`,
      `"${l.status}"`,
      `"${l.assignedEmployeeName}"`,
      l.estimatedValue || 0,
      `"${l.createdAt}"`,
      `"${l.nextFollowUp || ''}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LeadFlow_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${targetLeads.length} leads to CSV`);
  };

  // Handle Export Excel (.xls)
  const handleExportExcel = (customLeads?: Lead[]) => {
    const targetLeads = customLeads || processedLeads;
    const headers = [
      'Lead ID',
      'Lead Number',
      'Customer Name',
      'Company Name',
      'Phone',
      'Email',
      'City',
      'State',
      'Product / Requirement',
      'Source',
      'Priority',
      'Stage / Status',
      'Assigned Executive',
      'Estimated Value (INR)',
      'Created Date',
      'Next Follow-up',
      'Notes',
    ];

    const rows = targetLeads.map((l) => [
      l.id,
      l.leadNumber,
      l.customerName,
      l.companyName,
      l.phone,
      l.email || '',
      l.city,
      l.state,
      l.productService || l.productRequirement || l.requirement || '',
      l.source.toUpperCase(),
      l.priority.toUpperCase(),
      l.status.replace(/_/g, ' ').toUpperCase(),
      l.assignedEmployeeName,
      l.estimatedValue || 0,
      formatDate(l.createdAt),
      l.nextFollowUp ? formatDate(l.nextFollowUp) : 'None',
      (l.notes || '').replace(/[\t\n\r]/g, ' '),
    ]);

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
          <style>
            th { background-color: #059669; color: #ffffff; font-weight: bold; padding: 6px; border: 1px solid #d1d5db; }
            td { padding: 4px; border: 1px solid #e5e7eb; font-family: Arial, sans-serif; font-size: 11px; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LeadFlow_Leads_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${targetLeads.length} leads to Excel (.xls)`);
  };

  // Download Sample Template for Bulk Import / Update
  const downloadSampleTemplate = (format: 'csv' | 'excel') => {
    const headers = [
      'Lead ID',
      'Customer Name',
      'Company Name',
      'Phone',
      'Email',
      'City',
      'Product Requirement',
      'Source',
      'Priority',
      'Status',
      'Assigned Sales Executive',
      'Estimated Value',
      'Notes',
    ];

    const sampleRows = [
      [
        'LF-1001',
        'Manoj Sharma',
        'Sharma Industrial Solutions',
        '+91 98260 11223',
        'manoj@sharmasolutions.in',
        'Indore',
        'Submersible Industrial Water Pumps 15HP',
        'indiamart',
        'urgent',
        'quotation_sent',
        'Rahul Sharma',
        '850000',
        'Updated specs: Client requested high-grade stainless steel impellers',
      ],
      [
        'NEW',
        'Vikramaditya Solanki',
        'Solanki CNC Automation Works',
        '+91 98930 44556',
        'vikram@solankicnc.co.in',
        'Bhopal',
        '5-Axis CNC Milling Center VMC-850',
        'justdial',
        'high',
        'contacted',
        'Rahul Sharma',
        '1450000',
        'High priority buyer from Justdial push - requires delivery in 4 weeks',
      ],
      [
        'NEW',
        'Sunita Deshmukh',
        'Deshmukh Pharma Packaging Ltd',
        '+91 98220 77889',
        'sunita@deshmukhpharma.com',
        'Pune',
        'Automatic Rotary Blister Packing Machine',
        'website',
        'indiamart',
        'medium',
        'qualified',
        'Priya Nair',
        '1200000',
        'Inbound inquiry via website catalog - technical brochure dispatched',
        'Inbound inquiry via IndiaMART catalog - technical brochure dispatched',
      ],
    ];

    if (format === 'csv') {
      const csvContent =
        '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'LeadFlow_Bulk_Import_Sample_Template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Downloaded Sample CSV Template');
    } else {
      const tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
            <style>
              th { background-color: #059669; color: #ffffff; font-weight: bold; padding: 6px; border: 1px solid #d1d5db; }
              td { padding: 4px; border: 1px solid #e5e7eb; font-family: Arial, sans-serif; font-size: 11px; }
            </style>
          </head>
          <body>
            <table>
              <thead>
                <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${sampleRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'LeadFlow_Bulk_Import_Sample_Template.xls';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Downloaded Sample Excel (.xls) Template');
    }
  };

  // Parse uploaded CSV/Excel file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (lines.length < 2) {
          toast.error('File must contain at least 1 header row and 1 data row');
          setIsParsing(false);
          return;
        }

        const parseRow = (rowStr: string) => {
          const isTab = file.name.endsWith('.tsv') || (!rowStr.includes(',') && rowStr.includes('\t'));
          const delimiter = isTab ? '\t' : ',';
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < rowStr.length; i++) {
            const char = rowStr[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              result.push(current.trim().replace(/^["']|["']$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          return result;
        };

        const rawHeaders = parseRow(lines[0]).map((h) => h.toLowerCase().trim());
        const colIndex = {
          id: rawHeaders.findIndex((h) => h.includes('id') || h.includes('lead number') || h.includes('lead id')),
          name: rawHeaders.findIndex((h) => h.includes('customer') || h.includes('contact') || h.includes('name')),
          company: rawHeaders.findIndex((h) => h.includes('company') || h.includes('firm') || h.includes('org')),
          phone: rawHeaders.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('contact no')),
          email: rawHeaders.findIndex((h) => h.includes('email') || h.includes('mail')),
          city: rawHeaders.findIndex((h) => h.includes('city') || h.includes('location') || h.includes('town')),
          product: rawHeaders.findIndex((h) => h.includes('product') || h.includes('service') || h.includes('requirement') || h.includes('item')),
          source: rawHeaders.findIndex((h) => h.includes('source') || h.includes('channel')),
          priority: rawHeaders.findIndex((h) => h.includes('priority') || h.includes('urgency')),
          status: rawHeaders.findIndex((h) => h.includes('status') || h.includes('stage')),
          assigned: rawHeaders.findIndex((h) => h.includes('assigned') || h.includes('rep') || h.includes('executive')),
          value: rawHeaders.findIndex((h) => h.includes('value') || h.includes('budget') || h.includes('amount') || h.includes('inr')),
          notes: rawHeaders.findIndex((h) => h.includes('note') || h.includes('remark') || h.includes('comment')),
        };

        const parsedRows: any[] = [];
        let updateCount = 0;
        let newCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = parseRow(lines[i]);
          if (cols.length === 0 || cols.every((c) => !c)) continue;

          const rowId = colIndex.id !== -1 ? cols[colIndex.id] : '';
          const phone = colIndex.phone !== -1 ? cols[colIndex.phone] : '';
          const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

          const isExisting = leads.some(
            (l) =>
              (rowId && (l.id.toLowerCase() === rowId.toLowerCase() || l.leadNumber.toLowerCase() === rowId.toLowerCase())) ||
              (cleanPhone && cleanPhone.length === 10 && (l.phone || '').replace(/\D/g, '').slice(-10) === cleanPhone)
          );

          if (isExisting) updateCount++;
          else newCount++;

          parsedRows.push({
            id: rowId,
            customerName: colIndex.name !== -1 ? cols[colIndex.name] : '',
            companyName: colIndex.company !== -1 ? cols[colIndex.company] : '',
            phone: phone,
            email: colIndex.email !== -1 ? cols[colIndex.email] : '',
            city: colIndex.city !== -1 ? cols[colIndex.city] : '',
            productService: colIndex.product !== -1 ? cols[colIndex.product] : '',
            productRequirement: colIndex.product !== -1 ? cols[colIndex.product] : '',
            source: colIndex.source !== -1 ? cols[colIndex.source].toLowerCase().replace(/\s+/g, '_') : 'manual',
            priority: colIndex.priority !== -1 ? cols[colIndex.priority].toLowerCase() : 'medium',
            status: colIndex.status !== -1 ? cols[colIndex.status].toLowerCase().replace(/\s+/g, '_') : 'new',
            assignedEmployeeName: colIndex.assigned !== -1 ? cols[colIndex.assigned] : '',
            estimatedValue: colIndex.value !== -1 ? Number(cols[colIndex.value].replace(/[^0-9.]/g, '')) || 250000 : 250000,
            notes: colIndex.notes !== -1 ? cols[colIndex.notes] : '',
            isExisting,
          });
        }

        setParsedImportData(parsedRows);
        setImportStats({
          total: parsedRows.length,
          toUpdate: updateCount,
          toCreate: newCount,
        });
        toast.success(`Parsed ${parsedRows.length} records (${updateCount} updates, ${newCount} new leads)`);
      } catch (err) {
        toast.error('Failed to parse file. Please use the sample template format.');
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  // Apply Bulk Import / Update
  const handleApplyBulkImport = () => {
    if (parsedImportData.length === 0) return;
    bulkImportLeads(parsedImportData);
    setIsBulkImportOpen(false);
    setParsedImportData([]);
    setImportFileName('');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(paginatedLeads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLeadIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const openCreateModal = () => {
    setEditingLead(null);
    setFormData({
      customerName: '',
      companyName: '',
      phone: '',
      alternatePhone: '',
      email: '',
      productService: 'Industrial Water Pumps',
      requirement: '',
      quantity: '1 Unit',
      city: 'Indore',
      state: 'Madhya Pradesh',
      country: 'India',
      source: 'indiamart',
      priority: 'medium',
      status: 'new',
      estimatedValue: 450000,
      assignedTo: employees[0]?.id || '',
      notes: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({ ...lead });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone) {
      toast.error('Customer name and Phone number are required');
      return;
    }

    const assignedEmp = employees.find((e) => e.id === formData.assignedTo);
    const assignedEmployeeName = assignedEmp ? assignedEmp.fullName : employees[0]?.fullName || 'Rahul Sharma';

    if (editingLead) {
      updateLead(editingLead.id, {
        ...formData,
        assignedEmployeeName,
      });
    } else {
      createLead({
        ...formData,
        assignedEmployeeName,
      });
    }
    setIsFormModalOpen(false);
  };

  const handleAddRemark = () => {
    if (!newRemark || !selectedLead) return;
    const now = new Date().toISOString();
    updateLead(selectedLead.id, {
      notes: `${selectedLead.notes ? selectedLead.notes + '\n\n' : ''}[${formatDateTime(now)}] ${newRemark}`,
    });
    setNewRemark('');
    toast.success('Remark added to customer enquiry timeline');
  };

  const handleScheduleFollowUpFromDetail = () => {
    if (!selectedLead) return;
    createTask({
      taskTitle: newFollowUpDesc || `Follow-up call with ${selectedLead.customerName}`,
      taskType: 'followup_call',
      relatedLeadId: selectedLead.id,
      relatedLeadNumber: selectedLead.leadNumber,
      customerName: selectedLead.customerName,
      companyName: selectedLead.companyName,
      phone: selectedLead.phone,
      assignedTo: selectedLead.assignedTo,
      assignedEmployeeName: selectedLead.assignedEmployeeName,
      dueDate: newFollowUpDate,
      dueTime: newFollowUpTime,
      priority: selectedLead.priority,
      description: newFollowUpDesc,
      status: 'pending',
    });
    setNewFollowUpDesc('');
    toast.success('Follow-up scheduled and synced with calendar');
  };

  return (
    <AppShell>
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Lead Management Workspace
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {leads.length} Total Enquiries
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ingest, track, assign and convert business leads from IndiaMART, Justdial and marketing forms
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {can('create', 'leads') && (
            <button
              onClick={() => {
                setIsBulkImportOpen(true);
                setImportFileName('');
                setParsedImportData([]);
                setImportStats({ total: 0, toUpdate: 0, toCreate: 0 });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors shadow-xs cursor-pointer"
              title="Bulk Update or Import Leads using CSV or Excel"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Bulk Update / Import (CSV/Excel)</span>
            </button>
          )}
          <button
            onClick={() => handleExportExcel()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
            title="Export filtered leads to Microsoft Excel (.xls)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => handleExportCSV()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
            title="Export filtered leads to CSV"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </button>
          {can('create', 'leads') && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER BAR & SEARCH */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search leads, phone, city..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="all">All Sources</option>
              <option value="indiamart">IndiaMART</option>
              <option value="justdial">Justdial</option>
              <option value="website">Website Forms</option>
              <option value="facebook_instagram">Meta Ads</option>
              <option value="google_ads">Google Ads</option>
              <option value="referral">Referrals</option>
              <option value="manual">Manual Direct</option>
            </select>
          </div>

          {/* Assigned Employee Filter */}
          <div>
            <select
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="all">All Assigned Reps</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="all">All Pipeline Stages</option>
              <option value="new">New (Uncontacted)</option>
              <option value="assigned">Assigned</option>
              <option value="contact_attempted">Contact Attempted</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="quotation_sent">Quotation Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won (Converted)</option>
              <option value="lost">Lost</option>
              <option value="nurture">Nurture / On Hold</option>
              <option value="disqualified">Disqualified</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (Visible when rows selected) */}
        {selectedLeadIds.length > 0 && (
          <div className="pt-2 border-t border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg">
            <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{selectedLeadIds.length} leads selected</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground text-[11px]">Bulk Actions:</span>

              <button
                onClick={() => {
                  const selected = leads.filter((l) => selectedLeadIds.includes(l.id));
                  handleExportExcel(selected);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-card text-xs hover:bg-muted font-medium text-foreground"
                title="Export selected leads to Excel (.xls)"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Export Selected (Excel)</span>
              </button>

              <button
                onClick={() => {
                  const selected = leads.filter((l) => selectedLeadIds.includes(l.id));
                  handleExportCSV(selected);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-card text-xs hover:bg-muted font-medium text-foreground"
                title="Export selected leads to CSV"
              >
                <Download className="w-3 h-3 text-muted-foreground" />
                <span>Export Selected (CSV)</span>
              </button>

              <select
                value={bulkActionTargetEmp}
                onChange={(e) => setBulkActionTargetEmp(e.target.value)}
                className="px-2 py-1 rounded border border-border bg-card text-xs ml-1"
              >
                <option value="">Reassign To Rep...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
              <button
                disabled={!bulkActionTargetEmp}
                onClick={() => {
                  bulkAssignLeads(selectedLeadIds, bulkActionTargetEmp);
                  setSelectedLeadIds([]);
                }}
                className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold disabled:opacity-40"
              >
                Apply Reassignment
              </button>

              <select
                value={bulkActionTargetStatus}
                onChange={(e) => setBulkActionTargetStatus(e.target.value as LeadStatus)}
                className="px-2 py-1 rounded border border-border bg-card text-xs ml-1"
              >
                <option value="contacted">Mark Contacted</option>
                <option value="qualified">Mark Qualified</option>
                <option value="lost">Mark Lost</option>
              </select>
              <button
                onClick={() => {
                  bulkUpdateLeadStatus(selectedLeadIds, bulkActionTargetStatus);
                  setSelectedLeadIds([]);
                }}
                className="px-2.5 py-1 rounded bg-card border border-border font-semibold hover:bg-muted"
              >
                Update Status
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LEADS DATA TABLE */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      paginatedLeads.length > 0 &&
                      paginatedLeads.every((l) => selectedLeadIds.includes(l.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border"
                  />
                </th>
                <th className="py-3 px-3">Lead ID</th>
                <th className="py-3 px-3">Customer & Company</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Product / Service</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Assigned Rep</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Next Follow-up</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto opacity-30 mb-2" />
                    <p className="font-semibold text-sm">No leads match current filter criteria</p>
                    <p className="text-xs text-muted-foreground/70">
                      Try clearing search keywords or resetting source filters
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-muted/40 transition-colors group ${isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(lead.id)}
                          className="rounded border-border"
                        />
                      </td>

                      {/* Lead Number */}
                      <td className="py-3 px-3 font-mono font-semibold text-foreground whitespace-nowrap">
                        <button
                          onClick={() => setViewingLeadId(lead.id)}
                          className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                        >
                          {lead.leadNumber}
                        </button>
                        {lead.isDuplicateFlagged && (
                          <span
                            title="Potential duplicate contact detected"
                            className="ml-1.5 px-1 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold"
                          >
                            DUP
                          </span>
                        )}
                      </td>

                      {/* Customer Name & Company */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">{lead.customerName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{lead.companyName}</span>
                          <span className="text-muted-foreground/60">• {lead.city}</span>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-foreground font-medium">{lead.phone}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {lead.email}
                        </div>
                      </td>

                      {/* Product Service */}
                      <td className="py-3 px-3 max-w-[150px]">
                        <div className="font-semibold text-foreground truncate">
                          {lead.productService}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {lead.requirement}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            lead.source === 'indiamart'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {lead.source === 'indiamart' ? 'IndiaMART' : 'Justdial'}
                        </span>
                        {lead.sourceEnquiryId && (
                          <div className="text-[9px] font-mono text-muted-foreground/80 mt-0.5">
                            {lead.sourceEnquiryId}
                          </div>
                        )}
                      </td>

                      {/* Assigned Employee */ }
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-medium text-foreground">{lead.assignedEmployeeName}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatCurrency(lead.estimatedValue)}
                    </div>
                  </td>

                  {/* Priority */ }
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${lead.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-extrabold'
                        : lead.priority === 'high'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : lead.priority === 'medium'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {lead.priority}
                    </span>
                  </td>

                  {/* Status */ }
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${lead.status === 'won'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : lead.status === 'lost'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : lead.status === 'negotiation' || lead.status === 'quotation_sent'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : lead.status === 'new'
                              ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                              : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Next Follow-up */ }
                  <td className="py-3 px-3 whitespace-nowrap text-muted-foreground">
                    {lead.nextFollowUp ? (
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>{formatDate(lead.nextFollowUp)}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">None set</span>
                    )}
                  </td>

                  {/* Actions with Direct WhatsApp and Direct Call */ }
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Direct WhatsApp Action Button */}
                      <button
                        onClick={() => openQuickWhatsApp(lead)}
                        className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all shadow-xs"
                        title={`Chat on WhatsApp with ${lead.customerName} (${lead.phone})`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-emerald-100 dark:fill-emerald-950" />
                      </button>

                      {/* Direct Voice Call Action Button */}
                      <button
                        onClick={() => openQuickCall(lead)}
                        className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all shadow-xs"
                        title={`Call ${lead.customerName} (${lead.phone})`}
                      >
                        <Phone className="w-3.5 h-3.5 fill-blue-100 dark:fill-blue-950" />
                      </button>

                      {/* View Full Profile Drawer */}
                      <button
                        onClick={() => setViewingLeadId(lead.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-muted transition-colors cursor-pointer"
                        title="View Full Lead Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Lead - Guarded by RBAC */}
                      {can('edit', 'leads') && (
                        <button
                          onClick={() => openEditModal(lead)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-blue-600 hover:bg-muted transition-colors cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Lead - Guarded strictly to Super Admin and Admin */}
                      {can('delete', 'leads') && (
                        <button
                          onClick={() => setLeadToDelete(lead)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-muted transition-colors cursor-pointer"
                          title="Delete Lead (Admin Only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                    </tr>
            );
                })
              )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
        <div>
          Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
          <strong>{Math.min(currentPage * pageSize, processedLeads.length)}</strong> of{' '}
          <strong>{processedLeads.length}</strong> matching leads
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

      {/* LEAD PROFILE DETAIL DRAWER / MODAL (7 TABS) */ }
  {
    selectedLead && (
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-border bg-muted/20 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {selectedLead.leadNumber}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-card border border-border">
                  {selectedLead.source}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                  {selectedLead.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground">{selectedLead.customerName}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{selectedLead.companyName}</span>
                <span>• {selectedLead.city}, {selectedLead.state}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(selectedLead)}
                className="p-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewingLeadId(null)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Ribbon inside Drawer */}
          <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedLead.phone}`}
                onClick={() =>
                  addCommunicationMessage(selectedLead.phone, {
                    channel: 'call',
                    content: `Outgoing voice call initiated to ${selectedLead.customerName} (${selectedLead.phone})`,
                    status: 'completed',
                    callDurationSeconds: 120,
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Click to Call</span>
              </a>
              <a
                href={`https://wa.me/91${selectedLead.phone.slice(-10)}?text=${encodeURIComponent(
                  `Namaste ${selectedLead.customerName} ji, FlowTech Machinery rep following up on your ${selectedLead.productService} enquiry.`
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  addCommunicationMessage(selectedLead.phone, {
                    channel: 'whatsapp',
                    content: `WhatsApp message initiated: Follow-up for ${selectedLead.productService}`,
                    status: 'delivered',
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {selectedLead.status !== 'won' && (
              <button
                onClick={() => {
                  convertLeadToCustomerAndOrder(selectedLead.id);
                  setViewingLeadId(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Won & Convert</span>
              </button>
            )}
          </div>

          {/* 7 Profile Tabs */}
          <div className="flex items-center border-b border-border px-4 overflow-x-auto gap-2 bg-muted/10">
            {[
              { id: 'overview', label: '1. Overview' },
              { id: 'activities', label: '2. Activities' },
              { id: 'communication', label: '3. Communication' },
              { id: 'followups', label: '4. Follow-ups' },
              { id: 'quotations', label: '5. Quotations' },
              { id: 'history', label: '6. Timeline History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id as any)}
                className={`py-3 px-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${activeProfileTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Drawer Body Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: OVERVIEW */}
            {activeProfileTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Stats Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-border bg-card">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                      Estimated Deal Value
                    </span>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(selectedLead.estimatedValue)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-card">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                      Assigned Executive
                    </span>
                    <div className="text-xs font-bold text-foreground">
                      {selectedLead.assignedEmployeeName}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-card">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                      Priority Level
                    </span>
                    <div className="text-xs font-bold text-foreground uppercase">
                      {selectedLead.priority}
                    </div>
                  </div>
                </div>

                {/* Enquiry Requirement Box */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Buyer Requirement & Specifications
                  </h4>
                  <p className="text-xs text-foreground bg-muted/40 p-3 rounded-lg leading-relaxed">
                    {selectedLead.requirement}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                    <div>
                      Product Line: <strong>{selectedLead.productService}</strong>
                    </div>
                    <div>
                      Order Quantity: <strong>{selectedLead.quantity || '1 Unit'}</strong>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Verified Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Primary Phone</span>
                      <span className="font-mono font-semibold">{selectedLead.phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Email Address</span>
                      <span className="font-semibold">{selectedLead.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Location</span>
                      <span className="font-semibold">{selectedLead.city}, {selectedLead.state}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Source Enquiry ID</span>
                      <span className="font-mono font-semibold">{selectedLead.sourceEnquiryId || 'Direct'}</span>
                    </div>
                  </div>
                </div>

                {/* Internal Notes & Remarks */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Internal Executive Remarks
                  </h4>
                  {selectedLead.notes ? (
                    <p className="text-xs text-muted-foreground whitespace-pre-line bg-muted/20 p-3 rounded-lg border border-border/50">
                      {selectedLead.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic">No remarks recorded yet.</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newRemark}
                      onChange={(e) => setNewRemark(e.target.value)}
                      placeholder="Add call notes or update remarks..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                    />
                    <button
                      onClick={handleAddRemark}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                    >
                      Add Remark
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVITIES */}
            {activeProfileTab === 'activities' && (
              <div className="space-y-4">
                <div className="border-l-2 border-emerald-500 pl-4 space-y-4">
                  <div className="relative space-y-1">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-card" />
                    <div className="text-xs font-bold text-foreground">Enquiry Received from {selectedLead.source.toUpperCase()}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Source enquiry ID: {selectedLead.sourceEnquiryId || 'N/A'} • {formatDateTime(selectedLead.createdAt)}
                    </div>
                  </div>

                  <div className="relative space-y-1">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-card" />
                    <div className="text-xs font-bold text-foreground">Auto-assigned to {selectedLead.assignedEmployeeName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Assignment engine rule executed • Workload updated
                    </div>
                  </div>

                  {selectedLead.status === 'won' && (
                    <div className="relative space-y-1">
                      <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-card" />
                      <div className="text-xs font-bold text-emerald-600">Deal Closed & Converted to Customer!</div>
                      <div className="text-[11px] text-muted-foreground">
                        Order placed for {formatCurrency(selectedLead.estimatedValue)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: COMMUNICATION */}
            {activeProfileTab === 'communication' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Send Quick WhatsApp Follow-up</h4>
                  <p className="text-xs text-muted-foreground">
                    Template: Standard Product Spec & Price Discussion
                  </p>
                  <textarea
                    rows={3}
                    defaultValue={`Namaste ${selectedLead.customerName} ji, I am contacting you from FlowTech Machinery regarding your inquiry for ${selectedLead.productService}. When would be a convenient time for a brief 5-minute technical discussion?`}
                    className="w-full p-2.5 rounded-lg border border-border bg-muted/20 text-xs font-sans"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        addCommunicationMessage(selectedLead.phone, {
                          channel: 'whatsapp',
                          content: `WhatsApp sent to ${selectedLead.customerName} for ${selectedLead.productService}`,
                          status: 'delivered',
                        });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Message (Simulated)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FOLLOW-UPS */}
            {activeProfileTab === 'followups' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Schedule Next Task / Follow-up</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Due Date</label>
                      <input
                        type="date"
                        value={newFollowUpDate}
                        onChange={(e) => setNewFollowUpDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Due Time</label>
                      <input
                        type="time"
                        value={newFollowUpTime}
                        onChange={(e) => setNewFollowUpTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Agenda / Follow-up Purpose</label>
                    <input
                      type="text"
                      value={newFollowUpDesc}
                      onChange={(e) => setNewFollowUpDesc(e.target.value)}
                      placeholder="e.g. Discuss commercial proposal discount..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleScheduleFollowUpFromDetail}
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                    >
                      Schedule Task
                    </button>
                  </div>
                </div>

                {/* Existing tasks for this lead */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase text-muted-foreground">Linked Follow-ups</h5>
                  {tasks.filter((t) => t.relatedLeadId === selectedLead.id).map((t) => (
                    <div key={t.id} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-foreground">{t.taskTitle}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Due: {t.dueDate} at {t.dueTime} • Status: <span className="uppercase font-bold">{t.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: QUOTATIONS */}
            {activeProfileTab === 'quotations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Quotations for this enquiry</h4>
                </div>
                {quotations.filter((q) => q.relatedLeadId === selectedLead.id).length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                    <FileText className="w-8 h-8 mx-auto opacity-30 mb-1" />
                    <p className="text-xs">No quotation created yet for this lead.</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      Navigate to Quotations module to generate formal proposal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quotations.filter((q) => q.relatedLeadId === selectedLead.id).map((q) => (
                      <div key={q.id} className="p-3 rounded-xl border border-border bg-card flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-foreground">{q.quotationNumber} (v{q.version})</div>
                          <div className="text-[11px] text-muted-foreground">
                            Status: <span className="font-bold uppercase text-emerald-600">{q.status}</span> • Valid until {q.validUntil}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{formatCurrency(q.grandTotal)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: HISTORY */}
            {activeProfileTab === 'history' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground font-mono text-[10px]">Created: {formatDateTime(selectedLead.createdAt)}</span>
                  <p className="font-medium mt-1">Lead record initialized in LeadFlow CRM from {selectedLead.source.toUpperCase()}.</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground font-mono text-[10px]">Updated: {formatDateTime(selectedLead.updatedAt)}</span>
                  <p className="font-medium mt-1">Current stage set to {selectedLead.status.toUpperCase()}.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  {/* CREATE / EDIT LEAD MODAL */ }
  {
    isFormModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-base font-bold text-foreground">
              {editingLead ? `Edit Lead: ${editingLead.leadNumber}` : 'Create New Customer Lead'}
            </h3>
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Phone (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Product / Service
                </label>
                <select
                  value={formData.productService}
                  onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs"
                >
                  <option value="Industrial Water Pumps">Industrial Water Pumps</option>
                  <option value="CNC Machines">CNC Machines</option>
                  <option value="Heavy Hydraulic Presses">Heavy Hydraulic Presses</option>
                  <option value="Electrical Equipment">Electrical Equipment</option>
                  <option value="Industrial Motors">Industrial Motors</option>
                  <option value="Solar Water Pumps">Solar Water Pumps</option>
                  <option value="Precision Lathe Machines">Precision Lathe Machines</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Lead Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs"
                >
                  <option value="indiamart">IndiaMART</option>
                  <option value="justdial">Justdial</option>
                  <option value="website">Website</option>
                  <option value="facebook_instagram">Meta Ads</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="referral">Referral</option>
                  <option value="manual">Manual Direct</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Assign To
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs font-semibold"
                >
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="contact_attempted">Contact Attempted</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="quotation_sent">Quotation Sent</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="nurture">Nurture</option>
                  <option value="disqualified">Disqualified</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as LeadPriority })}
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Est. Deal Value (₹)
                </label>
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Requirement / Notes</label>
              <textarea
                rows={2}
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Save Lead Record
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  {/* DELETE CONFIRMATION DIALOG */ }
  {
    leadToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-foreground">Delete Lead Confirmation</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete lead{' '}
              <strong>{leadToDelete.leadNumber}</strong> ({leadToDelete.customerName} - {leadToDelete.companyName})?
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setLeadToDelete(null)}
              className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteLead(leadToDelete.id);
                setLeadToDelete(null);
                if (viewingLeadId === leadToDelete.id) setViewingLeadId(null);
              }}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* QUICK WHATSAPP MODAL */ }
  {
    quickWhatsAppLead && (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Chat on WhatsApp</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                    +91 {quickWhatsAppLead.phone.replace(/\D/g, '').slice(-10)}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {quickWhatsAppLead.customerName} &bull; {quickWhatsAppLead.companyName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setQuickWhatsAppLead(null)}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Template Selector Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Select Pre-Approved Template:
            </label>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleApplyTemplate('intro')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${activeTemplateKey === 'intro'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-border bg-muted/40 hover:bg-muted text-foreground'
                  }`}
              >
                👋 Initial Greeting
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('quotation')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${activeTemplateKey === 'quotation'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-border bg-muted/40 hover:bg-muted text-foreground'
                  }`}
              >
                📑 Quotation Follow-up
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('visit')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${activeTemplateKey === 'visit'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-border bg-muted/40 hover:bg-muted text-foreground'
                  }`}
              >
                🏭 Plant Demo / Visit
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('delivery')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${activeTemplateKey === 'delivery'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-border bg-muted/40 hover:bg-muted text-foreground'
                  }`}
              >
                🚚 Dispatch / Invoice
              </button>
            </div>
          </div>

          {/* Message Area */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Message Content (WhatsApp Web / Mobile App):
            </label>
            <textarea
              rows={4}
              value={whatsAppText}
              onChange={(e) => setWhatsAppText(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
              placeholder="Type WhatsApp message..."
            />
            <p className="text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Directly opens WhatsApp Web / Mobile app with this pre-filled message.</span>
              <span>TRAI Opt-in Verified</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setQuickWhatsAppLead(null)}
              className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white" />
              <span>Launch WhatsApp & Log Activity</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* QUICK CALL DIALER & LOG MODAL */ }
  {
    quickCallLead && (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-pulse">
                <Phone className="w-5 h-5 fill-blue-100 dark:fill-blue-950" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Active Voice Call Dialer</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono">
                    {quickCallLead.phone}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {quickCallLead.customerName} &bull; {quickCallLead.companyName} ({quickCallLead.city})
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setQuickCallLead(null);
                setCallTimerActive(false);
              }}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Timer & Direct Device Call Banner */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-foreground">Call In Progress:</span>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatSeconds(callDuration)}
              </span>
            </div>
            <a
              href={`tel:${quickCallLead.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Trigger physical mobile phone dialer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial on Device (tel:)</span>
            </a>
          </div>

          {/* Call Disposition */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Select Call Outcome / Disposition:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'requirement_gathered', label: 'Requirement Discussed' },
                { id: 'quotation_requested', label: 'Quotation Requested' },
                { id: 'callback_requested', label: 'Call Back Later' },
                { id: 'busy', label: 'Line Busy' },
                { id: 'not_reachable', label: 'Not Reachable' },
                { id: 'wrong_number', label: 'Wrong Number' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCallDisposition(item.id)}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors text-left ${callDisposition === item.id
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                    : 'border-border bg-card hover:bg-muted text-foreground'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Call Discussion Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Call Discussion Summary & Remarks:
            </label>
            <textarea
              rows={3}
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="E.g. Discussed 15HP Submersible pump specs. Requested 5% discount on bulk order of 4 units..."
              className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setQuickCallLead(null);
                setCallTimerActive(false);
              }}
              className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
            >
              Discard Call
            </button>
            <button
              type="button"
              onClick={handleCompleteCall}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Call Log ({formatSeconds(callDuration)})</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* BULK IMPORT & UPDATE MODAL (CSV & EXCEL) */ }
  {
    isBulkImportOpen && (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Bulk Lead Update & Import</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    CSV & Excel (.xls)
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload spreadsheet to create new leads or bulk-update existing leads by Lead ID or Phone
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBulkImportOpen(false)}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* How It Works Banner */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>How Bulk Update Works:</span>
            </div>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-[11px] leading-relaxed">
              <li>
                <strong className="text-foreground">To UPDATE existing leads:</strong> Include the <code>Lead ID</code> (e.g. <code>LF-1001</code>) or existing 10-digit phone number. Matching records will update their stage, priority, assigned rep, notes, and requirements.
              </li>
              <li>
                <strong className="text-foreground">To CREATE new leads:</strong> Leave <code>Lead ID</code> blank or write <code>NEW</code>. They will be added as fresh enquiries.
              </li>
            </ul>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-medium text-foreground">Download Sample Templates:</span>
              <button
                type="button"
                onClick={() => downloadSampleTemplate('excel')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-medium text-[11px] hover:bg-emerald-700 shadow-xs"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Sample Excel (.xls)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadSampleTemplate('csv')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground"
              >
                <Download className="w-3 h-3 text-muted-foreground" />
                <span>Sample CSV</span>
              </button>
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Select CSV or Excel Spreadsheet File:
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-muted/10">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">
                {importFileName ? (
                  <span className="text-emerald-600 font-bold">{importFileName}</span>
                ) : (
                  'Click to browse or drag and drop your file here'
                )}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Supports .csv, .xls, .xlsx, .tsv, .txt
              </p>
              <input
                type="file"
                accept=".csv, .xlsx, .xls, .tsv, .txt"
                onChange={handleFileUpload}
                className="mt-3 text-xs block mx-auto text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:text-xs file:font-semibold file:bg-card file:text-foreground hover:file:bg-muted cursor-pointer"
              />
            </div>
          </div>

          {/* Parsed Statistics & Preview */}
          {parsedImportData.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">Parsed Data Preview:</h4>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-muted font-semibold text-foreground">
                    Total: {importStats.total}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                    To Update: {importStats.toUpdate}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                    To Create: {importStats.toCreate}
                  </span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-muted/50 border-b border-border font-bold text-muted-foreground">
                    <tr>
                      <th className="py-1.5 px-3">Action</th>
                      <th className="py-1.5 px-3">Lead ID</th>
                      <th className="py-1.5 px-3">Customer / Company</th>
                      <th className="py-1.5 px-3">Phone</th>
                      <th className="py-1.5 px-3">Product</th>
                      <th className="py-1.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {parsedImportData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {row.isExisting ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              UPDATE
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              NEW
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-mono font-medium">{row.id || 'AUTO'}</td>
                        <td className="py-1.5 px-3">
                          <span className="font-semibold text-foreground">{row.customerName}</span>
                          {row.companyName && (
                            <span className="text-muted-foreground"> ({row.companyName})</span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-muted-foreground">{row.phone}</td>
                        <td className="py-1.5 px-3 truncate max-w-[150px]">{row.productService}</td>
                        <td className="py-1.5 px-3 uppercase text-[10px] font-bold text-muted-foreground">
                          {row.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedImportData.length > 5 && (
                <p className="text-[10px] text-muted-foreground text-center">
                  ...and {parsedImportData.length - 5} more records will be processed.
                </p>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsBulkImportOpen(false)}
              className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={parsedImportData.length === 0 || isParsing}
              onClick={handleApplyBulkImport}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Confirm & Apply Bulk Processing ({parsedImportData.length} records)
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }
    </AppShell >
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">Loading leads directory...</div>}>
      <LeadsContent />
    </Suspense>
  );
}

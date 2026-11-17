'use client';

import React, { useState } from 'react';
import { X, Users, CheckSquare, Building2, FileText, Check } from 'lucide-react';
import { useCRM } from '@/store/crmStore';
import { LeadPriority, LeadSource } from '@/types';
import { toast } from 'sonner';

export function QuickCreateModal({
  isOpen,
  onClose,
  initialTab = 'lead',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'lead' | 'task' | 'customer' | 'quotation';
}) {
  const { createLead, createTask, createCustomer, createQuotation, employees, customers, leads } = useCRM();
  const [activeTab, setActiveTab] = useState<'lead' | 'task' | 'customer' | 'quotation'>(initialTab);

  // Form states
  const [leadForm, setLeadForm] = useState({
    customerName: '',
    companyName: '',
    phone: '',
    email: '',
    productService: 'Industrial Water Pumps',
    requirement: '',
    quantity: '1 Unit',
    city: 'Indore',
    state: 'Madhya Pradesh',
    source: 'indiamart' as LeadSource,
    priority: 'medium' as LeadPriority,
    assignedTo: employees[0]?.id || '',
    estimatedValue: 350000,
    notes: '',
  });

  const [taskForm, setTaskForm] = useState({
    taskTitle: '',
    customerName: '',
    phone: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '11:00',
    priority: 'high' as LeadPriority,
    description: '',
    assignedTo: employees[0]?.id || '',
  });

  const [customerForm, setCustomerForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    gstin: '',
    address: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.customerName || !leadForm.phone) {
      toast.error('Customer name and mobile number are required');
      return;
    }
    const assignedEmp = employees.find((emp) => emp.id === leadForm.assignedTo);
    createLead({
      ...leadForm,
      assignedEmployeeName: assignedEmp?.fullName || employees[0]?.fullName,
    });
    onClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.taskTitle || !taskForm.customerName) {
      toast.error('Task title and customer name are required');
      return;
    }
    const assignedEmp = employees.find((emp) => emp.id === taskForm.assignedTo);
    createTask({
      ...taskForm,
      assignedEmployeeName: assignedEmp?.fullName || employees[0]?.fullName,
      taskType: 'followup_call',
      status: 'pending',
    });
    onClose();
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.company || !customerForm.phone) {
      toast.error('Name, Company and Phone are required');
      return;
    }
    createCustomer({
      ...customerForm,
      customerValue: 0,
      totalOrders: 0,
      totalQuotations: 0,
      totalEnquiries: 1,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-foreground">Quick Create</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Instant
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 border-b border-border bg-muted/30 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('lead')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'lead'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>New Lead</span>
          </button>
          <button
            onClick={() => setActiveTab('task')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'task'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>New Task / Follow-up</span>
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'customer'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>New Customer</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'lead' && (
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadForm.customerName}
                    onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })}
                    placeholder="e.g. Anand Mahindra"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={leadForm.companyName}
                    onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                    placeholder="e.g. Mahindra Precision Works"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="9826012345"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="anand@mahindra.in"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Product / Service
                  </label>
                  <select
                    value={leadForm.productService}
                    onChange={(e) => setLeadForm({ ...leadForm, productService: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-emerald-500"
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
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value as LeadSource })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="indiamart">IndiaMART</option>
                    <option value="justdial">Justdial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">City</label>
                  <input
                    type="text"
                    value={leadForm.city}
                    onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Priority
                  </label>
                  <select
                    value={leadForm.priority}
                    onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value as LeadPriority })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Assign To
                  </label>
                  <select
                    value={leadForm.assignedTo}
                    onChange={(e) => setLeadForm({ ...leadForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Enquiry Requirement / Remarks
                </label>
                <textarea
                  rows={2}
                  value={leadForm.requirement}
                  onChange={(e) => setLeadForm({ ...leadForm, requirement: e.target.value })}
                  placeholder="e.g. Looking for 3 units with SS impellers..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                >
                  Save Lead
                </button>
              </div>
            </form>
          )}

          {activeTab === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.taskTitle}
                  onChange={(e) => setTaskForm({ ...taskForm, taskTitle: e.target.value })}
                  placeholder="e.g. Follow-up on quotation discount"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Customer / Prospect Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={taskForm.customerName}
                    onChange={(e) => setTaskForm({ ...taskForm, customerName: e.target.value })}
                    placeholder="e.g. Ketan Patel"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={taskForm.phone}
                    onChange={(e) => setTaskForm({ ...taskForm, phone: e.target.value })}
                    placeholder="9826110002"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Due Time</label>
                  <input
                    type="time"
                    required
                    value={taskForm.dueTime}
                    onChange={(e) => setTaskForm({ ...taskForm, dueTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Assignee</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Details / Agenda</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Add notes for this follow-up call..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          )}

          {activeTab === 'customer' && (
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="e.g. Sunil Mehta"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerForm.company}
                    onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                    placeholder="e.g. Sunrise Manufacturing"
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
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="9826110004"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="sunil@sunrisemfg.com"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">City</label>
                  <input
                    type="text"
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={customerForm.gstin}
                    onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
                    placeholder="23AABCS1429B1Z8"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  Create Customer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

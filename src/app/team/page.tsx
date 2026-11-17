'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { Employee, UserRole } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  UserCheck,
  Plus,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Edit3,
  X,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamManagementPage() {
  const {
    scopedEmployees: employees,
    scopedLeads: leads,
    scopedTasks: tasks,
    scopedOrders: orders,
    normalizedRole,
    can,
    updateEmployee,
    createEmployee
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Selected Employee for Detail Drawer
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'Sales' as 'Sales' | 'Management' | 'Technical' | 'Customer Support' | 'Executive Management',
    role: 'executive' as UserRole,
    managerName: 'Rajesh Kulkarni',
    status: 'active' as 'active' | 'on_leave' | 'inactive',
  });

  const filteredEmployees = employees.filter((emp) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (
        !emp.fullName.toLowerCase().includes(q) &&
        !emp.email.toLowerCase().includes(q) &&
        !emp.employeeId.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (selectedDepartment !== 'all' && emp.department !== selectedDepartment) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingEmp(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '+91 98260 ',
      department: 'Sales',
      role: 'executive',
      managerName: 'Rajesh Kulkarni',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      role: emp.role,
      managerName: emp.managerName || 'Rajesh Kulkarni',
      status: emp.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.error('Full name and email are required');
      return;
    }

    if (editingEmp) {
      updateEmployee(editingEmp.id, {
        ...formData,
      });
    } else {
      createEmployee({
        ...formData,
      });
    }
    setIsModalOpen(false);
  };

  // Get active leads for selected employee
  const employeeLeads = selectedEmployee ? leads.filter((l) => l.assignedTo === selectedEmployee.id) : [];
  const employeeTasks = selectedEmployee ? tasks.filter((t) => t.assignedTo === selectedEmployee.id) : [];
  const employeeOrders = selectedEmployee ? orders.filter((o) => o.assignedSalesExecutiveId === selectedEmployee.id) : [];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Team Management & Workload Balancing
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {employees.length} Team Members
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor sales rep workloads, assign permissions, audit conversion rates and manage assignments
          </p>
        </div>

        {['super_admin', 'admin'].includes(normalizedRole) && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Employee</span>
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
              placeholder="Search employee name, ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="all">All Departments</option>
            <option value="Sales">Sales Department</option>
            <option value="Management">Management</option>
            <option value="Technical">Technical</option>
            <option value="Customer Support">Customer Support</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredEmployees.length}</strong> active members
        </div>
      </div>

      {/* EMPLOYEES GRID CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredEmployees.map((emp) => {
          const empLeads = leads.filter((l) => l.assignedTo === emp.id);
          const activeLeads = empLeads.filter((l) => !['won', 'lost', 'disqualified'].includes(l.status)).length;
          const wonCount = empLeads.filter((l) => l.status === 'won').length;
          const wonRevenue = orders
            .filter((o) => o.assignedSalesExecutiveId === emp.id)
            .reduce((sum, o) => sum + (o.orderValue || 0), 0);

          return (
            <div
              key={emp.id}
              className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header with Avatar and ID */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {emp.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-foreground leading-tight">
                        {emp.fullName}
                      </h3>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {emp.employeeId} • {emp.department}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${emp.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {emp.status}
                  </span>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-foreground uppercase text-[10px] tracking-wider">
                    {emp.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Workload Stats Box */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Active Leads</span>
                    <span className="font-bold text-foreground text-sm">{activeLeads}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Won Deals</span>
                    <span className="font-bold text-emerald-600 text-sm">{wonCount}</span>
                  </div>
                </div>

                {/* Revenue Won */}
                <div className="text-xs flex items-center justify-between text-muted-foreground pt-1">
                  <span>Revenue Won:</span>
                  <span className="font-bold text-foreground">{formatCurrency(wonRevenue)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="flex-1 py-1.5 rounded-lg bg-muted hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold transition-colors text-center"
                >
                  View Workload
                </button>
                <button
                  onClick={() => openEditModal(emp)}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted"
                  title="Edit Employee"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* WORKLOAD PROFILE DRAWER */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border bg-muted/20 flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted">
                  {selectedEmployee.employeeId}
                </span>
                <h2 className="text-base font-bold text-foreground mt-1">
                  {selectedEmployee.fullName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedEmployee.department} • Role: {selectedEmployee.role.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1 text-muted-foreground hover:bg-muted rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Assigned Active Leads ({employeeLeads.length})
              </h4>
              <div className="space-y-2">
                {employeeLeads.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-xl border border-border bg-card flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-foreground">{l.customerName} ({l.companyName})</div>
                      <div className="text-[11px] text-muted-foreground">
                        {l.productService} • Stage: <span className="font-semibold uppercase">{l.status}</span>
                      </div>
                    </div>
                    <div className="font-bold text-foreground">{formatCurrency(l.estimatedValue)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {editingEmp ? `Edit: ${editingEmp.fullName}` : 'Add New Team Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Management">Management</option>
                    <option value="Technical">Technical</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  >
                    <option value="executive">Sales Executive</option>
                    <option value="manager">Sales Manager</option>
                    <option value="admin">Administrator</option>
                    <option value="read_only">Read Only</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

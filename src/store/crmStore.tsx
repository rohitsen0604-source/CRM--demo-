'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  CRMStoreData,
  User,
  UserRole,
  Lead,
  Customer,
  FollowUpTask,
  Quotation,
  SalesOrder,
  Employee,
  IntegrationConfig,
  IntegrationEvent,
  DuplicateReviewItem,
  NotificationItem,
  AuditLogItem,
  CommunicationThread,
  AssignmentRule,
  IntegrationProvider,
  LeadSource,
  LeadStatus,
  LeadPriority,
  QuotationItem,
  CommunicationMessage,
  LeadActivity,
  RolePermissions,
  PermissionAction,
} from '@/types';
import { INITIAL_STORE_DATA, DEMO_USERS, DEFAULT_ROLE_PERMISSIONS, SEED_EMPLOYEES } from '@/data/seedData';
import { toast } from 'sonner';

export function normalizeRole(role?: string): 'super_admin' | 'admin' | 'sales_manager' | 'sales_executive' | 'read_only' {
  if (!role) return 'sales_executive';
  const r = role.toLowerCase();
  if (r === 'super_admin') return 'super_admin';
  if (r === 'admin') return 'admin';
  if (r === 'sales_manager' || r === 'manager') return 'sales_manager';
  if (r === 'sales_executive' || r === 'executive') return 'sales_executive';
  if (r === 'read_only' || r === 'management') return 'read_only';
  return 'sales_executive';
}

const STORAGE_KEY = 'leadflow_crm_v1_store';

interface CRMContextType extends CRMStoreData {
  isLoaded: boolean;
  activeRole: UserRole;
  normalizedRole: 'super_admin' | 'admin' | 'sales_manager' | 'sales_executive' | 'read_only';
  // Scoped Data Collections
  scopedLeads: Lead[];
  scopedCustomers: Customer[];
  scopedTasks: FollowUpTask[];
  scopedQuotations: Quotation[];
  scopedOrders: SalesOrder[];
  scopedEmployees: Employee[];
  // RBAC & Permissions
  can: (action: PermissionAction, entity?: string) => boolean;
  hasPermission: (permissionKey: keyof RolePermissions) => boolean;
  updateRolePermission: (role: string, permissionKey: string, value: boolean) => void;
  // Auth & Session
  isAuthenticated: boolean;
  getRoleDashboardPath: (role?: string) => string;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => boolean;
  isSessionExpired: boolean;
  toggleSessionExpirySimulation: () => void;
  // User Switch
  switchUser: (email: string) => void;
  // Lead Operations
  createLead: (leadData: Partial<Lead>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  bulkAssignLeads: (leadIds: string[], employeeId: string) => void;
  bulkUpdateLeadStatus: (leadIds: string[], status: LeadStatus) => void;
  bulkImportLeads: (leadsToImport: any[]) => { updatedCount: number; createdCount: number };
  // Customer Operations
  createCustomer: (customerData: Partial<Customer>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  // Task Operations
  createTask: (taskData: Partial<FollowUpTask>) => FollowUpTask;
  updateTask: (id: string, updates: Partial<FollowUpTask>) => void;
  deleteTask: (id: string) => void;
  // Quotation Operations
  createQuotation: (quotationData: Partial<Quotation>) => Quotation;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  reviseQuotation: (id: string, newItems: QuotationItem[], reason: string) => void;
  deleteQuotation: (id: string) => void;
  // Order Operations
  createSalesOrder: (orderData: Partial<SalesOrder>) => SalesOrder;
  updateSalesOrder: (id: string, updates: Partial<SalesOrder>) => void;
  convertLeadToCustomerAndOrder: (leadId: string, orderValue?: number) => { customer: Customer; order: SalesOrder };
  // Integration Operations
  processIncomingIntegrationPayload: (provider: IntegrationProvider, payload: Record<string, any>) => {
    success: boolean;
    event: IntegrationEvent;
    lead?: Lead;
    isDuplicate?: boolean;
    message: string;
  };
  retryIntegrationEvent: (eventId: string) => void;
  resolveDuplicate: (reviewId: string, resolution: 'merged' | 'kept_separate' | 'linked_enquiry', note?: string) => void;
  // Notification & Communications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addCommunicationMessage: (phoneOrEmail: string, message: Partial<CommunicationMessage>) => void;
  // System Config
  updateAssignmentRules: (rules: AssignmentRule[], activeType: 'round_robin' | 'source_based' | 'territory_based' | 'manual') => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  createEmployee: (empData: Partial<Employee>) => Employee;
  updateSettings: (newSettings: Partial<CRMStoreData['settings']>) => void;
  resetDemoData: () => void;
  exportDataAsJSON: () => string;
}

export function getRoleDashboardPath(role?: string): string {
  const r = (role || '').toLowerCase();
  if (r === 'super_admin' || r === 'superadmin') return '/super-admin/dashboard';
  if (r === 'admin') return '/admin/dashboard';
  if (r === 'sales_manager' || r === 'manager') return '/manager/dashboard';
  if (r === 'sales_executive' || r === 'executive') return '/executive/dashboard';
  if (r === 'read_only' || r === 'viewer' || r === 'management') return '/management/dashboard';
  return '/admin/dashboard';
}

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CRMStoreData>(INITIAL_STORE_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.leads && Array.isArray(parsed.leads)) {
          // Sanitize all leads to strictly indiamart or justdial
          const sanitizedLeads = parsed.leads.map((l: any) => ({
            ...l,
            source: l.source === 'justdial' ? 'justdial' : 'indiamart',
          }));
          const merged: CRMStoreData = {
            ...INITIAL_STORE_DATA,
            ...parsed,
            leads: sanitizedLeads,
            currentUser: parsed.currentUser && parsed.currentUser.email ? parsed.currentUser : INITIAL_STORE_DATA.currentUser,
            rolePermissions: parsed.rolePermissions || DEFAULT_ROLE_PERMISSIONS,
            employees: parsed.employees && parsed.employees.some((e: any) => e.teamId) ? parsed.employees : SEED_EMPLOYEES,
          };
          setData(merged);
        } else {
          setData(INITIAL_STORE_DATA);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORE_DATA));
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORE_DATA));
      }
    } catch (e) {
      console.error('Failed to load CRM data from localStorage:', e);
      setData(INITIAL_STORE_DATA);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state updates
  const saveState = useCallback((nextData: CRMStoreData) => {
    setData(nextData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  }, []);

  // Helper to recompute employee metrics dynamically based on current leads, orders, tasks
  const recalculateEmployeeMetrics = useCallback((employees: Employee[], leads: Lead[], tasks: FollowUpTask[], orders: SalesOrder[]) => {
    return employees.map((emp) => {
      const empLeads = leads.filter((l) => l.assignedTo === emp.id);
      const activeLeads = empLeads.filter((l) => !['won', 'lost', 'disqualified'].includes(l.status)).length;
      const convertedLeads = empLeads.filter((l) => l.status === 'won').length;
      const empTasks = tasks.filter((t) => t.assignedTo === emp.id && t.status !== 'completed' && t.status !== 'cancelled').length;
      const empOrders = orders.filter((o) => o.assignedSalesExecutiveId === emp.id);
      const totalRevenueWon = empOrders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
      const conversionRate = empLeads.length > 0 ? parseFloat(((convertedLeads / empLeads.length) * 100).toFixed(1)) : 0;

      return {
        ...emp,
        metrics: {
          totalAssigned: empLeads.length,
          activeLeads,
          pendingFollowUps: empTasks,
          convertedLeads,
          conversionRate,
          totalRevenueWon,
        },
      };
    });
  }, []);

  // Normalized Current Role
  const normalizedRole = useMemo(() => normalizeRole(data.currentUser?.role), [data.currentUser]);

  // Auth State & Persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    try {
      const authFlag = localStorage.getItem('leadflow_auth_active');
      if (authFlag === 'false') {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Session State
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const toggleSessionExpirySimulation = useCallback(() => {
    setIsSessionExpired((prev) => !prev);
    toast.info('Session expiry simulation toggled');
  }, []);

  // Switch User
  const switchUser = useCallback((email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user: any = DEMO_USERS[cleanEmail] || data.employees.find((e) => e.email.toLowerCase() === cleanEmail);
    if (user) {
      const roleStr = user.role ? String(user.role).replace('_', ' ').toUpperCase() : 'SALES EXECUTIVE';
      const nextUser: User = {
        id: user.id,
        name: user.fullName || user.name || 'User',
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        title: user.title || `${roleStr} - ${user.department || 'Sales'}`,
        phone: user.phone,
        department: user.department,
        teamId: user.teamId,
        teamName: user.teamName,
      };
      const nextData: CRMStoreData = {
        ...data,
        currentUser: nextUser,
      };
      saveState(nextData);
      setIsSessionExpired(false);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('leadflow_auth_active', 'true');
        localStorage.setItem('leadflow_current_user_email', cleanEmail);
      } catch {}
      toast.success(`Logged in as ${nextUser.name} (${roleStr})`);
    }
  }, [data, saveState]);

  // Login simulation with password check
  const login = useCallback((email: string, password = 'Demo@123'): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const user: any = DEMO_USERS[cleanEmail] || data.employees.find((e) => e.email.toLowerCase() === cleanEmail);
    if (!user) {
      toast.error('Invalid credentials: No account found with this email.');
      return false;
    }
    if (password !== 'Demo@123') {
      toast.error('Incorrect password. For demo, use: Demo@123');
      return false;
    }
    setIsAuthenticated(true);
    try {
      localStorage.setItem('leadflow_auth_active', 'true');
      localStorage.setItem('leadflow_current_user_email', cleanEmail);
    } catch {}
    switchUser(cleanEmail);
    return true;
  }, [data.employees, switchUser]);

  // Logout
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('leadflow_auth_active', 'false');
    } catch {}
    toast.info('Logged out from current session');
  }, []);

  // Change Password Simulation
  const changePassword = useCallback((oldPass: string, newPass: string): boolean => {
    if (oldPass !== 'Demo@123') {
      toast.error('Current password does not match.');
      return false;
    }
    if (!newPass || newPass.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return false;
    }
    toast.success('Password updated successfully for current session');
    return true;
  }, []);

  // Role Permissions
  const rolePerms = useMemo(() => {
    const permissionsMap = data.rolePermissions || DEFAULT_ROLE_PERMISSIONS;
    return permissionsMap[normalizedRole] || DEFAULT_ROLE_PERMISSIONS[normalizedRole];
  }, [data.rolePermissions, normalizedRole]);

  const hasPermission = useCallback((key: keyof RolePermissions): boolean => {
    if (normalizedRole === 'super_admin') return true;
    if (!rolePerms) return false;
    return Boolean(rolePerms[key]);
  }, [normalizedRole, rolePerms]);

  const can = useCallback((action: PermissionAction, entity?: string): boolean => {
    if (normalizedRole === 'super_admin') return true;

    if (action === 'delete') {
      // Only Super Admin and Admin can delete leads, customers, or quotes
      return normalizedRole === 'admin';
    }

    if (action === 'create' || action === 'edit') {
      if (normalizedRole === 'read_only') return false;
      return true;
    }

    if (action === 'assign') {
      return normalizedRole === 'admin' || normalizedRole === 'sales_manager';
    }

    if (action === 'configure') {
      if (entity === 'security') return false;
      if (entity === 'integrations') return normalizedRole === 'admin';
      return normalizedRole === 'admin';
    }

    if (action === 'export') {
      if (normalizedRole === 'sales_executive') return false;
      return true;
    }

    return true;
  }, [normalizedRole]);

  // Update Role Permissions (Super Admin only)
  const updateRolePermission = useCallback((role: string, permissionKey: string, value: boolean) => {
    if (normalizedRole !== 'super_admin') {
      toast.error('Access Denied: Only Super Admin can modify the permission matrix.');
      return;
    }
    if (role === 'super_admin') {
      toast.warning('Super Admin permissions cannot be restricted (Privilege Escalation Protection).');
      return;
    }
    const currentPerms = data.rolePermissions || DEFAULT_ROLE_PERMISSIONS;
    const roleConfig = currentPerms[role];
    if (!roleConfig) return;

    const nextPerms = {
      ...currentPerms,
      [role]: {
        ...roleConfig,
        [permissionKey]: value,
      },
    };

    saveState({
      ...data,
      rolePermissions: nextPerms,
    });
    toast.success(`Updated ${roleConfig.displayName} permission for ${permissionKey}`);
  }, [data, normalizedRole, saveState]);

  // Compute Scoped Leads
  const scopedLeads = useMemo(() => {
    if (normalizedRole === 'super_admin' || normalizedRole === 'admin' || normalizedRole === 'read_only') {
      return data.leads;
    }
    if (normalizedRole === 'sales_manager') {
      // Leads assigned to executives in manager's team or unassigned
      const teamEmployees = data.employees.filter(
        (e) => e.managerId === data.currentUser.id || e.teamId === data.currentUser.teamId || e.id === data.currentUser.id
      );
      const teamEmpIds = teamEmployees.map((e) => e.id);
      return data.leads.filter((l) => teamEmpIds.includes(l.assignedTo) || !l.assignedTo);
    }
    if (normalizedRole === 'sales_executive') {
      // Strictly assigned to this executive
      return data.leads.filter((l) => l.assignedTo === data.currentUser.id);
    }
    return data.leads;
  }, [data.leads, data.employees, data.currentUser, normalizedRole]);

  // Compute Scoped Tasks
  const scopedTasks = useMemo(() => {
    if (normalizedRole === 'super_admin' || normalizedRole === 'admin' || normalizedRole === 'read_only') {
      return data.tasks;
    }
    if (normalizedRole === 'sales_manager') {
      const teamEmployees = data.employees.filter(
        (e) => e.managerId === data.currentUser.id || e.teamId === data.currentUser.teamId || e.id === data.currentUser.id
      );
      const teamEmpIds = teamEmployees.map((e) => e.id);
      return data.tasks.filter((t) => teamEmpIds.includes(t.assignedTo));
    }
    if (normalizedRole === 'sales_executive') {
      return data.tasks.filter((t) => t.assignedTo === data.currentUser.id);
    }
    return data.tasks;
  }, [data.tasks, data.employees, data.currentUser, normalizedRole]);

  // Compute Scoped Quotations
  const scopedQuotations = useMemo(() => {
    if (normalizedRole === 'super_admin' || normalizedRole === 'admin' || normalizedRole === 'read_only') {
      return data.quotations;
    }
    if (normalizedRole === 'sales_manager') {
      const teamEmployees = data.employees.filter(
        (e) => e.managerId === data.currentUser.id || e.teamId === data.currentUser.teamId || e.id === data.currentUser.id
      );
      const teamEmpIds = teamEmployees.map((e) => e.id);
      return data.quotations.filter((q) => teamEmpIds.includes(q.assignedTo));
    }
    if (normalizedRole === 'sales_executive') {
      return data.quotations.filter((q) => q.assignedTo === data.currentUser.id);
    }
    return data.quotations;
  }, [data.quotations, data.employees, data.currentUser, normalizedRole]);

  // Compute Scoped Orders
  const scopedOrders = useMemo(() => {
    if (normalizedRole === 'super_admin' || normalizedRole === 'admin' || normalizedRole === 'read_only') {
      return data.orders;
    }
    if (normalizedRole === 'sales_manager') {
      const teamEmployees = data.employees.filter(
        (e) => e.managerId === data.currentUser.id || e.teamId === data.currentUser.teamId || e.id === data.currentUser.id
      );
      const teamEmpNames = teamEmployees.map((e) => e.fullName.toLowerCase());
      return data.orders.filter((o) => teamEmpNames.includes(o.assignedSalesExecutive.toLowerCase()));
    }
    if (normalizedRole === 'sales_executive') {
      return data.orders.filter((o) => o.assignedSalesExecutive.toLowerCase() === data.currentUser.name.toLowerCase());
    }
    return data.orders;
  }, [data.orders, data.employees, data.currentUser, normalizedRole]);

  // Compute Scoped Customers
  const scopedCustomers = useMemo(() => {
    if (normalizedRole === 'super_admin' || normalizedRole === 'admin' || normalizedRole === 'read_only') {
      return data.customers;
    }
    const scopedLeadIds = scopedLeads.map((l) => l.id);
    return data.customers.filter(
      (c) =>
        c.relationshipOwnerId === data.currentUser.id ||
        c.enquiryIds.some((id) => scopedLeadIds.includes(id)) ||
        scopedLeads.some((l) => l.companyName.toLowerCase() === c.company.toLowerCase())
    );
  }, [data.customers, scopedLeads, data.currentUser, normalizedRole]);

  // Compute Scoped Employees
  const scopedEmployees = useMemo(() => {
    if (normalizedRole === 'super_admin' || normalizedRole === 'admin') {
      return data.employees;
    }
    if (normalizedRole === 'sales_manager') {
      return data.employees.filter(
        (e) => e.managerId === data.currentUser.id || e.teamId === data.currentUser.teamId || e.id === data.currentUser.id
      );
    }
    if (normalizedRole === 'sales_executive') {
      return data.employees.filter((e) => e.id === data.currentUser.id);
    }
    return data.employees;
  }, [data.employees, data.currentUser, normalizedRole]);

  // Lead Assignment Helper according to current active rule
  const determineAssignedEmployee = useCallback((leadData: Partial<Lead>, currentData: CRMStoreData): { empId: string; empName: string } => {
    const activeRuleType = currentData.settings.activeAssignmentRule;
    const activeEmployees = currentData.employees.filter((e) => e.status === 'active' && (e.role === 'executive' || e.role === 'manager'));

    if (activeEmployees.length === 0) {
      return { empId: 'emp_1', empName: 'Rahul Sharma' };
    }

    if (activeRuleType === 'source_based' && leadData.source) {
      const sourceRule = currentData.assignmentRules.find((r) => r.ruleType === 'source_based');
      const mappings = sourceRule?.config.sourceMappings || {};
      const targetEmpIds = mappings[leadData.source] || [];
      const match = activeEmployees.find((e) => targetEmpIds.includes(e.id));
      if (match) return { empId: match.id, empName: match.fullName };
    }

    if (activeRuleType === 'territory_based' && leadData.state) {
      const territoryRule = currentData.assignmentRules.find((r) => r.ruleType === 'territory_based');
      const mappings = territoryRule?.config.territoryMappings || {};
      const targetEmpIds = mappings[leadData.state] || [];
      const match = activeEmployees.find((e) => targetEmpIds.includes(e.id));
      if (match) return { empId: match.id, empName: match.fullName };
    }

    // Default: Round Robin
    const currentIndex = currentData.settings.roundRobinIndex % activeEmployees.length;
    const selectedEmp = activeEmployees[currentIndex] || activeEmployees[0];
    return { empId: selectedEmp.id, empName: selectedEmp.fullName };
  }, []);

  // Create Lead
  const createLead = useCallback((leadData: Partial<Lead>): Lead => {
    if (normalizedRole === 'read_only') {
      toast.error('Access Denied: Read-only accounts cannot create leads.');
      throw new Error('Unauthorized');
    }

    const assigned = leadData.assignedTo && leadData.assignedEmployeeName
      ? { empId: leadData.assignedTo, empName: leadData.assignedEmployeeName }
      : determineAssignedEmployee(leadData, data);

    const now = new Date().toISOString();
    const leadCount = data.leads.length + 1;
    const leadNumber = `LF-2026-${String(leadCount).padStart(4, '0')}`;

    const newLead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      leadNumber,
      customerName: leadData.customerName || 'Unnamed Prospect',
      companyName: leadData.companyName || 'Independent',
      phone: leadData.phone || '',
      alternatePhone: leadData.alternatePhone || '',
      email: leadData.email || '',
      productService: leadData.productService || 'Industrial Water Pumps',
      requirement: leadData.requirement || 'Enquiry details pending',
      quantity: leadData.quantity || '1 Unit',
      city: leadData.city || 'Indore',
      state: leadData.state || 'Madhya Pradesh',
      country: leadData.country || 'India',
      source: (leadData.source === 'justdial' ? 'justdial' : 'indiamart') as LeadSource,
      sourceEnquiryId: leadData.sourceEnquiryId,
      assignedTo: assigned.empId,
      assignedEmployeeName: assigned.empName,
      priority: leadData.priority || 'medium',
      status: leadData.status || 'new',
      estimatedValue: leadData.estimatedValue || 250000,
      notes: leadData.notes || '',
      createdAt: now,
      updatedAt: now,
      nextFollowUp: leadData.nextFollowUp,
      tags: leadData.tags || [],
    };

    // Auto-create initial activity
    const newActivity: LeadActivity = {
      id: `act_${Date.now()}`,
      leadId: newLead.id,
      type: 'system',
      title: 'Lead Created',
      description: `Lead created from ${newLead.source.toUpperCase()} and assigned to ${newLead.assignedEmployeeName}.`,
      performedBy: data.currentUser.name,
      timestamp: now,
    };

    // Notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'New Lead Created',
      message: `${newLead.customerName} (${newLead.companyName}) added to Leads.`,
      type: 'new_lead',
      timestamp: now,
      isRead: false,
      relatedEntity: { type: 'lead', id: newLead.id },
    };

    // Audit Log
    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'lead_created',
      entity: 'Lead',
      entityId: newLead.id,
      newValue: newLead.leadNumber,
      details: `Created lead ${newLead.leadNumber} for ${newLead.customerName} (${newLead.companyName})`,
    };

    const nextLeads = [newLead, ...data.leads];
    const nextEmployees = recalculateEmployeeMetrics(data.employees, nextLeads, data.tasks, data.orders);

    const nextData: CRMStoreData = {
      ...data,
      leads: nextLeads,
      employees: nextEmployees,
      notifications: [newNotif, ...data.notifications],
      auditLogs: [newAudit, ...data.auditLogs],
      settings: {
        ...data.settings,
        roundRobinIndex: data.settings.roundRobinIndex + 1,
      },
    };

    saveState(nextData);
    toast.success(`Lead ${newLead.leadNumber} created successfully!`);
    return newLead;
  }, [data, determineAssignedEmployee, recalculateEmployeeMetrics, saveState]);

  // Update Lead
  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    const existing = data.leads.find((l) => l.id === id);
    if (!existing) return;

    if (normalizedRole === 'read_only') {
      toast.error('Access Denied: Read-only accounts cannot modify leads.');
      return;
    }

    if (normalizedRole === 'sales_executive' && existing.assignedTo !== data.currentUser.id) {
      toast.error('Access Denied: You can only edit your own assigned leads.');
      return;
    }

    const now = new Date().toISOString();
    const updatedLead: Lead = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    // Check if status changed
    const statusChanged = updates.status && updates.status !== existing.status;
    const assignmentChanged = updates.assignedTo && updates.assignedTo !== existing.assignedTo;

    const audits: AuditLogItem[] = [];
    const activities: LeadActivity[] = [];
    const notifications: NotificationItem[] = [];

    if (statusChanged) {
      audits.push({
        id: `aud_${Date.now()}_status`,
        timestamp: now,
        userName: data.currentUser.name,
        userRole: data.currentUser.role,
        action: 'lead_status_changed',
        entity: 'Lead',
        entityId: id,
        previousValue: existing.status,
        newValue: updates.status,
        details: `Lead status changed from ${existing.status} to ${updates.status}${updates.lostReason ? ` (Reason: ${updates.lostReason})` : ''}`,
      });
      activities.push({
        id: `act_${Date.now()}_status`,
        leadId: id,
        type: 'status_change',
        title: `Status Changed to ${updates.status?.toUpperCase()}`,
        description: updates.lostReason ? `Reason: ${updates.lostReason}` : `Updated by ${data.currentUser.name}`,
        performedBy: data.currentUser.name,
        timestamp: now,
      });
    }

    if (assignmentChanged) {
      const newEmp = data.employees.find((e) => e.id === updates.assignedTo);
      const empName = newEmp ? newEmp.fullName : updates.assignedEmployeeName || 'Unknown';
      updatedLead.assignedEmployeeName = empName;

      audits.push({
        id: `aud_${Date.now()}_assign`,
        timestamp: now,
        userName: data.currentUser.name,
        userRole: data.currentUser.role,
        action: 'lead_reassigned',
        entity: 'Lead',
        entityId: id,
        previousValue: existing.assignedEmployeeName,
        newValue: empName,
        details: `Reassigned from ${existing.assignedEmployeeName} to ${empName}`,
      });
      notifications.push({
        id: `notif_${Date.now()}_assign`,
        title: 'Lead Reassigned',
        message: `Lead ${existing.leadNumber} reassigned to ${empName}`,
        type: 'lead_assigned',
        timestamp: now,
        isRead: false,
        relatedEntity: { type: 'lead', id },
      });
    }

    const nextLeads = data.leads.map((l) => (l.id === id ? updatedLead : l));
    const nextEmployees = recalculateEmployeeMetrics(data.employees, nextLeads, data.tasks, data.orders);

    const nextData: CRMStoreData = {
      ...data,
      leads: nextLeads,
      employees: nextEmployees,
      notifications: [...notifications, ...data.notifications],
      auditLogs: [...audits, ...data.auditLogs],
    };

    saveState(nextData);
    toast.success(`Lead ${existing.leadNumber} updated!`);
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Delete Lead
  const deleteLead = useCallback((id: string) => {
    if (normalizedRole !== 'super_admin' && normalizedRole !== 'admin') {
      toast.error('Access Denied: Only Admin and Super Admin can delete leads.');
      return;
    }

    const existing = data.leads.find((l) => l.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'lead_edited',
      entity: 'Lead',
      entityId: id,
      previousValue: existing.leadNumber,
      newValue: 'DELETED',
      details: `Lead ${existing.leadNumber} (${existing.customerName}) deleted by ${data.currentUser.name}`,
    };

    const nextLeads = data.leads.filter((l) => l.id !== id);
    const nextEmployees = recalculateEmployeeMetrics(data.employees, nextLeads, data.tasks, data.orders);

    saveState({
      ...data,
      leads: nextLeads,
      employees: nextEmployees,
      auditLogs: [newAudit, ...data.auditLogs],
    });
    toast.info(`Lead ${existing.leadNumber} deleted`);
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Bulk Assign Leads
  const bulkAssignLeads = useCallback((leadIds: string[], employeeId: string) => {
    if (normalizedRole === 'sales_executive' || normalizedRole === 'read_only') {
      toast.error('Access Denied: Sales executives cannot reassign leads.');
      return;
    }

    if (normalizedRole === 'sales_manager') {
      const teamEmployees = data.employees.filter(
        (e) => e.managerId === data.currentUser.id || e.teamId === data.currentUser.teamId || e.id === data.currentUser.id
      );
      if (!teamEmployees.some((e) => e.id === employeeId)) {
        toast.error('Access Denied: Managers can only assign leads to executives in their own team.');
        return;
      }
    }

    const targetEmp = data.employees.find((e) => e.id === employeeId);
    if (!targetEmp) return;

    const now = new Date().toISOString();
    const nextLeads = data.leads.map((l) => {
      if (leadIds.includes(l.id)) {
        return {
          ...l,
          assignedTo: targetEmp.id,
          assignedEmployeeName: targetEmp.fullName,
          updatedAt: now,
        };
      }
      return l;
    });

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'lead_reassigned',
      entity: 'Lead',
      entityId: 'multiple',
      newValue: targetEmp.fullName,
      details: `Bulk reassigned ${leadIds.length} leads to ${targetEmp.fullName}`,
    };

    const nextEmployees = recalculateEmployeeMetrics(data.employees, nextLeads, data.tasks, data.orders);

    saveState({
      ...data,
      leads: nextLeads,
      employees: nextEmployees,
      auditLogs: [newAudit, ...data.auditLogs],
    });
    toast.success(`Assigned ${leadIds.length} leads to ${targetEmp.fullName}`);
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Bulk Status Update
  const bulkUpdateLeadStatus = useCallback((leadIds: string[], status: LeadStatus) => {
    const now = new Date().toISOString();
    const nextLeads = data.leads.map((l) => {
      if (leadIds.includes(l.id)) {
        return {
          ...l,
          status,
          updatedAt: now,
        };
      }
      return l;
    });

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'lead_status_changed',
      entity: 'Lead',
      entityId: 'multiple',
      newValue: status,
      details: `Bulk updated status of ${leadIds.length} leads to ${status}`,
    };

    const nextEmployees = recalculateEmployeeMetrics(data.employees, nextLeads, data.tasks, data.orders);

    saveState({
      ...data,
      leads: nextLeads,
      employees: nextEmployees,
      auditLogs: [newAudit, ...data.auditLogs],
    });
    toast.success(`Updated ${leadIds.length} leads to status: ${status}`);
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Bulk Import / Update Leads from CSV/Excel
  const bulkImportLeads = useCallback((leadsToImport: any[]) => {
    const now = new Date().toISOString();
    let updatedCount = 0;
    let createdCount = 0;
    let currentLeads = [...data.leads];

    leadsToImport.forEach((row) => {
      // Find match by ID or phone (last 10 digits match)
      const cleanPhone = (row.phone || '').replace(/\D/g, '').slice(-10);
      const matchIndex = currentLeads.findIndex((l) => {
        if (row.id && l.id && l.id.toLowerCase() === row.id.toString().trim().toLowerCase()) return true;
        if (cleanPhone && cleanPhone.length === 10) {
          const lPhone = (l.phone || '').replace(/\D/g, '').slice(-10);
          return lPhone === cleanPhone;
        }
        return false;
      });

      // Find matching employee if specified
      let matchedEmp = data.employees.find((e) =>
        e.fullName.toLowerCase() === (row.assignedEmployeeName || '').toLowerCase() ||
        e.id === row.assignedTo
      );
      if (!matchedEmp && !row.assignedTo) {
        matchedEmp = data.employees[0];
      }

      if (matchIndex !== -1) {
        // Update existing lead
        const existing = currentLeads[matchIndex];
        currentLeads[matchIndex] = {
          ...existing,
          customerName: row.customerName || existing.customerName,
          companyName: row.companyName || existing.companyName,
          phone: row.phone || existing.phone,
          email: row.email !== undefined && row.email !== '' ? row.email : existing.email,
          city: row.city || existing.city,
          productService: row.productService || row.productRequirement || existing.productService,
          productRequirement: row.productRequirement || row.productService || existing.productRequirement,
          source: (row.source as LeadSource) || existing.source,
          priority: (row.priority as LeadPriority) || existing.priority,
          status: (row.status as LeadStatus) || existing.status,
          estimatedValue: row.estimatedValue !== undefined && row.estimatedValue !== '' ? Number(row.estimatedValue) : existing.estimatedValue,
          assignedTo: matchedEmp ? matchedEmp.id : existing.assignedTo,
          assignedEmployeeName: matchedEmp ? matchedEmp.fullName : existing.assignedEmployeeName,
          notes: row.notes ? (existing.notes ? `${existing.notes} | ${row.notes}` : row.notes) : existing.notes,
          updatedAt: now,
        };
        updatedCount++;
      } else {
        // Create new lead
        const newLeadId = row.id && !row.id.toString().toUpperCase().startsWith('NEW')
          ? row.id.toString().trim()
          : `LF-${1000 + currentLeads.length + 1}`;
        const newLead: Lead = {
          id: newLeadId,
          leadNumber: newLeadId,
          customerName: row.customerName || 'Prospective Buyer',
          companyName: row.companyName || 'Enterprise Inquirer',
          phone: row.phone || '+91 98200 12345',
          email: row.email || '',
          city: row.city || 'Mumbai',
          state: row.state || 'Maharashtra',
          country: 'India',
          productService: row.productService || row.productRequirement || 'Industrial Machinery',
          requirement: row.requirement || row.productRequirement || row.productService || 'Industrial Machinery & Equipment',
          productRequirement: row.productRequirement || row.productService || 'Industrial Machinery & Equipment',
          source: (row.source === 'justdial' ? 'justdial' : 'indiamart') as LeadSource,
          priority: (row.priority as LeadPriority) || 'medium',
          status: (row.status as LeadStatus) || 'new',
          estimatedValue: row.estimatedValue ? Number(row.estimatedValue) : 250000,
          assignedTo: matchedEmp ? matchedEmp.id : data.employees[0]?.id || 'emp_1',
          assignedEmployeeName: matchedEmp ? matchedEmp.fullName : data.employees[0]?.fullName || 'Rahul Sharma',
          notes: row.notes || 'Imported via CSV/Excel bulk upload',
          createdAt: now,
          updatedAt: now,
        };
        currentLeads = [newLead, ...currentLeads];
        createdCount++;
      }
    });

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'lead_created',
      entity: 'Lead',
      entityId: 'bulk_import',
      newValue: `${updatedCount} updated, ${createdCount} created`,
      details: `Bulk imported/updated ${updatedCount} existing leads and created ${createdCount} new leads via CSV/Excel`,
    };

    const nextEmployees = recalculateEmployeeMetrics(data.employees, currentLeads, data.tasks, data.orders);

    saveState({
      ...data,
      leads: currentLeads,
      employees: nextEmployees,
      auditLogs: [newAudit, ...data.auditLogs],
    });

    toast.success(`Bulk processed: ${updatedCount} leads updated, ${createdCount} new leads created`);
    return { updatedCount, createdCount };
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Create Customer
  const createCustomer = useCallback((customerData: Partial<Customer>): Customer => {
    const now = new Date().toISOString();
    const count = data.customers.length + 1;
    const customerNumber = `CUST-${1000 + count}`;

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      customerNumber,
      name: customerData.name || 'New Customer',
      company: customerData.company || 'Enterprise',
      phone: customerData.phone || '',
      alternatePhone: customerData.alternatePhone,
      email: customerData.email || '',
      city: customerData.city || 'Indore',
      state: customerData.state || 'Madhya Pradesh',
      address: customerData.address || '',
      gstin: customerData.gstin || '',
      relationshipOwner: customerData.relationshipOwner || data.currentUser.name,
      relationshipOwnerId: customerData.relationshipOwnerId || data.currentUser.id,
      totalEnquiries: customerData.totalEnquiries || 1,
      totalQuotations: customerData.totalQuotations || 0,
      totalOrders: customerData.totalOrders || 0,
      customerValue: customerData.customerValue || 0,
      status: customerData.status || 'active',
      createdAt: now.split('T')[0],
      enquiryIds: customerData.enquiryIds || [],
      notes: customerData.notes || '',
    };

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'customer_created',
      entity: 'Customer',
      entityId: newCust.id,
      newValue: newCust.customerNumber,
      details: `Created customer record ${newCust.customerNumber} for ${newCust.name} (${newCust.company})`,
    };

    saveState({
      ...data,
      customers: [newCust, ...data.customers],
      auditLogs: [newAudit, ...data.auditLogs],
    });
    toast.success(`Customer ${newCust.customerNumber} created!`);
    return newCust;
  }, [data, saveState]);

  // Update Customer
  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    const existing = data.customers.find((c) => c.id === id);
    if (!existing) return;

    const nextCusts = data.customers.map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveState({
      ...data,
      customers: nextCusts,
    });
    toast.success(`Customer ${existing.customerNumber} updated`);
  }, [data, saveState]);

  // Delete Customer
  const deleteCustomer = useCallback((id: string) => {
    const existing = data.customers.find((c) => c.id === id);
    if (!existing) return;

    saveState({
      ...data,
      customers: data.customers.filter((c) => c.id !== id),
    });
    toast.info(`Customer ${existing.customerNumber} removed`);
  }, [data, saveState]);

  // Create Task / Follow-up
  const createTask = useCallback((taskData: Partial<FollowUpTask>): FollowUpTask => {
    const now = new Date().toISOString();
    const assignedEmp = taskData.assignedTo
      ? data.employees.find((e) => e.id === taskData.assignedTo)
      : null;

    const newTask: FollowUpTask = {
      id: `task_${Date.now()}`,
      taskTitle: taskData.taskTitle || 'Follow-up Call',
      taskType: taskData.taskType || 'followup_call',
      relatedLeadId: taskData.relatedLeadId || '',
      relatedLeadNumber: taskData.relatedLeadNumber,
      customerName: taskData.customerName || 'Customer',
      companyName: taskData.companyName || '',
      phone: taskData.phone || '',
      assignedTo: assignedEmp ? assignedEmp.id : data.currentUser.id,
      assignedEmployeeName: assignedEmp ? assignedEmp.fullName : data.currentUser.name,
      dueDate: taskData.dueDate || now.split('T')[0],
      dueTime: taskData.dueTime || '11:00',
      priority: taskData.priority || 'medium',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      createdAt: now,
    };

    // Update related lead nextFollowUp
    let nextLeads = data.leads;
    if (newTask.relatedLeadId) {
      const followUpDateTime = `${newTask.dueDate}T${newTask.dueTime}:00`;
      nextLeads = data.leads.map((l) =>
        l.id === newTask.relatedLeadId
          ? { ...l, nextFollowUp: followUpDateTime, updatedAt: now }
          : l
      );
    }

    const nextTasks = [newTask, ...data.tasks];
    const nextEmployees = recalculateEmployeeMetrics(data.employees, nextLeads, nextTasks, data.orders);

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'followup_scheduled',
      entity: 'Task',
      entityId: newTask.id,
      newValue: `${newTask.dueDate} ${newTask.dueTime}`,
      details: `Scheduled task: "${newTask.taskTitle}" for ${newTask.customerName} on ${newTask.dueDate}`,
    };

    saveState({
      ...data,
      leads: nextLeads,
      tasks: nextTasks,
      employees: nextEmployees,
      auditLogs: [newAudit, ...data.auditLogs],
    });
    toast.success(`Task scheduled for ${newTask.dueDate}!`);
    return newTask;
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Update Task
  const updateTask = useCallback((id: string, updates: Partial<FollowUpTask>) => {
    const existing = data.tasks.find((t) => t.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const updatedTask: FollowUpTask = {
      ...existing,
      ...updates,
      completedAt: updates.status === 'completed' && !existing.completedAt ? now : existing.completedAt,
    };

    const nextTasks = data.tasks.map((t) => (t.id === id ? updatedTask : t));
    const nextEmployees = recalculateEmployeeMetrics(data.employees, data.leads, nextTasks, data.orders);

    const audits: AuditLogItem[] = [];
    if (updates.status === 'completed') {
      audits.push({
        id: `aud_${Date.now()}`,
        timestamp: now,
        userName: data.currentUser.name,
        userRole: data.currentUser.role,
        action: 'followup_completed',
        entity: 'Task',
        entityId: id,
        details: `Completed task: "${existing.taskTitle}"`,
      });
    }

    saveState({
      ...data,
      tasks: nextTasks,
      employees: nextEmployees,
      auditLogs: [...audits, ...data.auditLogs],
    });
    toast.success(`Task status updated`);
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Delete Task
  const deleteTask = useCallback((id: string) => {
    const nextTasks = data.tasks.filter((t) => t.id !== id);
    const nextEmployees = recalculateEmployeeMetrics(data.employees, data.leads, nextTasks, data.orders);
    saveState({
      ...data,
      tasks: nextTasks,
      employees: nextEmployees,
    });
    toast.info('Task deleted');
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Create Quotation
  const createQuotation = useCallback((quotationData: Partial<Quotation>): Quotation => {
    const now = new Date().toISOString();
    const count = data.quotations.length + 1;
    const quotationNumber = `QT-2026-${String(count).padStart(3, '0')}`;

    const items = quotationData.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discountTotal = items.reduce((sum, item) => sum + ((item.unitPrice * item.quantity * (item.discountPercent || 0)) / 100), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const grandTotal = subtotal - discountTotal + taxTotal;

    const newQuotation: Quotation = {
      id: `quot_${Date.now()}`,
      quotationNumber,
      version: 1,
      customerId: quotationData.customerId,
      customerName: quotationData.customerName || 'Customer',
      customerCompany: quotationData.customerCompany || 'Company',
      customerEmail: quotationData.customerEmail || '',
      customerPhone: quotationData.customerPhone || '',
      customerAddress: quotationData.customerAddress,
      customerGstin: quotationData.customerGstin,
      relatedLeadId: quotationData.relatedLeadId || '',
      relatedLeadNumber: quotationData.relatedLeadNumber,
      assignedTo: quotationData.assignedTo || data.currentUser.id,
      assignedEmployeeName: quotationData.assignedEmployeeName || data.currentUser.name,
      items,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      termsAndConditions: quotationData.termsAndConditions || '1. 30% Advance with PO, 70% against dispatch. 2. Warranty: 12 months comprehensive. 3. Freight extra at actuals.',
      validUntil: quotationData.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: quotationData.status || 'sent',
      notes: quotationData.notes,
      createdAt: now,
      updatedAt: now,
    };

    // If related lead exists, automatically update lead status to quotation_sent if currently prior stage
    let nextLeads = data.leads;
    if (newQuotation.relatedLeadId) {
      nextLeads = data.leads.map((l) => {
        if (l.id === newQuotation.relatedLeadId && ['new', 'assigned', 'contact_attempted', 'contacted', 'qualified'].includes(l.status)) {
          return {
            ...l,
            status: 'quotation_sent' as LeadStatus,
            updatedAt: now,
          };
        }
        return l;
      });
    }

    // Update customer quotation count if linked
    let nextCusts = data.customers;
    if (newQuotation.customerId) {
      nextCusts = data.customers.map((c) =>
        c.id === newQuotation.customerId
          ? { ...c, totalQuotations: (c.totalQuotations || 0) + 1 }
          : c
      );
    }

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'quotation_generated',
      entity: 'Quotation',
      entityId: newQuotation.id,
      newValue: `₹${grandTotal.toLocaleString('en-IN')}`,
      details: `Generated quotation ${quotationNumber} for ${newQuotation.customerCompany} worth ₹${grandTotal.toLocaleString('en-IN')}`,
    };

    saveState({
      ...data,
      quotations: [newQuotation, ...data.quotations],
      leads: nextLeads,
      customers: nextCusts,
      auditLogs: [newAudit, ...data.auditLogs],
    });
    toast.success(`Quotation ${quotationNumber} generated!`);
    return newQuotation;
  }, [data, saveState]);

  // Update Quotation
  const updateQuotation = useCallback((id: string, updates: Partial<Quotation>) => {
    const existing = data.quotations.find((q) => q.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const updatedQuot: Quotation = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    const nextQuotations = data.quotations.map((q) => (q.id === id ? updatedQuot : q));
    saveState({
      ...data,
      quotations: nextQuotations,
    });
    toast.success(`Quotation ${existing.quotationNumber} updated`);
  }, [data, saveState]);

  // Revise Quotation (Increments version and records revision history)
  const reviseQuotation = useCallback((id: string, newItems: QuotationItem[], reason: string) => {
    const existing = data.quotations.find((q) => q.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const subtotal = newItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discountTotal = newItems.reduce((sum, item) => sum + ((item.unitPrice * item.quantity * (item.discountPercent || 0)) / 100), 0);
    const taxTotal = newItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const grandTotal = subtotal - discountTotal + taxTotal;

    const historyEntry = {
      version: existing.version,
      updatedAt: now,
      updatedBy: data.currentUser.name,
      grandTotal: existing.grandTotal,
      reason: reason || 'Customer requested revision',
    };

    const revisedQuot: Quotation = {
      ...existing,
      version: existing.version + 1,
      items: newItems,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      status: 'revised',
      updatedAt: now,
      revisionHistory: [...(existing.revisionHistory || []), historyEntry],
    };

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'quotation_revised',
      entity: 'Quotation',
      entityId: id,
      previousValue: `v${existing.version}: ₹${existing.grandTotal}`,
      newValue: `v${revisedQuot.version}: ₹${grandTotal}`,
      details: `Revised quotation ${existing.quotationNumber} to version ${revisedQuot.version}: ${reason}`,
    };

    saveState({
      ...data,
      quotations: data.quotations.map((q) => (q.id === id ? revisedQuot : q)),
      auditLogs: [newAudit, ...data.auditLogs],
    });
    toast.success(`Quotation revised to Version ${revisedQuot.version}`);
  }, [data, saveState]);

  // Delete Quotation
  const deleteQuotation = useCallback((id: string) => {
    saveState({
      ...data,
      quotations: data.quotations.filter((q) => q.id !== id),
    });
    toast.info('Quotation removed');
  }, [data, saveState]);

  // Create Sales Order
  const createSalesOrder = useCallback((orderData: Partial<SalesOrder>): SalesOrder => {
    const now = new Date().toISOString();
    const count = data.orders.length + 1;
    const orderNumber = `SO-2026-${String(count).padStart(3, '0')}`;

    const newOrder: SalesOrder = {
      id: `so_${Date.now()}`,
      orderNumber,
      customerId: orderData.customerId || '',
      customerName: orderData.customerName || 'Customer',
      customerCompany: orderData.customerCompany || 'Enterprise',
      relatedLeadId: orderData.relatedLeadId || '',
      relatedLeadNumber: orderData.relatedLeadNumber,
      quotationId: orderData.quotationId,
      quotationNumber: orderData.quotationNumber,
      orderDate: orderData.orderDate || now.split('T')[0],
      orderValue: orderData.orderValue || 500000,
      assignedSalesExecutive: orderData.assignedSalesExecutive || data.currentUser.name,
      assignedSalesExecutiveId: orderData.assignedSalesExecutiveId || data.currentUser.id,
      orderStatus: orderData.orderStatus || 'confirmed',
      billingAddress: orderData.billingAddress || 'Billing address pending',
      shippingAddress: orderData.shippingAddress || 'Shipping address pending',
      paymentTerms: orderData.paymentTerms || '30% Advance, 70% against dispatch',
      notes: orderData.notes,
      createdAt: now,
    };

    // Update customer revenue and order count
    let nextCusts = data.customers;
    if (newOrder.customerId) {
      nextCusts = data.customers.map((c) =>
        c.id === newOrder.customerId
          ? {
            ...c,
            totalOrders: (c.totalOrders || 0) + 1,
            customerValue: (c.customerValue || 0) + newOrder.orderValue,
            status: ((c.customerValue || 0) + newOrder.orderValue > 1000000 ? 'vip' : 'active') as any,
          }
          : c
      );
    }

    const nextOrders = [newOrder, ...data.orders];
    const nextEmployees = recalculateEmployeeMetrics(data.employees, data.leads, data.tasks, nextOrders);

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'order_converted',
      entity: 'SalesOrder',
      entityId: newOrder.id,
      newValue: `₹${newOrder.orderValue.toLocaleString('en-IN')}`,
      details: `Created Sales Order ${newOrder.orderNumber} for ${newOrder.customerCompany} valued at ₹${newOrder.orderValue.toLocaleString('en-IN')}`,
    };

    saveState({
      ...data,
      orders: nextOrders,
      customers: nextCusts,
      employees: nextEmployees,
      auditLogs: [newAudit, ...data.auditLogs],
    });
    toast.success(`Sales Order ${newOrder.orderNumber} placed!`);
    return newOrder;
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Update Sales Order
  const updateSalesOrder = useCallback((id: string, updates: Partial<SalesOrder>) => {
    const nextOrders = data.orders.map((o) => (o.id === id ? { ...o, ...updates } : o));
    const nextEmployees = recalculateEmployeeMetrics(data.employees, data.leads, data.tasks, nextOrders);
    saveState({
      ...data,
      orders: nextOrders,
      employees: nextEmployees,
    });
    toast.success('Sales order updated');
  }, [data, recalculateEmployeeMetrics, saveState]);

  // Complete End-to-End Workflow: Convert Won Lead to Customer & Sales Order
  const convertLeadToCustomerAndOrder = useCallback((leadId: string, customOrderValue?: number) => {
    const lead = data.leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const now = new Date().toISOString();
    const dealValue = customOrderValue !== undefined ? customOrderValue : (lead.estimatedValue || 600000);

    // Check if customer already exists for this phone or company
    let targetCustomer = data.customers.find((c) => c.phone === lead.phone || c.company.toLowerCase() === lead.companyName.toLowerCase());

    let nextCustomers = [...data.customers];
    if (!targetCustomer) {
      const custNumber = `CUST-${1000 + data.customers.length + 1}`;
      targetCustomer = {
        id: `cust_${Date.now()}`,
        customerNumber: custNumber,
        name: lead.customerName,
        company: lead.companyName,
        phone: lead.phone,
        alternatePhone: lead.alternatePhone,
        email: lead.email,
        city: lead.city,
        state: lead.state,
        address: `${lead.city}, ${lead.state}`,
        relationshipOwner: lead.assignedEmployeeName,
        relationshipOwnerId: lead.assignedTo,
        totalEnquiries: 1,
        totalQuotations: 1,
        totalOrders: 1,
        customerValue: dealValue,
        status: dealValue >= 1000000 ? 'vip' : 'active',
        createdAt: now.split('T')[0],
        enquiryIds: [lead.id],
        notes: `Converted from Lead ${lead.leadNumber} on ${now.split('T')[0]}`,
      };
      nextCustomers = [targetCustomer, ...nextCustomers];
    } else {
      // update existing customer
      targetCustomer = {
        ...targetCustomer,
        totalOrders: targetCustomer.totalOrders + 1,
        customerValue: targetCustomer.customerValue + dealValue,
        status: (targetCustomer.customerValue + dealValue >= 1000000 ? 'vip' : 'active') as any,
        enquiryIds: Array.from(new Set([...targetCustomer.enquiryIds, lead.id])),
      };
      nextCustomers = nextCustomers.map((c) => (c.id === targetCustomer!.id ? targetCustomer! : c));
    }

    // Create Sales Order
    const orderNumber = `SO-2026-${String(data.orders.length + 1).padStart(3, '0')}`;
    const newOrder: SalesOrder = {
      id: `so_${Date.now()}`,
      orderNumber,
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      customerCompany: targetCustomer.company,
      relatedLeadId: lead.id,
      relatedLeadNumber: lead.leadNumber,
      orderDate: now.split('T')[0],
      orderValue: dealValue,
      assignedSalesExecutive: lead.assignedEmployeeName,
      assignedSalesExecutiveId: lead.assignedTo,
      orderStatus: 'confirmed',
      billingAddress: `${targetCustomer.address || targetCustomer.city}, ${targetCustomer.state}`,
      shippingAddress: `${targetCustomer.address || targetCustomer.city}, ${targetCustomer.state}`,
      paymentTerms: '30% Advance, 70% against dispatch',
      notes: `Generated upon converting Lead ${lead.leadNumber} (${lead.productService})`,
      createdAt: now,
    };

    // Update Lead to Won & link customer
    const updatedLead: Lead = {
      ...lead,
      status: 'won',
      customerId: targetCustomer.id,
      estimatedValue: dealValue,
      updatedAt: now,
    };

    const nextLeads = data.leads.map((l) => (l.id === leadId ? updatedLead : l));
    const nextOrders = [newOrder, ...data.orders];
    const nextEmployees = recalculateEmployeeMetrics(data.employees, nextLeads, data.tasks, nextOrders);

    // Audit logs & Notification
    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'order_converted',
      entity: 'Lead',
      entityId: lead.id,
      newValue: `Won - ${orderNumber} (₹${dealValue.toLocaleString('en-IN')})`,
      details: `Converted lead ${lead.leadNumber} into Customer ${targetCustomer.customerNumber} and created Sales Order ${orderNumber}`,
    };

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Deal Won & Converted!',
      message: `${lead.companyName} deal closed for ₹${dealValue.toLocaleString('en-IN')}. Sales Order ${orderNumber} created.`,
      type: 'lead_won',
      timestamp: now,
      isRead: false,
      relatedEntity: { type: 'order', id: newOrder.id },
    };

    saveState({
      ...data,
      leads: nextLeads,
      customers: nextCustomers,
      orders: nextOrders,
      employees: nextEmployees,
      notifications: [newNotif, ...data.notifications],
      auditLogs: [newAudit, ...data.auditLogs],
    });

    toast.success(`Deal Won! Converted to ${targetCustomer.customerNumber} and ${orderNumber}`);
    return { customer: targetCustomer, order: newOrder };
  }, [data, recalculateEmployeeMetrics, saveState]);

  // COMMON LEAD PROCESSING ENGINE (Handles IndiaMART & Justdial Webhooks)
  const processIncomingIntegrationPayload = useCallback((provider: IntegrationProvider, payload: Record<string, any>) => {
    const now = new Date().toISOString();
    const eventId = `evt_${Date.now()}`;
    const processingSteps: { step: string; status: 'pending' | 'success' | 'failed' | 'skipped'; timestamp: string; details?: string }[] = [];

    // Step 1: Receive incoming event
    processingSteps.push({ step: '1. Receive incoming event', status: 'success', timestamp: now, details: `Source: ${provider.toUpperCase()}` });

    // Step 2: Validate payload
    const phone = (payload.mobile || payload.phone || payload.phone_number || '').toString().trim().replace(/[^0-9]/g, '');
    const customerName = payload.buyer_name || payload.customer_name || payload.full_name || 'Anonymous Prospect';
    const sourceEnquiryId = payload.enquiry_id || payload.leadgen_id || `${provider.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    if (!phone || phone.length < 10) {
      processingSteps.push({ step: '2. Validate payload', status: 'failed', timestamp: now, details: 'Validation Error: Missing valid phone number' });
      const failedEvent: IntegrationEvent = {
        id: eventId,
        provider,
        sourceEnquiryId,
        eventType: 'lead_enquiry',
        receivedAt: now,
        status: 'failed',
        errorDetails: 'Validation error: Missing or invalid 10-digit mobile number.',
        retryCount: 0,
        rawPayload: payload,
        processingSteps,
      };

      // update integration config fail count
      const nextConfigs = data.integrationConfigs.map((cfg) =>
        cfg.id === provider ? { ...cfg, failedEvents: cfg.failedEvents + 1, lastSyncAt: now } : cfg
      );

      saveState({
        ...data,
        integrationEvents: [failedEvent, ...data.integrationEvents],
        integrationConfigs: nextConfigs,
      });

      return { success: false, event: failedEvent, message: 'Missing valid 10-digit phone number in payload' };
    }
    processingSteps.push({ step: '2. Validate payload', status: 'success', timestamp: now, details: 'Payload passed structure and schema validation' });

    // Step 3 & 4: Extract source enquiry ID
    processingSteps.push({ step: '3. Extract source enquiry ID', status: 'success', timestamp: now, details: `Enquiry ID: ${sourceEnquiryId}` });

    // Step 5: Normalize contact details (10-digit standard Indian format)
    const normalizedPhone = phone.slice(-10);
    processingSteps.push({ step: '4. Normalize contact details', status: 'success', timestamp: now, details: `Phone normalized to: +91 ${normalizedPhone}` });

    // Step 6: Check duplicate source enquiry ID (Idempotency Protection)
    const existingSourceLead = data.leads.find((l) => l.sourceEnquiryId === sourceEnquiryId);
    if (existingSourceLead) {
      processingSteps.push({ step: '5. Check duplicate source enquiry ID', status: 'failed', timestamp: now, details: `Duplicate found with existing Lead ${existingSourceLead.leadNumber}` });
      processingSteps.push({ step: '6. Idempotency suppression', status: 'success', timestamp: now, details: 'Idempotency activated: prevented duplicate creation' });

      const duplicateEvent: IntegrationEvent = {
        id: eventId,
        provider,
        sourceEnquiryId,
        eventType: 'lead_enquiry',
        receivedAt: now,
        status: 'duplicate',
        errorDetails: `Duplicate source enquiry ID: ${sourceEnquiryId} already exists in CRM as ${existingSourceLead.leadNumber}.`,
        retryCount: 0,
        rawPayload: payload,
        processingSteps,
      };

      saveState({
        ...data,
        integrationEvents: [duplicateEvent, ...data.integrationEvents],
      });

      return { success: false, event: duplicateEvent, isDuplicate: true, message: `Duplicate source enquiry ID ${sourceEnquiryId} already ingested` };
    }
    processingSteps.push({ step: '5. Check duplicate source enquiry ID', status: 'success', timestamp: now, details: 'Enquiry ID is unique' });

    // Step 7: Check potential duplicate phone / email in CRM
    const existingPhoneLead = data.leads.find((l) => l.phone.slice(-10) === normalizedPhone);
    const existingCustomer = data.customers.find((c) => c.phone.slice(-10) === normalizedPhone);
    let duplicateFlag = false;

    if (existingPhoneLead || existingCustomer) {
      duplicateFlag = true;
      processingSteps.push({
        step: '6. Potential duplicate check',
        status: 'success',
        timestamp: now,
        details: `Matching contact found: ${existingPhoneLead ? `Lead ${existingPhoneLead.leadNumber}` : `Customer ${existingCustomer?.customerNumber}`}. Queued for duplicate review.`,
      });
    } else {
      processingSteps.push({ step: '6. Potential duplicate check', status: 'success', timestamp: now, details: 'No prior contact matches found' });
    }

    // Step 8: Map fields to common CRM schema
    const city = payload.city || 'Indore';
    const state = payload.state || 'Madhya Pradesh';
    const productService = payload.product || payload.service || 'Industrial Water Pumps';
    const requirement = payload.message || payload.requirement || `Enquiry received for ${productService} from ${city}`;
    const companyName = payload.company || `${customerName} Industries`;

    const leadPartial: Partial<Lead> = {
      customerName,
      companyName,
      phone: normalizedPhone,
      email: payload.email || `${customerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      productService,
      requirement,
      quantity: payload.quantity || '1 Unit',
      city,
      state,
      country: 'India',
      source: provider === 'indiamart' ? 'indiamart' : 'justdial',
      sourceEnquiryId,
      priority: 'high',
      status: 'new',
      estimatedValue: 450000,
      notes: `Imported via ${provider.toUpperCase()} simulation on ${now}`,
      isDuplicateFlagged: duplicateFlag,
      customerId: existingCustomer?.id,
    };

    // Step 9: Lead Assignment Engine
    const assigned = determineAssignedEmployee(leadPartial, data);
    leadPartial.assignedTo = assigned.empId;
    leadPartial.assignedEmployeeName = assigned.empName;
    processingSteps.push({ step: '7. Lead Assignment Engine', status: 'success', timestamp: now, details: `Auto-assigned to ${assigned.empName} via ${data.settings.activeAssignmentRule} rule` });

    // Step 10: Create CRM Lead
    const leadCount = data.leads.length + 1;
    const leadNumber = `LF-2026-${String(leadCount).padStart(4, '0')}`;
    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      leadNumber,
      customerName: leadPartial.customerName!,
      companyName: leadPartial.companyName!,
      phone: leadPartial.phone!,
      alternatePhone: '',
      email: leadPartial.email!,
      productService: leadPartial.productService!,
      requirement: leadPartial.requirement!,
      quantity: leadPartial.quantity!,
      city: leadPartial.city!,
      state: leadPartial.state!,
      country: 'India',
      source: leadPartial.source!,
      sourceEnquiryId,
      assignedTo: assigned.empId,
      assignedEmployeeName: assigned.empName,
      priority: 'high',
      status: 'new',
      estimatedValue: leadPartial.estimatedValue!,
      notes: leadPartial.notes!,
      createdAt: now,
      updatedAt: now,
      nextFollowUp: new Date(Date.now() + 4 * 3600000).toISOString(), // due in 4 hours
      isDuplicateFlagged: duplicateFlag,
      customerId: existingCustomer?.id,
    };
    processingSteps.push({ step: '8. Create CRM Lead', status: 'success', timestamp: now, details: `Created Lead ${newLead.leadNumber}` });

    // Step 11: Create Activity
    const newActivity: LeadActivity = {
      id: `act_${Date.now()}`,
      leadId: newLead.id,
      type: 'system',
      title: `Lead Ingested from ${provider.toUpperCase()}`,
      description: `Enquiry ${sourceEnquiryId} captured and assigned to ${assigned.empName}.`,
      performedBy: 'Lead Engine',
      timestamp: now,
    };

    // Step 12: Trigger Notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: `New ${provider === 'indiamart' ? 'IndiaMART' : 'Justdial'} Lead!`,
      message: `${customerName} (${companyName}) requires ${productService} in ${city}. Assigned to ${assigned.empName}.`,
      type: 'new_lead',
      timestamp: now,
      isRead: false,
      relatedEntity: { type: 'lead', id: newLead.id },
    };

    // Step 13: Log Integration Event & Duplicate Review if flagged
    const nextDuplicates = [...data.duplicateReviews];
    if (duplicateFlag) {
      nextDuplicates.unshift({
        id: `dup_${Date.now()}`,
        leadId: newLead.id,
        existingLeadId: existingPhoneLead?.id,
        existingCustomerId: existingCustomer?.id,
        phone: normalizedPhone,
        email: newLead.email,
        customerName: newLead.customerName,
        companyName: newLead.companyName,
        source: newLead.source,
        enquiryDate: now,
        status: 'pending_review',
        matchedOn: 'phone',
      });
    }

    const successEvent: IntegrationEvent = {
      id: eventId,
      provider,
      sourceEnquiryId,
      eventType: 'lead_enquiry',
      receivedAt: now,
      status: 'success',
      retryCount: 0,
      rawPayload: payload,
      normalizedPayload: leadPartial,
      processingSteps,
      createdLeadId: newLead.id,
    };

    // Update integration config counts
    const nextConfigs = data.integrationConfigs.map((cfg) =>
      cfg.id === provider
        ? {
          ...cfg,
          totalImported: cfg.totalImported + 1,
          lastSyncAt: now,
        }
        : cfg
    );

    const nextLeads = [newLead, ...data.leads];
    const nextEmployees = recalculateEmployeeMetrics(data.employees, nextLeads, data.tasks, data.orders);

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: 'Lead Engine',
      userRole: 'System',
      action: 'integration_event_processed',
      entity: 'Lead',
      entityId: newLead.id,
      newValue: newLead.leadNumber,
      details: `Processed incoming ${provider.toUpperCase()} enquiry ${sourceEnquiryId} into Lead ${newLead.leadNumber}`,
    };

    saveState({
      ...data,
      leads: nextLeads,
      employees: nextEmployees,
      integrationConfigs: nextConfigs,
      integrationEvents: [successEvent, ...data.integrationEvents],
      duplicateReviews: nextDuplicates,
      notifications: [newNotif, ...data.notifications],
      auditLogs: [newAudit, ...data.auditLogs],
      settings: {
        ...data.settings,
        roundRobinIndex: data.settings.roundRobinIndex + 1,
      },
    });

    toast.success(`[SIMULATION] Captured new lead: ${newLead.leadNumber} (${customerName})`);
    return { success: true, event: successEvent, lead: newLead, message: 'Lead successfully captured and assigned' };
  }, [data, determineAssignedEmployee, recalculateEmployeeMetrics, saveState]);

  // Retry Failed Integration Event
  const retryIntegrationEvent = useCallback((eventId: string) => {
    const event = data.integrationEvents.find((e) => e.id === eventId);
    if (!event) return;

    const now = new Date().toISOString();
    // Simulate re-validating and fixing payload
    const fixedPayload = {
      ...event.rawPayload,
      phone: event.rawPayload.phone || '9826110099',
      mobile: event.rawPayload.mobile || '9826110099',
    };

    // Reprocess using common engine
    const result = processIncomingIntegrationPayload(event.provider, fixedPayload);

    // Update original event status
    const nextEvents = data.integrationEvents.map((e) =>
      e.id === eventId
        ? {
          ...e,
          status: 'retried' as const,
          retryCount: e.retryCount + 1,
          errorDetails: 'Event successfully retried and processed into CRM.',
        }
        : e
    );

    saveState({
      ...data,
      integrationEvents: nextEvents,
    });
    toast.success(`Event ${event.sourceEnquiryId} retried successfully!`);
  }, [data, processIncomingIntegrationPayload, saveState]);

  // Resolve Duplicate Lead
  const resolveDuplicate = useCallback((reviewId: string, resolution: 'merged' | 'kept_separate' | 'linked_enquiry', note?: string) => {
    const item = data.duplicateReviews.find((r) => r.id === reviewId);
    if (!item) return;

    const now = new Date().toISOString();
    const nextReviews = data.duplicateReviews.map((r) =>
      r.id === reviewId
        ? {
          ...r,
          status: resolution,
          resolvedAt: now,
          resolvedBy: data.currentUser.name,
          resolutionNote: note || `Resolved as ${resolution}`,
        }
        : r
    );

    // If merged or linked, remove duplicate flag on lead
    const nextLeads = data.leads.map((l) =>
      l.id === item.leadId
        ? {
          ...l,
          isDuplicateFlagged: false,
          duplicateOfId: item.existingLeadId,
          customerId: item.existingCustomerId || l.customerId,
          notes: `${l.notes}\n[Duplicate Resolution: ${resolution}] ${note || ''}`,
        }
        : l
    );

    const newAudit: AuditLogItem = {
      id: `aud_${Date.now()}`,
      timestamp: now,
      userName: data.currentUser.name,
      userRole: data.currentUser.role,
      action: 'duplicate_merged',
      entity: 'Lead',
      entityId: item.leadId,
      newValue: resolution,
      details: `Duplicate review resolved for ${item.customerName}: ${resolution}. ${note || ''}`,
    };

    saveState({
      ...data,
      leads: nextLeads,
      duplicateReviews: nextReviews,
      auditLogs: [newAudit, ...data.auditLogs],
    });
    toast.success(`Duplicate review marked as: ${resolution}`);
  }, [data, saveState]);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    saveState({
      ...data,
      notifications: data.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    });
  }, [data, saveState]);

  const markAllNotificationsRead = useCallback(() => {
    saveState({
      ...data,
      notifications: data.notifications.map((n) => ({ ...n, isRead: true })),
    });
    toast.success('All notifications marked as read');
  }, [data, saveState]);

  // Communication messages
  const addCommunicationMessage = useCallback((phoneOrEmail: string, message: Partial<CommunicationMessage>) => {
    const now = new Date().toISOString();
    const cleanPhone = phoneOrEmail.replace(/[^0-9]/g, '').slice(-10);

    const newMessage: CommunicationMessage = {
      id: `msg_${Date.now()}`,
      channel: message.channel || 'whatsapp',
      direction: message.direction || 'outbound',
      timestamp: now,
      senderName: message.senderName || data.currentUser.name,
      recipientPhoneOrEmail: cleanPhone,
      content: message.content || '',
      status: message.status || 'delivered',
      callDurationSeconds: message.callDurationSeconds,
      simulated: true,
    };

    let threadExists = false;
    const nextThreads = data.communicationThreads.map((thread) => {
      if (thread.phone.slice(-10) === cleanPhone || thread.email === phoneOrEmail) {
        threadExists = true;
        return {
          ...thread,
          lastMessageTime: now,
          messages: [...thread.messages, newMessage],
        };
      }
      return thread;
    });

    if (!threadExists) {
      const relatedLead = data.leads.find((l) => l.phone.slice(-10) === cleanPhone);
      nextThreads.unshift({
        customerId: relatedLead?.customerId,
        leadId: relatedLead?.id,
        customerName: relatedLead?.customerName || 'Customer Contact',
        customerCompany: relatedLead?.companyName || 'Independent',
        phone: cleanPhone,
        email: relatedLead?.email || '',
        lastMessageTime: now,
        unreadCount: 0,
        optInStatus: { whatsapp: true, sms: true, calling: true },
        messages: [newMessage],
      });
    }

    saveState({
      ...data,
      communicationThreads: nextThreads,
    });
    toast.success(`Message sent via ${message.channel?.toUpperCase()} (Simulated)`);
  }, [data, saveState]);

  // Update Assignment Rules
  const updateAssignmentRules = useCallback((rules: AssignmentRule[], activeType: 'round_robin' | 'source_based' | 'territory_based' | 'manual') => {
    saveState({
      ...data,
      assignmentRules: rules,
      settings: {
        ...data.settings,
        activeAssignmentRule: activeType,
      },
    });
    toast.success(`Assignment engine set to: ${activeType.replace('_', ' ').toUpperCase()}`);
  }, [data, saveState]);

  // Employees
  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    const nextEmployees = data.employees.map((e) => (e.id === id ? { ...e, ...updates } : e));
    saveState({
      ...data,
      employees: nextEmployees,
    });
    toast.success('Employee updated');
  }, [data, saveState]);

  const createEmployee = useCallback((empData: Partial<Employee>): Employee => {
    const count = data.employees.length + 1;
    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      employeeId: `EMP-${100 + count}`,
      fullName: empData.fullName || 'New Executive',
      email: empData.email || `employee${count}@leadflow.demo`,
      phone: empData.phone || '+91 98260 00000',
      department: empData.department || 'Sales',
      role: empData.role || 'executive',
      managerName: empData.managerName || 'Rajesh Kulkarni',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      metrics: {
        totalAssigned: 0,
        activeLeads: 0,
        pendingFollowUps: 0,
        convertedLeads: 0,
        conversionRate: 0,
        totalRevenueWon: 0,
      },
    };
    saveState({
      ...data,
      employees: [...data.employees, newEmp],
    });
    toast.success(`Employee ${newEmp.fullName} added`);
    return newEmp;
  }, [data, saveState]);

  // Settings
  const updateSettings = useCallback((newSettings: Partial<CRMStoreData['settings']>) => {
    saveState({
      ...data,
      settings: {
        ...data.settings,
        ...newSettings,
      },
    });
    toast.success('Settings updated');
  }, [data, saveState]);

  // Reset Demo Data (Super Admin only)
  const resetDemoData = useCallback(() => {
    if (normalizedRole !== 'super_admin') {
      toast.error('Access Denied: Only the Super Admin can reset demo data.');
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORE_DATA));
      setData(INITIAL_STORE_DATA);
      toast.success('Demo environment reset to initial seed data!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to reset demo data');
    }
  }, [normalizedRole]);

  // Export Data as JSON
  const exportDataAsJSON = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const value = useMemo(
    () => ({
      ...data,
      isLoaded,
      activeRole: data.currentUser.role,
      normalizedRole,
      scopedLeads,
      scopedCustomers,
      scopedTasks,
      scopedQuotations,
      scopedOrders,
      scopedEmployees,
      can,
      hasPermission,
      updateRolePermission,
      isAuthenticated,
      getRoleDashboardPath,
      login,
      logout,
      changePassword,
      isSessionExpired,
      toggleSessionExpirySimulation,
      switchUser,
      createLead,
      updateLead,
      deleteLead,
      bulkAssignLeads,
      bulkUpdateLeadStatus,
      bulkImportLeads,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      createTask,
      updateTask,
      deleteTask,
      createQuotation,
      updateQuotation,
      reviseQuotation,
      deleteQuotation,
      createSalesOrder,
      updateSalesOrder,
      convertLeadToCustomerAndOrder,
      processIncomingIntegrationPayload,
      retryIntegrationEvent,
      resolveDuplicate,
      markNotificationRead,
      markAllNotificationsRead,
      addCommunicationMessage,
      updateAssignmentRules,
      updateEmployee,
      createEmployee,
      updateSettings,
      resetDemoData,
      exportDataAsJSON,
    }),
    [
      data,
      isLoaded,
      normalizedRole,
      scopedLeads,
      scopedCustomers,
      scopedTasks,
      scopedQuotations,
      scopedOrders,
      scopedEmployees,
      can,
      hasPermission,
      updateRolePermission,
      isAuthenticated,
      getRoleDashboardPath,
      login,
      logout,
      changePassword,
      isSessionExpired,
      toggleSessionExpirySimulation,
      switchUser,
      createLead,
      updateLead,
      deleteLead,
      bulkAssignLeads,
      bulkUpdateLeadStatus,
      bulkImportLeads,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      createTask,
      updateTask,
      deleteTask,
      createQuotation,
      updateQuotation,
      reviseQuotation,
      deleteQuotation,
      createSalesOrder,
      updateSalesOrder,
      convertLeadToCustomerAndOrder,
      processIncomingIntegrationPayload,
      retryIntegrationEvent,
      resolveDuplicate,
      markNotificationRead,
      markAllNotificationsRead,
      addCommunicationMessage,
      updateAssignmentRules,
      updateEmployee,
      createEmployee,
      updateSettings,
      resetDemoData,
      exportDataAsJSON,
    ]
  );

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}

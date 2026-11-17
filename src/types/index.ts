// ============================================================================
// LEADFLOW CRM - CENTRALIZED TYPES & DATA CONTRACTS
// ============================================================================

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'sales_manager'
  | 'sales_executive'
  | 'read_only'
  | 'manager'
  | 'executive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title: string;
  phone?: string;
  department?: string;
  teamId?: string;
  teamName?: string;
}

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'assign'
  | 'export'
  | 'configure'
  | 'approve';

export interface RolePermissions {
  role: UserRole;
  displayName: string;
  description: string;
  canViewAllLeads: boolean;
  canCreateLeads: boolean;
  canEditLeads: boolean;
  canDeleteLeads: boolean;
  canAssignLeads: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
  canManageIntegrations: boolean;
  canViewAuditLogs: boolean;
  canManageSettings: boolean;
  canViewReports: boolean;
}

export type LeadSource = 'indiamart' | 'justdial';

export type LeadStatus =
  | 'new'
  | 'assigned'
  | 'contact_attempted'
  | 'contacted'
  | 'qualified'
  | 'quotation_sent'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'nurture'
  | 'disqualified';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskPriority = LeadPriority;

export interface LeadHistoryItem {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'call' | 'whatsapp' | 'email' | 'note' | 'status_change' | 'system' | 'quotation' | 'assignment';
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Lead {
  id: string;
  leadNumber: string; // e.g. LF-2026-0042
  customerName: string;
  contactPerson?: string;
  companyName: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  productService: string;
  requirement: string;
  productRequirement?: string;
  quantity?: string;
  city: string;
  state: string;
  country: string;
  source: LeadSource;
  sourceEnquiryId?: string; // e.g. IM-2026-1001 or JD-2026-2001
  assignedTo: string; // Employee ID
  assignedEmployeeName: string;
  priority: LeadPriority;
  status: LeadStatus;
  estimatedValue: number; // in INR
  budget?: number; // alias for estimatedValue
  notes: string;
  createdAt: string;
  updatedAt: string;
  nextFollowUp?: string; // ISO date-time string
  lastContactedAt?: string;
  lostReason?: string;
  tags?: string[];
  isDuplicateFlagged?: boolean;
  duplicateOfId?: string;
  customerId?: string; // linked customer once converted or existing
}

export interface Customer {
  id: string;
  customerNumber: string; // e.g. CUST-1001
  name: string;
  company: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  city: string;
  state: string;
  address?: string;
  gstin?: string;
  relationshipOwner: string; // Employee Name
  relationshipOwnerId: string;
  totalEnquiries: number;
  totalQuotations: number;
  totalOrders: number;
  customerValue: number; // Total won order amount in INR
  status: 'active' | 'vip' | 'inactive';
  createdAt: string;
  enquiryIds: string[]; // List of Lead IDs
  notes?: string;
}

export type TaskType =
  | 'first_call'
  | 'followup_call'
  | 'whatsapp'
  | 'email'
  | 'send_quotation'
  | 'meeting'
  | 'negotiation'
  | 'other';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface FollowUpTask {
  id: string;
  taskTitle: string;
  title?: string;
  taskType: TaskType;
  relatedLeadId: string;
  leadId?: string;
  relatedLeadNumber?: string;
  customerName: string;
  contactPerson?: string;
  companyName: string;
  phone: string;
  assignedTo: string; // Employee ID
  assignedEmployeeName: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  priority: LeadPriority;
  description: string;
  status: TaskStatus;
  completedAt?: string;
  completedNotes?: string;
  createdAt: string;
  isEscalated?: boolean;
}

export interface QuotationItem {
  id: string;
  productName: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number; // e.g. 18 for 18% GST
  taxAmount: number;
  totalAmount: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'revised' | 'accepted' | 'rejected' | 'expired';

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. QT-2026-089
  version: number;
  customerId?: string;
  customerName: string;
  contactPerson?: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerGstin?: string;
  relatedLeadId: string;
  leadId?: string;
  relatedLeadNumber?: string;
  assignedTo: string;
  assignedEmployeeName: string;
  items: QuotationItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  termsAndConditions: string;
  validUntil: string; // YYYY-MM-DD
  status: QuotationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  revisionHistory?: {
    version: number;
    updatedAt: string;
    updatedBy: string;
    grandTotal: number;
    reason: string;
  }[];
}

export type OrderStatus = 'pending_confirmation' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

export interface SalesOrder {
  id: string;
  orderNumber: string; // e.g. SO-2026-042
  customerId: string;
  customerName: string;
  contactPerson?: string;
  customerCompany: string;
  companyName?: string;
  relatedLeadId: string;
  leadId?: string;
  relatedLeadNumber?: string;
  quotationId?: string;
  quotationNumber?: string;
  orderDate: string; // YYYY-MM-DD
  orderValue: number;
  assignedSalesExecutive: string;
  assignedSalesExecutiveId: string;
  orderStatus: OrderStatus;
  billingAddress: string;
  shippingAddress: string;
  paymentTerms: string;
  notes?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeId: string; // e.g. EMP-101
  fullName: string;
  name?: string;
  title?: string;
  email: string;
  phone: string;
  department: 'Sales' | 'Management' | 'Technical' | 'Customer Support' | 'Executive Management';
  role: UserRole;
  teamId?: string;
  teamName?: string;
  managerId?: string;
  managerName?: string;
  joiningDate: string;
  status: 'active' | 'on_leave' | 'inactive';
  avatar?: string;
  metrics?: {
    totalAssigned: number;
    activeLeads: number;
    pendingFollowUps: number;
    convertedLeads: number;
    conversionRate: number;
    totalRevenueWon: number;
  };
}

export type IntegrationProvider = 'indiamart' | 'justdial';

export interface IntegrationConfig {
  id: IntegrationProvider;
  name: string;
  logo: string;
  description: string;
  status: 'connected_simulated' | 'configuration_required' | 'not_connected' | 'error';
  mode: 'push_api' | 'pull_api' | 'webhook';
  webhookUrl: string;
  apiKeyPlaceholder: string;
  lastSyncAt: string | null;
  totalImported: number;
  failedEvents: number;
  isEnabled: boolean;
  notes: string;
}

export type IntegrationEventStatus =
  | 'received'
  | 'processing'
  | 'success'
  | 'failed'
  | 'retried'
  | 'duplicate';

export interface IntegrationEvent {
  id: string;
  provider: IntegrationProvider;
  sourceEnquiryId: string;
  eventType: 'lead_enquiry' | 'status_callback' | 'delivery_report' | 'call_log';
  receivedAt: string;
  status: IntegrationEventStatus;
  errorDetails?: string;
  retryCount: number;
  rawPayload: Record<string, any>;
  normalizedPayload?: Record<string, any>;
  processingSteps: {
    step: string;
    status: 'pending' | 'success' | 'failed' | 'skipped';
    timestamp: string;
    details?: string;
  }[];
  createdLeadId?: string;
}

export interface DuplicateReviewItem {
  id: string;
  leadId: string;
  existingLeadId?: string;
  existingCustomerId?: string;
  phone: string;
  email: string;
  customerName: string;
  contactPerson?: string;
  companyName: string;
  source: LeadSource;
  enquiryDate: string;
  status: 'pending_review' | 'merged' | 'kept_separate' | 'linked_enquiry';
  matchedOn: 'phone' | 'email' | 'company' | 'source_enquiry_id';
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type:
    | 'new_lead'
    | 'lead_assigned'
    | 'followup_due'
    | 'followup_overdue'
    | 'quotation_accepted'
    | 'quotation_rejected'
    | 'lead_won'
    | 'integration_failure'
    | 'task_assigned'
    | 'escalation';
  timestamp: string;
  isRead: boolean;
  relatedEntity?: {
    type: 'lead' | 'customer' | 'quotation' | 'order' | 'task' | 'integration';
    id: string;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action:
    | 'lead_created'
    | 'lead_edited'
    | 'lead_assigned'
    | 'lead_reassigned'
    | 'lead_status_changed'
    | 'customer_created'
    | 'quotation_generated'
    | 'quotation_revised'
    | 'order_converted'
    | 'followup_scheduled'
    | 'followup_completed'
    | 'integration_event_processed'
    | 'event_retried'
    | 'duplicate_merged'
    | 'settings_updated';
  entity: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  details: string;
  ipAddress?: string;
}

export interface CommunicationMessage {
  id: string;
  channel: 'whatsapp' | 'sms' | 'call' | 'email';
  direction: 'inbound' | 'outbound';
  timestamp: string;
  senderName: string;
  recipientPhoneOrEmail: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'completed' | 'missed' | 'busy';
  callDurationSeconds?: number;
  recordingUrl?: string;
  simulated: boolean;
}

export interface CommunicationThread {
  customerId?: string;
  leadId?: string;
  customerName: string;
  contactPerson?: string;
  customerCompany: string;
  phone: string;
  email: string;
  lastMessageTime: string;
  unreadCount: number;
  optInStatus: {
    whatsapp: boolean;
    sms: boolean;
    calling: boolean;
  };
  messages: CommunicationMessage[];
}

export interface AssignmentRule {
  id: string;
  ruleType: 'round_robin' | 'source_based' | 'territory_based' | 'product_based';
  name: string;
  isActive: boolean;
  config: {
    eligibleEmployeeIds: string[];
    sourceMappings?: Record<string, string[]>; // e.g. { indiamart: ['EMP-101', 'EMP-102'] }
    territoryMappings?: Record<string, string[]>; // e.g. { 'Madhya Pradesh': ['EMP-101'], 'Maharashtra': ['EMP-102'] }
    productMappings?: Record<string, string[]>; // e.g. { 'Pumps': ['EMP-101'] }
  };
}

export interface CRMStoreData {
  currentUser: User;
  leads: Lead[];
  customers: Customer[];
  tasks: FollowUpTask[];
  quotations: Quotation[];
  orders: SalesOrder[];
  employees: Employee[];
  integrationConfigs: IntegrationConfig[];
  integrationEvents: IntegrationEvent[];
  duplicateReviews: DuplicateReviewItem[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  communicationThreads: CommunicationThread[];
  assignmentRules: AssignmentRule[];
  rolePermissions: Record<string, RolePermissions>;
  settings: {
    companyName: string;
    companyPhone: string;
    companyEmail: string;
    companyAddress: string;
    companyGstin: string;
    currency: string;
    timeZone: string;
    dateFormat: string;
    roundRobinIndex: number;
    activeAssignmentRule: 'round_robin' | 'source_based' | 'territory_based' | 'manual';
    autoDuplicateCheck: boolean;
    communicationMode: 'manual' | 'integrated_simulated';
  };
}

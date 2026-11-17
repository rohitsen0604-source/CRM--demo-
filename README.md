# LeadFlow CRM
### Centralized Lead Management, Role-Based Access Control (RBAC) & Sales Automation Platform for Indian B2B Enterprises

> **LeadFlow CRM** is an enterprise-grade, fully interactive B2B Sales Execution, Ingestion, and Role-Based Governance Platform designed specifically for manufacturers, distributors, industrial equipment suppliers, and enterprises receiving buyer enquiries strictly from **IndiaMART** and **Justdial**.

---

## 🌟 Executive Summary

Indian B2B businesses lose an estimated **40% of prospective buyer enquiries** due to delayed response times, fragmented spreadsheets, manual IndiaMART/Justdial copy-pasting, lack of follow-up discipline, and zero visibility into sales executive workloads.

**LeadFlow CRM** bridges this critical gap by unifying fragmented enquiry channels into a single, high-velocity sales cockpit featuring:
- **Enterprise Role-Based Access Control (RBAC)**: 5 distinct security tiers (`Super Admin`, `Admin`, `Sales Manager`, `Sales Executive`, `Read-Only Management`) with dedicated role dashboards, scoped sidebars, and URL route guards.
- **Strict Data Scoping & Isolation**: Sales Executives view only their assigned leads (15 leads for Amit Patel); Sales Managers view only their assigned team (27 leads for Rahul Mehta in Team Alpha); Admins and Super Admins view organization-wide records (45 leads).
- **Zero-Latency Ingestion Engine**: Direct simulated webhooks for IndiaMART and Justdial with automated deduplication and phone number normalization.
- **Dual-Mode Communication Center**: Instant 1-click WhatsApp (`wa.me`) and direct phone dialing alongside cloud telephony simulations.
- **Dynamic Quotation & GST Engine**: Itemized line-item quotation builder with automated 18% GST calculation, revision history, and branded PDF generation.
- **100% Interconnected Architecture**: Complete client-side reactive store persisted in `localStorage`—no backend or database required for full enterprise demonstration.

---

## 🔐 5 Dedicated Demo Personas & Credentials

The platform features true enterprise RBAC. Use the one-click login chips on `/login` or enter the credentials below (Password for all accounts: `Demo@123`):

| Role | Demo Email | Full Name | Primary Scope & Access | Key Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@leadflow.demo` | **Vikramaditya Singhania** | Platform Owner (Apex Engineering Technologies) | Unrestricted root privileges, RBAC matrix, Security audit logs, Backup export, Factory reset |
| **Admin** | `admin@leadflow.demo` | **Ankit Verma** | Daily Operations Head | Organization-wide leads (45), lead assignments, pipeline monitoring, integrations, delete leads |
| **Sales Manager** | `manager@leadflow.demo` | **Rahul Mehta** | Team Alpha Leader | Scoped strictly to Team Alpha (27 leads: Amit & Priya), team quotas, reassignments, team reports |
| **Sales Executive** | `rahul@leadflow.demo` | **Amit Patel** | Senior Sales Rep (Team Alpha) | Scoped strictly to personal workspace (15 assigned leads), WhatsApp/Call dialers, personal quotes |
| **Read-Only / Mgmt** | `viewer@leadflow.demo` | **Aditya Birla** | Executive Board Observer | Executive KPI summaries, channel ROI (IndiaMART 480%, Justdial 390%), audit reports; edit/delete blocked |

---

## 🛡️ Enterprise RBAC Hierarchy & Route Governance

```
SUPER ADMIN (Platform Owner - Vikramaditya)
    │
    ├─► ADMIN (Daily Operations Head - Ankit)
    │     │
    │     ├─► SALES MANAGER (Team Alpha - Rahul / Team Beta - Neha)
    │     │     │
    │     │     └─► SALES EXECUTIVE (Amit Patel, Priya Joshi, Karan Singh, Sneha Verma)
    │
    └─► READ-ONLY / AUDITOR (Executive Board - Aditya Birla)
```

### Route Authorization Table
| Route | Super Admin | Admin | Sales Manager | Sales Executive | Read-Only |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `/dashboard` | Super Admin Dashboard | Admin Dashboard | Team Alpha Dashboard | Personal Sales Desk | Executive BI Summary |
| `/leads` | All 45 Leads | All 45 Leads | Team Alpha (27 Leads) | Personal (15 Leads) | View All (Read-Only) |
| `/pipeline` | Full Control | Full Control | Team Alpha Deals | Personal Deals | View Only (Drag Disabled) |
| `/customers` | Full (Create/Edit) | Full (Create/Edit) | Team Accounts | Assigned Accounts | View Only |
| `/follow-ups` | All Tasks | All Tasks | Team Tasks | Personal Tasks | View Only |
| `/quotations` | Full (GST/Print) | Full (GST/Print) | Team Quotes | Personal Quotes | View Only |
| `/sales-orders` | Full Control | Full Control | Team Orders | Personal Orders | View Only |
| `/team` | Full Management | Operational | Team Alpha Only | **403 Forbidden** | **403 Forbidden** |
| `/integrations` | Full Control | Operational | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |
| `/audit-logs` | Full Vault | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |
| `/settings` | All 9 Tabs | Operational (5 Tabs) | Team/Profile | Profile Tab Only | Profile Tab Only |

> [!NOTE]
> Attempting to navigate directly via URL to a forbidden route triggers an enterprise **HTTP 403 Forbidden Access Screen** explaining the restriction and providing a quick link to return or elevate permissions in demo mode.

---

## 📊 5 Distinct Role Dashboards

1. **Super Admin Dashboard**:
   - Platform Health (99.98% Uptime), Total Leads (45), Enterprise Revenue (₹68,45,000), Active Users (9).
   - Ingestion Gateway Telemetry (IndiaMART latency 124ms, Justdial latency 168ms, Deduplication engine 12ms).
   - Monthly Ingestion Trajectory vs Closed Revenue line chart.
   - RBAC Privilege breakdown table & Recent Super Admin Audit Trail.
   - Actions: Export JSON Backup, Factory Reset Demo Environment.

2. **Admin Dashboard**:
   - Operations Command Center with Unassigned Inquiries Alert & Duplicate Review notifications.
   - Sales Executive Workload & Capacity Utilization grid (Amit, Priya, Karan, Sneha).
   - Ingestion Source Funnel (IndiaMART & Justdial ONLY).
   - Quick Actions: Bulk Assign Leads, Review Ingestion Webhooks, Inspect Pending Quotes.

3. **Sales Manager Dashboard (Team Alpha - Rahul Mehta)**:
   - Scoped strictly to 27 Team Alpha leads (Amit Patel's 15 leads + Priya Joshi's 12 leads).
   - Head-to-head executive leaderboard and quota attainment (74% of team target).
   - Team Alpha Pipeline Stage Velocity bar chart.
   - Escalation drawer for overdue Team Alpha follow-ups.

4. **Sales Executive Dashboard (Amit Patel - rahul@leadflow.demo)**:
   - Personal Workspace scoped strictly to 15 assigned leads.
   - Monthly Target Progress Bar (₹12.5L / ₹20L achieved — 62.5%).
   - Urgent Follow-ups drawer with 1-click **Direct WhatsApp** and **Voice Call** triggers.
   - Quick Action shortcuts: Open Lead Dialer, Generate Quote, Schedule Site Visit.

5. **Read-Only / Management Dashboard (Aditya Birla)**:
   - High-level executive telemetry for board members and external auditors.
   - Channel Acquisition ROI Analysis (IndiaMART: 480% ROAS, Justdial: 390% ROAS, Website: 820% ROAS).
   - Cross-Team quarterly quota comparisons (Team Alpha 82% vs Team Beta 68%).
   - Average Sales Cycle Velocity (18.4 days).
   - Export Board Briefing PDF/Excel.

---

## 🚀 15 Core Application Modules

1. **Role-Tailored Dashboards (`/dashboard`)**: 5 separate dashboards dynamically rendered by role.
2. **Leads Management (`/leads`)**: Ingested leads with 1-click WhatsApp (`wa.me`) templates, live call timer dialer, CSV/Excel bulk import & update, and Microsoft Excel (.xls) export.
3. **Visual Pipeline Kanban (`/pipeline`)**: 11-stage deal progression with drag-and-drop and loss reason categorization.
4. **Customer Accounts (`/customers`)**: Lifetime client value, repeat sales, and GSTIN master records.
5. **Follow-ups & Task Automation (`/follow-ups`)**: Scheduled calls, meetings, and manager escalation alerts.
6. **Commercial Calendar (`/calendar`)**: Day, week, and month agenda views for demos and site visits.
7. **Communication Center (`/communications`)**: Unified timeline of logged WhatsApp chats and phone calls.
8. **Quotations & GST Builder (`/quotations`)**: Itemized proposals with automated 18% GST calculation, revisions, and branded PDF print previews.
9. **Sales Orders (`/sales-orders`)**: Conversion from won quotations, fulfillment tracking, and payment terms.
10. **Team Management (`/team`)**: Employee quotas, territory distribution, and managerial workload balancing.
11. **Reports & Analytics (`/reports`)**: Lead source performance, conversion funnel, lost lead analysis, and revenue velocity.
12. **Integration Center (`/integrations`)**: IndiaMART and Justdial webhook simulator, payload inspector, and duplicate detection.
13. **Tamper-Proof Audit Vault (`/audit-logs`)**: Super Admin security events, RBAC modifications, and data exports.
14. **Notification Center (`/notifications`)**: Real-time alerts for incoming leads, SLA breaches, and approvals.
15. **Enterprise Settings (`/settings`)**: Multi-tenant parameters, RBAC Matrix, assignment algorithms, and demo data management.

---

## 🛠️ Technology Stack & Execution

- **Framework**: Next.js 14 (App Router, Server Components & React Client Boundaries)
- **Language**: TypeScript (Strict typing across all domain models)
- **Styling**: Tailwind CSS (Sophisticated neutral enterprise design system)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Responsive charts: pie, bar, line, funnel)
- **Notifications**: Sonner (Toast notifications for every user interaction)
- **Persistence**: Centralized React Context state (`crmStore.tsx`) synced with browser `localStorage`
- **Zero Backend Dependency**: Fully self-contained local state with factory seed data and reset capabilities.

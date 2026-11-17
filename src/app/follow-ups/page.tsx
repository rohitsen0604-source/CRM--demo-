'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { FollowUpTask, TaskStatus, TaskType, LeadPriority } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  FileText,
  Users,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Filter,
  X,
  Search,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

function FollowUpsContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const {
    scopedTasks: tasks,
    scopedLeads: leads,
    scopedEmployees: employees,
    normalizedRole,
    can,
    createTask,
    updateTask,
    deleteTask
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(filterParam === 'overdue' ? 'overdue' : 'all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [repFilter, setRepFilter] = useState<string>('all');

  // Create / Edit Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FollowUpTask | null>(null);

  // Reschedule Modal
  const [reschedulingTask, setReschedulingTask] = useState<FollowUpTask | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00');

  // Form State
  const [formData, setFormData] = useState({
    taskTitle: '',
    taskType: 'followup_call' as TaskType,
    customerName: '',
    companyName: '',
    phone: '',
    relatedLeadId: '',
    assignedTo: employees[0]?.id || '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '11:00',
    priority: 'high' as LeadPriority,
    description: '',
    status: 'pending' as TaskStatus,
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Derived tasks lists
  const overdueTasks = tasks.filter((t) => t.status === 'overdue');
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed' && t.status !== 'cancelled');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (
          !t.taskTitle.toLowerCase().includes(q) &&
          !t.customerName.toLowerCase().includes(q) &&
          !t.companyName.toLowerCase().includes(q) &&
          !t.phone.includes(q)
        ) {
          return false;
        }
      }
      if (statusFilter === 'overdue' && t.status !== 'overdue') return false;
      if (statusFilter === 'today' && (t.dueDate !== todayStr || t.status === 'completed')) return false;
      if (statusFilter === 'pending' && t.status !== 'pending') return false;
      if (statusFilter === 'completed' && t.status !== 'completed') return false;
      if (typeFilter !== 'all' && t.taskType !== typeFilter) return false;
      if (repFilter !== 'all' && t.assignedTo !== repFilter) return false;
      return true;
    });
  }, [tasks, searchTerm, statusFilter, typeFilter, repFilter, todayStr]);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      taskTitle: '',
      taskType: 'followup_call',
      customerName: '',
      companyName: '',
      phone: '',
      relatedLeadId: '',
      assignedTo: employees[0]?.id || '',
      dueDate: todayStr,
      dueTime: '11:00',
      priority: 'high',
      description: '',
      status: 'pending',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: FollowUpTask) => {
    setEditingTask(task);
    setFormData({
      taskTitle: task.taskTitle,
      taskType: task.taskType,
      customerName: task.customerName,
      companyName: task.companyName,
      phone: task.phone,
      relatedLeadId: task.relatedLeadId || '',
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: task.priority,
      description: task.description,
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskTitle || !formData.customerName) {
      toast.error('Task title and customer name are required');
      return;
    }

    const assignedEmp = employees.find((e) => e.id === formData.assignedTo);
    const assignedEmployeeName = assignedEmp ? assignedEmp.fullName : employees[0]?.fullName || 'Rahul Sharma';

    if (editingTask) {
      updateTask(editingTask.id, {
        ...formData,
        assignedEmployeeName,
      });
    } else {
      createTask({
        ...formData,
        assignedEmployeeName,
      });
    }
    setIsModalOpen(false);
  };

  const handleCompleteTask = (id: string) => {
    updateTask(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedNotes: 'Completed via Follow-ups workspace',
    });
    toast.success('Task marked as Completed!');
  };

  const handleRescheduleSubmit = () => {
    if (!reschedulingTask || !rescheduleDate) return;
    updateTask(reschedulingTask.id, {
      dueDate: rescheduleDate,
      dueTime: rescheduleTime,
      status: 'pending',
      isEscalated: false,
    });
    toast.success(`Rescheduled task to ${formatDate(rescheduleDate)} at ${rescheduleTime}`);
    setReschedulingTask(null);
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Follow-ups & Task Automation
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {tasks.filter((t) => t.status !== 'completed').length} Pending Tasks
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage call schedules, client meetings, quotation deadlines, and automated manager escalations
          </p>
        </div>

        {normalizedRole !== 'read_only' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* OVERDUE ESCALATION BANNER */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-950 dark:text-rose-200">
                MANAGER ESCALATION: {overdueTasks.length} Follow-ups Overdue by 24+ Hours
              </h4>
              <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80">
                Automated escalation triggered for {overdueTasks.map((t) => t.customerName).join(', ')}. Reschedule or complete immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('overdue')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Filter Overdue Tasks
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('today')}
          className="p-3.5 rounded-xl bg-card border border-border cursor-pointer hover:border-emerald-500 transition-colors"
        >
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Due Today
          </span>
          <div className="text-xl font-bold text-foreground">{todayTasks.length}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Scheduled for today</span>
        </div>

        <div
          onClick={() => setStatusFilter('overdue')}
          className="p-3.5 rounded-xl bg-card border border-border cursor-pointer hover:border-rose-500 transition-colors"
        >
          <span className="text-[10px] font-semibold text-rose-600 uppercase">
            Overdue Escalations
          </span>
          <div className="text-xl font-bold text-rose-600">{overdueTasks.length}</div>
          <span className="text-[10px] text-muted-foreground">Action required</span>
        </div>

        <div
          onClick={() => setStatusFilter('completed')}
          className="p-3.5 rounded-xl bg-card border border-border cursor-pointer hover:border-emerald-500 transition-colors"
        >
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Completed Tasks
          </span>
          <div className="text-xl font-bold text-emerald-600">{completedTasks.length}</div>
          <span className="text-[10px] text-muted-foreground">Successfully closed</span>
        </div>

        <div
          onClick={() => setStatusFilter('all')}
          className="p-3.5 rounded-xl bg-card border border-border cursor-pointer hover:border-border transition-colors"
        >
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            All Tasks
          </span>
          <div className="text-xl font-bold text-foreground">{tasks.length}</div>
          <span className="text-[10px] text-muted-foreground">Total task backlog</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, clients, phone..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="today">Due Today</option>
            <option value="overdue">Overdue</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="all">All Task Types</option>
            <option value="first_call">First Call</option>
            <option value="followup_call">Follow-up Call</option>
            <option value="whatsapp">WhatsApp Follow-up</option>
            <option value="send_quotation">Send Quotation</option>
            <option value="meeting">Client Meeting</option>
            <option value="negotiation">Negotiation Follow-up</option>
          </select>

          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="all">All Reps</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="text-muted-foreground text-xs">
          Showing <strong>{filteredTasks.length}</strong> tasks
        </div>
      </div>

      {/* TASKS LIST */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
            <CheckSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
            <p className="font-semibold text-sm">No tasks matching current filter</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = task.status === 'overdue';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all bg-card ${isOverdue
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                  : isCompleted
                    ? 'border-border/60 opacity-75'
                    : 'border-border hover:shadow-sm'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Column: Checkbox & Info */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={isCompleted}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-border hover:border-emerald-600 text-transparent'
                        }`}
                      title={isCompleted ? 'Completed' : 'Click to Mark Complete'}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current text-white" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                        >
                          {task.taskTitle}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${task.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800 font-extrabold'
                            : task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {task.status}
                        </span>
                        {task.isEscalated && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-600 text-white animate-pulse">
                            Escalated
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-2">
                        <span>
                          Client: <strong className="text-foreground">{task.customerName}</strong> ({task.companyName})
                        </span>
                        <span>• Phone: <strong className="font-mono">{task.phone}</strong></span>
                        <span>• Rep: <strong>{task.assignedEmployeeName}</strong></span>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Time, Reschedule, Actions */}
                  <div className="flex items-center gap-3 shrink-0 sm:self-center">
                    <div className="text-right text-xs">
                      <div
                        className={`font-semibold flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-foreground'
                          }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(task.dueDate)} at {task.dueTime}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">
                        {task.taskType.replace('_', ' ')}
                      </div>
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => {
                          setReschedulingTask(task);
                          setRescheduleDate(task.dueDate);
                          setRescheduleTime(task.dueTime);
                        }}
                        className="px-2.5 py-1 rounded bg-muted hover:bg-card text-xs font-semibold border border-border"
                      >
                        Reschedule
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1 rounded text-muted-foreground hover:bg-muted"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-muted"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RESCHEDULE MODAL */}
      {reschedulingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Reschedule Follow-up</h3>
              <button onClick={() => setReschedulingTask(null)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select new date and time for &ldquo;{reschedulingTask.taskTitle}&rdquo;
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">New Follow-up Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">New Follow-up Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingTask(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRescheduleSubmit}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
              >
                Save Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {editingTask ? 'Edit Follow-up Task' : 'Schedule New Follow-up Task'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.taskTitle}
                  onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
                  placeholder="e.g. Price negotiation call with factory owner"
                  className="w-full p-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Task Type</label>
                  <select
                    value={formData.taskType}
                    onChange={(e) => setFormData({ ...formData, taskType: e.target.value as TaskType })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  >
                    <option value="first_call">First Call</option>
                    <option value="followup_call">Follow-up Call</option>
                    <option value="whatsapp">WhatsApp Follow-up</option>
                    <option value="email">Email Follow-up</option>
                    <option value="send_quotation">Send Quotation</option>
                    <option value="meeting">Client Meeting</option>
                    <option value="negotiation">Negotiation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as LeadPriority })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Due Time</label>
                  <input
                    type="time"
                    required
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Assignee</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
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
                <label className="block font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function FollowUpsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">Loading tasks...</div>}>
      <FollowUpsContent />
    </Suspense>
  );
}

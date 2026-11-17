'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useCRM } from '@/store/crmStore';
import { FollowUpTask, TaskStatus, TaskType } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Phone,
  MessageSquare,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export default function CalendarPage() {
  const { 
    scopedTasks: tasks, 
    scopedEmployees: employees, 
    normalizedRole,
    can,
    updateTask, 
    createTask 
  } = useCRM();

  const [currentDate, setCurrentDate] = useState(new Date('2026-11-17T00:00:00'));
  const [activeView, setActiveView] = useState<CalendarView>('month');

  // Selected event for detail modal
  const [selectedTask, setSelectedTask] = useState<FollowUpTask | null>(null);

  // New Event Modal
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventDate, setNewEventDate] = useState('2026-11-17');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCustomer, setNewEventCustomer] = useState('');
  const [newEventTime, setNewEventTime] = useState('11:00');
  const [newEventType, setNewEventType] = useState<TaskType>('followup_call');
  const [newEventRep, setNewEventRep] = useState(employees[0]?.id || '');

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const daysArray = useMemo(() => {
    const arr = [];
    // padding from prev month
    for (let i = 0; i < firstDayIndex; i++) {
      arr.push({ day: null, dateStr: '' });
    }
    // days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      arr.push({ day: d, dateStr });
    }
    return arr;
  }, [year, month, daysInMonth, firstDayIndex]);

  const handlePrev = () => {
    if (activeView === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (activeView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 86400000));
    }
  };

  const handleNext = () => {
    if (activeView === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (activeView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 86400000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-11-17T00:00:00'));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventCustomer) {
      toast.error('Event title and client name are required');
      return;
    }
    const rep = employees.find((e) => e.id === newEventRep);
    createTask({
      taskTitle: newEventTitle,
      customerName: newEventCustomer,
      dueDate: newEventDate,
      dueTime: newEventTime,
      taskType: newEventType,
      assignedTo: rep ? rep.id : employees[0]?.id,
      assignedEmployeeName: rep ? rep.fullName : employees[0]?.fullName,
      priority: 'high',
      status: 'pending',
    });
    setIsNewEventModalOpen(false);
    setNewEventTitle('');
    setNewEventCustomer('');
    toast.success('Calendar event created and synced with tasks');
  };

  const handleCompleteTask = (id: string) => {
    updateTask(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    toast.success('Task marked as completed');
    setSelectedTask(null);
  };

  return (
    <AppShell>
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Sales Schedule & Task Calendar
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Live State Linked
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synchronized with Follow-ups, Quotation deadlines, meetings, and client calls
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View switcher */}
          <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border text-xs">
            {(['month', 'agenda'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition-colors ${
                  activeView === v
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setNewEventDate(currentDate.toISOString().split('T')[0]);
              setIsNewEventModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
          >
            Today (17 Nov 2026)
          </button>
        </div>

        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          <span>{monthName}</span>
        </h2>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Calls
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Meetings
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Done
          </span>
        </div>
      </div>

      {/* MONTH VIEW */}
      {activeView === 'month' && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-[11px] font-bold text-muted-foreground py-2.5 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
            {daysArray.map((cell, idx) => {
              if (!cell.day) {
                return <div key={idx} className="min-h-[110px] bg-muted/10 p-2" />;
              }

              const isToday = cell.dateStr === '2026-11-17';
              const dayTasks = tasks.filter((t) => t.dueDate === cell.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setNewEventDate(cell.dateStr);
                    setIsNewEventModalOpen(true);
                  }}
                  className={`min-h-[110px] p-2 transition-colors hover:bg-muted/30 cursor-pointer flex flex-col justify-between ${
                    isToday ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-foreground'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[75px]">
                    {dayTasks.map((t) => {
                      const isOverdue = t.status === 'overdue';
                      const isDone = t.status === 'completed';

                      return (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(t);
                          }}
                          className={`px-1.5 py-1 rounded text-[10px] font-semibold truncate border ${
                            isOverdue
                              ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isDone
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 line-through opacity-70'
                              : t.taskType === 'meeting'
                              ? 'bg-blue-50 border-blue-200 text-blue-800'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          <span className="font-mono">{t.dueTime}</span> {t.customerName.split(' ')[0]} - {t.taskTitle}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA VIEW */}
      {activeView === 'agenda' && (
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground">Upcoming Agenda Schedule</h3>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.status !== 'completed')
              .sort((a, b) => new Date(`${a.dueDate}T${a.dueTime}`).getTime() - new Date(`${b.dueDate}T${b.dueTime}`).getTime())
              .map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-3 rounded-xl border border-border hover:bg-muted/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        task.status === 'overdue'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{task.taskTitle}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {task.customerName} ({task.companyName}) • Rep: {task.assignedEmployeeName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {formatDate(task.dueDate)} at {task.dueTime}
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        task.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* EVENT DETAIL POPUP */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-sm text-foreground">Task Details</span>
              <button onClick={() => setSelectedTask(null)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="text-base font-bold text-foreground">{selectedTask.taskTitle}</h3>
              <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                <div>
                  Client: <strong>{selectedTask.customerName}</strong> ({selectedTask.companyName})
                </div>
                <div>
                  Phone: <strong>{selectedTask.phone}</strong>
                </div>
                <div>
                  Assigned Executive: <strong>{selectedTask.assignedEmployeeName}</strong>
                </div>
                <div>
                  Scheduled: <strong>{formatDate(selectedTask.dueDate)} at {selectedTask.dueTime}</strong>
                </div>
                <div>
                  Status:{' '}
                  <span className="font-bold uppercase text-emerald-600">
                    {selectedTask.status}
                  </span>
                </div>
              </div>

              {selectedTask.description && (
                <p className="text-xs text-muted-foreground p-2 rounded bg-card border border-border">
                  {selectedTask.description}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <a
                href={`tel:${selectedTask.phone}`}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </a>

              {selectedTask.status !== 'completed' && (
                <button
                  onClick={() => handleCompleteTask(selectedTask.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Schedule Calendar Event</h3>
              <button onClick={() => setIsNewEventModalOpen(false)} className="p-1 text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Technical demo with factory manager"
                  className="w-full p-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Customer / Client Name *</label>
                <input
                  type="text"
                  required
                  value={newEventCustomer}
                  onChange={(e) => setNewEventCustomer(e.target.value)}
                  placeholder="e.g. Manoj Sharma"
                  className="w-full p-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Event Type</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as TaskType)}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  >
                    <option value="followup_call">Follow-up Call</option>
                    <option value="meeting">Physical Meeting</option>
                    <option value="whatsapp">WhatsApp Consultation</option>
                    <option value="send_quotation">Send Quotation Deadline</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Assignee</label>
                  <select
                    value={newEventRep}
                    onChange={(e) => setNewEventRep(e.target.value)}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

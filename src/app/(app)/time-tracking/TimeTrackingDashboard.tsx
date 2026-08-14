"use client";

import { useState, useEffect } from "react";
import { Play, Square, Plus, Clock, Trash2, X } from "lucide-react";
import { format, differenceInMinutes, differenceInSeconds } from "date-fns";

type TimeLog = {
  id: string;
  projectId: string | null;
  taskId: string | null;
  description: string | null;
  startTime: string | Date;
  endTime: string | Date | null;
  duration: number | null;
  project?: { id: string; name: string } | null;
  task?: { id: string; title: string } | null;
};

type Project = { id: string; name: string };
type Task = { id: string; title: string; projectId: string };

interface Props {
  initialLogs: TimeLog[];
  projects: Project[];
  tasks: Task[];
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function TimeTrackingDashboard({ initialLogs, projects, tasks }: Props) {
  const [logs, setLogs] = useState<TimeLog[]>(initialLogs);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  
  // Timer state
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Manual entry state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDesc, setManualDesc] = useState("");
  const [manualProject, setManualProject] = useState("");
  const [manualTask, setManualTask] = useState("");
  const [manualDate, setManualDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [manualDuration, setManualDuration] = useState("60"); // minutes

  // Find active log on mount
  useEffect(() => {
    const active = logs.find(l => !l.endTime);
    if (active) {
      setActiveLogId(active.id);
      setDescription(active.description || "");
      setProjectId(active.projectId || "");
      setTaskId(active.taskId || "");
      
      const start = new Date(active.startTime);
      setElapsedSeconds(differenceInSeconds(new Date(), start));
    }
  }, [logs]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeLogId) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeLogId]);

  const filteredTasks = tasks.filter(t => !projectId || t.projectId === projectId);

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  async function handleStartTimer() {
    try {
      const res = await fetch("/api/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim() || "Working",
          projectId: projectId || null,
          taskId: taskId || null,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setLogs([data, ...logs]);
        setActiveLogId(data.id);
        setElapsedSeconds(0);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStopTimer() {
    if (!activeLogId) return;
    try {
      const endTime = new Date();
      const log = logs.find(l => l.id === activeLogId);
      if (!log) return;
      
      const duration = differenceInMinutes(endTime, new Date(log.startTime));
      
      const res = await fetch(`/api/time-logs/${activeLogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endTime, duration }),
      });
      
      if (res.ok) {
        const { data } = await res.json();
        setLogs(logs.map(l => l.id === activeLogId ? data : l));
        setActiveLogId(null);
        setDescription("");
        setProjectId("");
        setTaskId("");
        setElapsedSeconds(0);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this time log?")) return;
    try {
      const res = await fetch(`/api/time-logs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLogs(logs.filter(l => l.id !== id));
        if (activeLogId === id) setActiveLogId(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const startTime = new Date(manualDate);
      const endTime = new Date(startTime.getTime() + parseInt(manualDuration) * 60000);
      
      const res = await fetch("/api/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: manualDesc.trim() || "Manual entry",
          projectId: manualProject || null,
          taskId: manualTask || null,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: parseInt(manualDuration),
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setLogs([data, ...logs].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
        setIsManualModalOpen(false);
        setManualDesc("");
        setManualProject("");
        setManualTask("");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const totalMinutesThisWeek = logs
    .filter(l => l.duration && new Date(l.startTime).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
    .reduce((acc, curr) => acc + (curr.duration || 0), 0);

  const totalMinutesToday = logs
    .filter(l => l.duration && new Date(l.startTime).toDateString() === new Date().toDateString())
    .reduce((acc, curr) => acc + (curr.duration || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Active Timer Bar */}
      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 sticky top-4 z-10">
        <input
          type="text"
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!!activeLogId}
          className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315] outline-none disabled:opacity-70 disabled:bg-[#F3F4F6]"
        />
        
        <div className="flex items-center gap-3">
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setTaskId("");
            }}
            disabled={!!activeLogId}
            className="w-32 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-xs text-[#111827] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315] outline-none disabled:opacity-70"
          >
            <option value="">Project...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            disabled={!!activeLogId || !projectId}
            className="w-32 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-xs text-[#111827] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315] outline-none disabled:opacity-70"
          >
            <option value="">Task...</option>
            {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <span className="text-2xl font-mono font-bold text-[#111827] w-28 text-right tracking-tight">
            {formatTimer(elapsedSeconds)}
          </span>
          {activeLogId ? (
            <button
              onClick={handleStopTimer}
              className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleStartTimer}
              className="flex items-center justify-center w-12 h-12 bg-[#88C315] hover:bg-[#77AB12] text-white rounded-xl shadow-md shadow-[#88C315]/20 transition-all active:scale-95"
            >
              <Play className="w-5 h-5 fill-current ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F3F9DE] flex items-center justify-center text-[#88C315]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7280]">Today</p>
            <p className="text-xl font-black text-[#111827]">{formatDuration(totalMinutesToday)}</p>
          </div>
        </div>
        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[#4B5563]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7280]">This Week</p>
            <p className="text-xl font-black text-[#111827]">{formatDuration(totalMinutesThisWeek)}</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-[#111827]">Recent Time Logs</h2>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="text-xs font-bold text-[#88C315] hover:text-[#77AB12] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Manual Entry
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10">
            <Clock className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#9CA3AF]">No time logged yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => {
              const isRunning = !log.endTime;
              return (
                <div key={log.id} className={`flex items-center justify-between p-3 rounded-xl border ${isRunning ? "border-[#88C315] bg-[#F3F9DE]/30" : "border-[#EAEDF2] hover:bg-[#F9FAFB]"}`}>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-bold text-[#111827] truncate">
                      {log.description || "Working..."}
                      {isRunning && <span className="ml-2 text-[10px] bg-[#88C315] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Running</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs font-medium text-[#6B7280]">
                      {log.project && <span className="bg-[#E5E7EB]/50 px-1.5 py-0.5 rounded">{log.project.name}</span>}
                      {log.task && <span>{log.task.title}</span>}
                      {!log.project && !log.task && <span>No project</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#111827]">
                        {isRunning ? formatTimer(elapsedSeconds) : formatDuration(log.duration || 0)}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF]">
                        {format(new Date(log.startTime), "MMM d, h:mm a")}
                      </p>
                    </div>
                    
                    {!isRunning && (
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="p-1.5 text-[#D1D5DB] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EAEDF2] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111827]">Manual Time Entry</h2>
              <button onClick={() => setIsManualModalOpen(false)} className="text-[#9CA3AF] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  value={manualDesc}
                  onChange={e => setManualDesc(e.target.value)}
                  className="w-full bg-white border border-[#D1D5DB] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315] rounded-xl px-3 py-2 text-sm text-[#111827] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full bg-white border border-[#D1D5DB] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315] rounded-xl px-3 py-2 text-sm text-[#111827] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">Duration (mins)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualDuration}
                    onChange={e => setManualDuration(e.target.value)}
                    className="w-full bg-white border border-[#D1D5DB] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315] rounded-xl px-3 py-2 text-sm text-[#111827] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">Project</label>
                <select
                  value={manualProject}
                  onChange={e => { setManualProject(e.target.value); setManualTask(""); }}
                  className="w-full bg-white border border-[#D1D5DB] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315] rounded-xl px-3 py-2 text-sm text-[#111827] outline-none"
                >
                  <option value="">None</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">Task</label>
                <select
                  value={manualTask}
                  onChange={e => setManualTask(e.target.value)}
                  disabled={!manualProject}
                  className="w-full bg-white border border-[#D1D5DB] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315] rounded-xl px-3 py-2 text-sm text-[#111827] outline-none disabled:bg-[#F9FAFB] disabled:opacity-50"
                >
                  <option value="">None</option>
                  {tasks.filter(t => t.projectId === manualProject).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsManualModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#4B5563] hover:bg-[#F3F4F6]">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-bold bg-[#88C315] hover:bg-[#77AB12] text-white shadow-sm">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

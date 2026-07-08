"use client";

import { X, Plus, CheckSquare, Trash2, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  deadline?: string;
  progress: number;
}

interface TasksModalProps {
  onClose: () => void;
}

export default function TasksModal({ onClose }: TasksModalProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newDeadline, setNewDeadline] = useState("");

  function loadTasks() {
    setLoading(true);
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        deadline: newDeadline || undefined,
        status: "todo",
      }),
    });

    if (res.ok) {
      setNewTitle("");
      setNewDesc("");
      setNewDeadline("");
      loadTasks();
    }
  }

  async function toggleTaskStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "done" ? "todo" : "done";
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: nextStatus,
        progress: nextStatus === "done" ? 100 : 0,
      }),
    });

    if (res.ok) {
      loadTasks();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bb-glass w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="bb-display text-base font-semibold text-white flex items-center gap-2">
            <CheckSquare size={18} className="text-purple-400" />
            Task Management System
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* New Task Form */}
          <form onSubmit={handleAddTask} className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-purple-300 uppercase">Create Workspace Task</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="bb-input w-full rounded-xl px-3.5 py-2 text-xs"
                placeholder="Task Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <input
                className="bb-input w-full rounded-xl px-3.5 py-2 text-xs"
                placeholder="Due Date"
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>
            <textarea
              className="bb-input w-full rounded-xl px-3.5 py-2 text-xs"
              placeholder="Task Description"
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50">Priority:</span>
                {["low", "medium", "high"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPriority(p as any)}
                    className={`rounded px-2.5 py-1 text-[10px] font-semibold capitalize transition ${
                      newPriority === p
                        ? "bg-purple-500/20 text-purple-200 border border-purple-500/20"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="bb-btn-primary flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                <Plus size={12} /> Add Task
              </button>
            </div>
          </form>

          {/* Tasks List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-purple-300 uppercase">Active Checklist</h4>
            {loading ? (
              <p className="text-xs text-white/45">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-xs text-white/45">No tasks defined yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`flex items-start justify-between rounded-xl bg-white/3 p-3.5 border transition ${
                      task.status === "done" ? "border-green-500/25 bg-green-500/5" : "border-white/5"
                    }`}
                  >
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleTaskStatus(task._id, task.status)}
                        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border transition cursor-pointer ${
                          task.status === "done"
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-white/30 hover:border-purple-400"
                        }`}
                      >
                        {task.status === "done" && <span className="text-[10px] font-bold">✓</span>}
                      </button>
                      <div>
                        <h5
                          className={`text-sm font-medium ${
                            task.status === "done" ? "text-white/40 line-through" : "text-white/90"
                          }`}
                        >
                          {task.title}
                        </h5>
                        {task.description && (
                          <p className="mt-1 text-xs text-white/45">{task.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                              task.priority === "high"
                                ? "bg-red-500/10 text-red-300"
                                : task.priority === "medium"
                                  ? "bg-amber-500/10 text-amber-300"
                                  : "bg-blue-500/10 text-blue-300"
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.deadline && (
                            <span className="flex items-center gap-1 text-[9px] text-white/40">
                              <Clock size={10} />
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  completed: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("tasks");

    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  function saveTasks(updatedTasks: Task[]) {
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  }

  function resetForm() {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
  }

  function addOrUpdateTask() {
    if (!title.trim()) return;

    if (editingTaskId) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              title: title.trim(),
              description,
              priority,
              dueDate,
            }
          : task
      );

      saveTasks(updatedTasks);
      resetForm();
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: title.trim(),
      description,
      priority,
      dueDate,
      completed: false,
    };

    saveTasks([newTask, ...tasks]);
    resetForm();
  }

  function startEditing(task: Task) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDueDate(task.dueDate);
  }

  function toggleTask(id: number) {
    saveTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  }

  function deleteTask(id: number) {
    saveTasks(tasks.filter((task) => task.id !== id));

    if (editingTaskId === id) {
      resetForm();
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">Life System</p>

        <h1 className="mt-2 text-5xl font-black">✅ Aufgaben</h1>

        <p className="mt-3 text-neutral-300">
          Plane deine nächsten Schritte.
        </p>
      </div>

      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">
          {editingTaskId ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
        </h2>

        <div className="mt-4 grid gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel"
            className="rounded-2xl border p-3"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung (optional)"
            className="rounded-2xl border p-3"
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as Task["priority"])
            }
            className="rounded-2xl border p-3"
          >
            <option value="high">🔴 Hoch</option>
            <option value="medium">🟡 Mittel</option>
            <option value="low">🟢 Niedrig</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-2xl border p-3"
          />

          <div className="flex gap-3">
            <button
              onClick={addOrUpdateTask}
              className="flex-1 rounded-2xl bg-black p-3 font-semibold text-white"
            >
              {editingTaskId ? "Änderungen speichern" : "Aufgabe hinzufügen"}
            </button>

            {editingTaskId && (
              <button
                onClick={resetForm}
                className="rounded-2xl bg-neutral-100 px-5 font-semibold"
              >
                Abbrechen
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {tasks.length === 0 && (
          <div className="rounded-[2rem] bg-white p-6 shadow">
            Noch keine Aufgaben vorhanden.
          </div>
        )}

        {tasks.map((task) => (
          <div key={task.id} className="rounded-[2rem] bg-white p-6 shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className={`text-xl font-black ${
                    task.completed ? "line-through text-neutral-400" : ""
                  }`}
                >
                  {task.title}
                </h2>

                {task.description && (
                  <p className="mt-2 text-neutral-500">{task.description}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-400">
                  <span>
                    {task.priority === "high" && "🔴 Hoch"}
                    {task.priority === "medium" && "🟡 Mittel"}
                    {task.priority === "low" && "🟢 Niedrig"}
                  </span>

                  {task.dueDate && <span>📅 {task.dueDate}</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="rounded-xl bg-neutral-100 px-3 py-2"
                >
                  {task.completed ? "↩️" : "✅"}
                </button>

                <button
                  onClick={() => startEditing(task)}
                  className="rounded-xl bg-neutral-100 px-3 py-2"
                >
                  ✏️
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="rounded-xl bg-neutral-100 px-3 py-2"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
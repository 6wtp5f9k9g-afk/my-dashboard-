"use client";

import { use, useEffect, useState } from "react";

type TodayTask = {
  id: number;
  title: string;
  done: boolean;
};

export default function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);

  const [allTasks, setAllTasks] = useState<Record<string, TodayTask[]>>({});
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasksByDate");

    if (savedTasks) {
      setAllTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(allTasks).length > 0) {
      localStorage.setItem("tasksByDate", JSON.stringify(allTasks));
    }
  }, [allTasks]);

  const tasks = allTasks[date] || [];

  function toggleTask(id: number) {
    setAllTasks((prev) => ({
      ...prev,
      [date]: (prev[date] || []).map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      ),
    }));
  }

  function deleteTask(id: number) {
    setAllTasks((prev) => ({
      ...prev,
      [date]: (prev[date] || []).filter((task) => task.id !== id),
    }));
  }

  function addTask() {
    const trimmed = newTask.trim();
    if (!trimmed) return;

    const newTaskItem: TodayTask = {
      id: Date.now(),
      title: trimmed,
      done: false,
    };

    setAllTasks((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), newTaskItem],
    }));

    setNewTask("");
  }

  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-500">{date}</p>
        <h1 className="mt-2 text-3xl font-bold">Tag</h1>
        <p className="mt-2 text-neutral-600">
          {done}/{tasks.length} Aufgaben erledigt
        </p>
      </div>

      <div className="flex gap-3">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Neue Aufgabe"
          className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3"
        />
        <button
          onClick={addTask}
          className="rounded-2xl bg-neutral-900 px-5 py-3 text-white"
        >
          Hinzufügen
        </button>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
            Keine Aufgaben für diesen Tag.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                task.done ? "bg-neutral-100" : "bg-white"
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="flex-1 text-left"
              >
                <span
                  className={
                    task.done
                      ? "line-through text-neutral-400"
                      : "text-neutral-900"
                  }
                >
                  {task.title}
                </span>
              </button>

              <button
                onClick={() => deleteTask(task.id)}
                className="ml-4 text-sm text-neutral-500 hover:text-neutral-900"
              >
                Löschen
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
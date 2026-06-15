"use client";

import { useEffect, useState } from "react";

type Routine = {
  id: number;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "weekdays" | "timesPerWeek";
  daysPerWeek: number;
  showOnDashboard: boolean;
  completedToday: boolean;
};

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Routine["frequency"]>("daily");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [showOnDashboard, setShowOnDashboard] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("routines");

    if (saved) {
      setRoutines(JSON.parse(saved));
    }
  }, []);

  function saveRoutines(updated: Routine[]) {
    setRoutines(updated);
    localStorage.setItem("routines", JSON.stringify(updated));
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFrequency("daily");
    setDaysPerWeek(3);
    setShowOnDashboard(true);
  }

  function saveRoutine() {
    if (!title.trim()) return;

    if (editingId) {
      const updated = routines.map((routine) =>
        routine.id === editingId
          ? {
              ...routine,
              title: title.trim(),
              description,
              frequency,
              daysPerWeek,
              showOnDashboard,
            }
          : routine
      );

      saveRoutines(updated);
      resetForm();
      return;
    }

    const newRoutine: Routine = {
      id: Date.now(),
      title: title.trim(),
      description,
      frequency,
      daysPerWeek,
      showOnDashboard,
      completedToday: false,
    };

    saveRoutines([newRoutine, ...routines]);
    resetForm();
  }

  function editRoutine(routine: Routine) {
    setEditingId(routine.id);
    setTitle(routine.title);
    setDescription(routine.description);
    setFrequency(routine.frequency);
    setDaysPerWeek(routine.daysPerWeek);
    setShowOnDashboard(routine.showOnDashboard);
  }

  function deleteRoutine(id: number) {
    saveRoutines(routines.filter((routine) => routine.id !== id));

    if (editingId === id) {
      resetForm();
    }
  }

  function toggleCompleted(id: number) {
    saveRoutines(
      routines.map((routine) =>
        routine.id === id
          ? {
              ...routine,
              completedToday: !routine.completedToday,
            }
          : routine
      )
    );
  }

  function getFrequencyLabel(routine: Routine) {
    if (routine.frequency === "daily") return "📅 Täglich";
    if (routine.frequency === "weekly") return "📅 Wöchentlich";
    if (routine.frequency === "monthly") return "📅 Monatlich";
    if (routine.frequency === "weekdays") return "📅 Bestimmte Wochentage";
    return `📅 ${routine.daysPerWeek}x pro Woche`;
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">Life System</p>

        <h1 className="mt-2 text-5xl font-black">🔄 Routinen</h1>

        <p className="mt-3 text-neutral-300">
          Baue langfristige Gewohnheiten auf.
        </p>
      </div>

      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow">
        <h2 className="text-2xl font-black">
          {editingId ? "Routine bearbeiten" : "Neue Routine"}
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
            value={frequency}
            onChange={(e) =>
              setFrequency(e.target.value as Routine["frequency"])
            }
            className="rounded-2xl border p-3"
          >
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
            <option value="monthly">Monatlich</option>
            <option value="weekdays">Bestimmte Wochentage</option>
            <option value="timesPerWeek">X-mal pro Woche</option>
          </select>

          {frequency === "timesPerWeek" && (
            <input
              type="number"
              min={1}
              max={7}
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              className="rounded-2xl border p-3"
            />
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnDashboard}
              onChange={(e) => setShowOnDashboard(e.target.checked)}
            />

            Auf Dashboard anzeigen
          </label>

          <div className="flex gap-3">
            <button
              onClick={saveRoutine}
              className="flex-1 rounded-2xl bg-black p-3 font-semibold text-white"
            >
              {editingId ? "Änderungen speichern" : "Routine hinzufügen"}
            </button>

            {editingId && (
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
        {routines.length === 0 && (
          <div className="rounded-[2rem] bg-white p-6 shadow">
            Noch keine Routinen vorhanden.
          </div>
        )}

        {routines.map((routine) => (
          <div key={routine.id} className="rounded-[2rem] bg-white p-6 shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className={`text-xl font-black ${
                    routine.completedToday
                      ? "line-through text-neutral-400"
                      : ""
                  }`}
                >
                  {routine.title}
                </h2>

                {routine.description && (
                  <p className="mt-2 text-neutral-500">{routine.description}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-400">
                  <span>{getFrequencyLabel(routine)}</span>

                  {routine.showOnDashboard && <span>🏠 Dashboard</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleCompleted(routine.id)}
                  className="rounded-xl bg-neutral-100 px-3 py-2"
                >
                  {routine.completedToday ? "↩️" : "✅"}
                </button>

                <button
                  onClick={() => editRoutine(routine)}
                  className="rounded-xl bg-neutral-100 px-3 py-2"
                >
                  ✏️
                </button>

                <button
                  onClick={() => deleteRoutine(routine.id)}
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
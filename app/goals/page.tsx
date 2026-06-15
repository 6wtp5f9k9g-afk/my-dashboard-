"use client";

import { useEffect, useState } from "react";

type Goal = {
  id: number;
  title: string;
  description: string;
  goalType: "free" | "measurable";
  progress: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
};

const units = ["€", "kg", "km", "Stunden", "Minuten", "Bücher", "Lektionen", "Tage", "Sonstiges"];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<Goal["goalType"]>("free");
  const [progress, setProgress] = useState(0);
  const [currentValue, setCurrentValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("€");
  const [customUnit, setCustomUnit] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    const savedGoals = localStorage.getItem("goals");
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  function saveGoals(updatedGoals: Goal[]) {
    setGoals(updatedGoals);
    localStorage.setItem("goals", JSON.stringify(updatedGoals));
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setGoalType("free");
    setProgress(0);
    setCurrentValue("");
    setTargetValue("");
    setUnit("€");
    setCustomUnit("");
    setDeadline("");
  }

  function calculateProgress(goal: Goal) {
    if (goal.goalType === "free") return goal.progress;
    if (goal.targetValue <= 0) return 0;

    return Math.min(
      100,
      Math.round((goal.currentValue / goal.targetValue) * 100)
    );
  }

  function saveGoal() {
    if (!title.trim()) return;

    const finalUnit = unit === "Sonstiges" ? customUnit : unit;

    const goalData: Goal = {
      id: editingId ?? Date.now(),
      title: title.trim(),
      description,
      goalType,
      progress,
      currentValue: Number(currentValue) || 0,
      targetValue: Number(targetValue) || 0,
      unit: finalUnit,
      deadline,
    };

    if (editingId) {
      saveGoals(
        goals.map((goal) =>
          goal.id === editingId ? goalData : goal
        )
      );
    } else {
      saveGoals([goalData, ...goals]);
    }

    resetForm();
  }

  function editGoal(goal: Goal) {
    setEditingId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description);
    setGoalType(goal.goalType);
    setProgress(goal.progress);
    setCurrentValue(goal.currentValue.toString());
    setTargetValue(goal.targetValue.toString());
    setUnit(units.includes(goal.unit) ? goal.unit : "Sonstiges");
    setCustomUnit(units.includes(goal.unit) ? "" : goal.unit);
    setDeadline(goal.deadline);
  }

  function deleteGoal(id: number) {
    saveGoals(goals.filter((goal) => goal.id !== id));
    if (editingId === id) resetForm();
  }

  function updateFreeProgress(id: number, newProgress: number) {
    saveGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, progress: newProgress } : goal
      )
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">Life System</p>

        <h1 className="mt-2 text-5xl font-black">🎯 Ziele</h1>

        <p className="mt-3 text-neutral-300">
          Erstelle freie oder messbare Ziele.
        </p>
      </div>

      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow">
        <h2 className="text-2xl font-black">
          {editingId ? "Ziel bearbeiten" : "Neues Ziel"}
        </h2>

        <div className="mt-5 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => setGoalType("free")}
              className={`rounded-2xl border p-5 text-left ${
                goalType === "free"
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <p className="text-3xl">🎯</p>
              <h3 className="mt-3 font-black">Freies Ziel</h3>
              <p className="mt-1 text-sm opacity-70">
                Fortschritt manuell von 0–100 %.
              </p>
            </button>

            <button
              onClick={() => setGoalType("measurable")}
              className={`rounded-2xl border p-5 text-left ${
                goalType === "measurable"
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <p className="text-3xl">📊</p>
              <h3 className="mt-3 font-black">Messbares Ziel</h3>
              <p className="mt-1 text-sm opacity-70">
                Aktueller Wert, Zielwert und Einheit.
              </p>
            </button>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Zielname"
            className="rounded-2xl border p-3"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung (optional)"
            className="rounded-2xl border p-3"
          />

          {goalType === "free" && (
            <div className="rounded-2xl border p-4">
              <div className="mb-2 flex justify-between">
                <span>Start-Fortschritt</span>
                <span>{progress}%</span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {goalType === "measurable" && (
            <div className="grid gap-3 md:grid-cols-3">
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Aktueller Stand"
                className="rounded-2xl border p-3"
              />

              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Zielwert"
                className="rounded-2xl border p-3"
              />

              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="rounded-2xl border p-3"
              >
                {units.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {unit === "Sonstiges" && (
                <input
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="Eigene Einheit"
                  className="rounded-2xl border p-3 md:col-span-3"
                />
              )}
            </div>
          )}

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="rounded-2xl border p-3"
          />

          <div className="flex gap-3">
            <button
              onClick={saveGoal}
              className="flex-1 rounded-2xl bg-black p-3 font-semibold text-white"
            >
              {editingId ? "Änderungen speichern" : "Ziel hinzufügen"}
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
        {goals.length === 0 && (
          <div className="rounded-[2rem] bg-white p-6 shadow">
            Noch keine Ziele vorhanden.
          </div>
        )}

        {goals.map((goal) => {
          const displayProgress = calculateProgress(goal);

          return (
            <div key={goal.id} className="rounded-[2rem] bg-white p-6 shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-400">
                    {goal.goalType === "free" ? "Freies Ziel" : "Messbares Ziel"}
                  </p>

                  <h2 className="text-2xl font-black">{goal.title}</h2>

                  {goal.description && (
                    <p className="mt-2 text-neutral-600">{goal.description}</p>
                  )}

                  {goal.goalType === "measurable" && (
                    <p className="mt-2 text-sm text-neutral-400">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </p>
                  )}

                  {goal.deadline && (
                    <p className="mt-2 text-sm text-neutral-400">
                      Deadline: {goal.deadline}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => editGoal(goal)}
                    className="rounded-xl bg-neutral-100 px-3 py-2"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="rounded-xl bg-neutral-100 px-3 py-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between">
                  <span>Fortschritt</span>
                  <span>{displayProgress}%</span>
                </div>

                <div className="h-3 rounded-full bg-neutral-200">
                  <div
                    className="h-3 rounded-full bg-black"
                    style={{ width: `${displayProgress}%` }}
                  />
                </div>

                {goal.goalType === "free" && (
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={goal.progress}
                    onChange={(e) =>
                      updateFreeProgress(goal.id, Number(e.target.value))
                    }
                    className="mt-4 w-full"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
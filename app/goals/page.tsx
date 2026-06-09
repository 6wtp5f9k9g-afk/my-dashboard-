"use client";

import { useEffect, useMemo, useState } from "react";

type GoalCategory =
  | "Fitness"
  | "Business"
  | "Finanzen"
  | "Ernährung";

type Goal = {
  id: number;
  title: string;
  progress: number;
  category: GoalCategory;
  auto: boolean;
};

type LifeArea = {
  id: number;
  title: string;
  value: number;
  description: string;
};

const categories: GoalCategory[] = [
  "Fitness",
  "Business",
  "Finanzen",
  "Ernährung",
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [newCategory, setNewCategory] = useState<GoalCategory>("Business");
  const [newAuto, setNewAuto] = useState(false);

  useEffect(() => {
    const savedGoals = localStorage.getItem("goals");
    const savedLifeAreas = localStorage.getItem("lifeAreas");

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    if (savedLifeAreas) {
      setLifeAreas(JSON.parse(savedLifeAreas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  const smartGoals = useMemo(() => {
    return goals.map((goal) => {
      if (!goal.auto) return goal;

      const matchingArea = lifeAreas.find(
        (area) => area.title === goal.category
      );

      if (!matchingArea) return goal;

      return {
        ...goal,
        progress: matchingArea.value,
      };
    });
  }, [goals, lifeAreas]);

  function addGoal() {
    const trimmed = newGoal.trim();
    if (!trimmed) return;

    const newGoalItem: Goal = {
      id: Date.now(),
      title: trimmed,
      progress: 0,
      category: newCategory,
      auto: newAuto,
    };

    setGoals((prev) => [...prev, newGoalItem]);
    setNewGoal("");
    setNewCategory("Business");
    setNewAuto(false);
  }

  function deleteGoal(id: number) {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }

  function updateProgress(id: number, value: number) {
    const clamped = Math.max(0, Math.min(100, value));

    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id && !goal.auto
          ? { ...goal, progress: clamped }
          : goal
      )
    );
  }

  function toggleAuto(id: number) {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, auto: !goal.auto } : goal
      )
    );
  }

  const groupedGoals = categories.map((category) => ({
    category,
    items: smartGoals.filter((goal) => goal.category === category),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-500">Ziele</p>
        <h1 className="mt-2 text-3xl font-bold">Meine Ziele</h1>
        <p className="mt-2 text-neutral-600">
          Setze klare Ziele, ordne sie Bereichen zu und lasse Fortschritt
          automatisch aus deinen Lebensbereichen übernehmen.
        </p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Neues Ziel hinzufügen"
            className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3"
          />

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as GoalCategory)}
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={newAuto}
              onChange={(e) => setNewAuto(e.target.checked)}
            />
            Smart Goal
          </label>

          <button
            onClick={addGoal}
            className="rounded-2xl bg-neutral-900 px-5 py-3 text-white"
          >
            Hinzufügen
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {groupedGoals.map((group) => (
          <div key={group.category}>
            <h2 className="mb-3 text-xl font-semibold">{group.category}</h2>

            {group.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
                Keine Ziele in diesem Bereich.
              </div>
            ) : (
              <div className="space-y-4">
                {group.items.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{goal.title}</p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {goal.auto ? "Smart Goal aktiv" : "Manuelles Ziel"}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-sm text-neutral-500 hover:text-neutral-900"
                      >
                        Löschen
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <input
                        type="number"
                        value={goal.progress}
                        disabled={goal.auto}
                        onChange={(e) =>
                          updateProgress(goal.id, Number(e.target.value))
                        }
                        className={`w-20 rounded-xl border px-3 py-2 text-center ${
                          goal.auto
                            ? "border-neutral-200 bg-neutral-100 text-neutral-400"
                            : "border-neutral-200 bg-white"
                        }`}
                      />
                      <span className="text-sm text-neutral-500">%</span>

                      <button
                        onClick={() => toggleAuto(goal.id)}
                        className="rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        {goal.auto ? "Smart aus" : "Smart an"}
                      </button>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-neutral-200">
                      <div
                        className="h-2 rounded-full bg-neutral-900"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
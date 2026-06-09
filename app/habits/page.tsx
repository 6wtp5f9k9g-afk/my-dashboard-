"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Flame, Plus, Trash2 } from "lucide-react";

type Habit = {
  id: number;
  title: string;
  completedDates: string[];
};

function getDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function getToday() {
  return getDateKey(new Date());
}

function getLast7Days() {
  const days: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(getDateKey(date));
  }

  return days;
}

function formatDay(dateString: string) {
  return new Date(dateString).toLocaleDateString("de-DE", {
    weekday: "short",
  });
}

function calculateStreak(dates: string[]) {
  if (!dates.length) return 0;

  const completed = new Set(dates);
  let streak = 0;
  const current = new Date();

  while (completed.has(getDateKey(current))) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export default function HabitsPage() {
  const today = getToday();
  const weekDays = getLast7Days();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");

    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  function saveHabits(updatedHabits: Habit[]) {
    setHabits(updatedHabits);
    localStorage.setItem("habits", JSON.stringify(updatedHabits));
  }

  function addHabit() {
    const trimmed = newHabit.trim();
    if (!trimmed) return;

    const updatedHabits: Habit[] = [
      ...habits,
      {
        id: Date.now(),
        title: trimmed,
        completedDates: [],
      },
    ];

    saveHabits(updatedHabits);
    setNewHabit("");
  }

  function toggleHabit(id: number, date = today) {
    const updatedHabits = habits.map((habit) => {
      if (habit.id !== id) return habit;

      const done = habit.completedDates.includes(date);

      return {
        ...habit,
        completedDates: done
          ? habit.completedDates.filter((completedDate) => completedDate !== date)
          : [...habit.completedDates, date],
      };
    });

    saveHabits(updatedHabits);
  }

  function deleteHabit(id: number) {
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    saveHabits(updatedHabits);
  }

  const completedToday = habits.filter((habit) =>
    habit.completedDates.includes(today)
  ).length;

  const todayPercent =
    habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const bestStreak = useMemo(() => {
    if (habits.length === 0) return 0;

    return Math.max(
      ...habits.map((habit) => calculateStreak(habit.completedDates))
    );
  }, [habits]);

  const totalChecks = habits.reduce(
    (sum, habit) => sum + habit.completedDates.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">{today}</p>
        <h1 className="mt-2 text-5xl font-black">Habit Tracker</h1>
        <p className="mt-2 text-neutral-300">
          Baue Disziplin durch tägliche Wiederholung.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] bg-white p-5 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase text-neutral-400">Heute</p>
            <CheckCircle size={18} className="text-neutral-400" />
          </div>
          <h2 className="mt-3 text-4xl font-black">
            {completedToday}/{habits.length}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">heute erledigt</p>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase text-neutral-400">Beste Streak</p>
            <Flame size={18} className="text-neutral-400" />
          </div>
          <h2 className="mt-3 text-4xl font-black">{bestStreak}</h2>
          <p className="mt-2 text-sm text-neutral-500">Tage am Stück</p>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 shadow-md">
          <p className="text-xs uppercase text-neutral-400">Gesamt</p>
          <h2 className="mt-3 text-4xl font-black">{totalChecks}</h2>
          <p className="mt-2 text-sm text-neutral-500">Habit-Checks</p>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Tagesfortschritt</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {todayPercent}% deiner Habits sind heute erledigt.
            </p>
          </div>

          <p className="text-3xl font-black">{todayPercent}%</p>
        </div>

        <div className="mt-5 h-3 rounded-full bg-neutral-200">
          <div
            className="h-3 rounded-full bg-black"
            style={{ width: `${todayPercent}%` }}
          />
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">Neue Gewohnheit</h2>

        <div className="mt-5 flex gap-3">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="z. B. Gym, Lesen, 10k Schritte"
            className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500"
          />

          <button
            onClick={addHabit}
            className="flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white transition hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">Habit Kalender</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Deine letzten 7 Tage pro Gewohnheit.
        </p>

        <div className="mt-5 space-y-4">
          {habits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
              Noch keine Gewohnheiten.
            </div>
          ) : (
            habits.map((habit) => {
              const streak = calculateStreak(habit.completedDates);

              return (
                <div key={habit.id} className="rounded-2xl bg-neutral-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{habit.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                        <Flame size={13} />
                        {streak} Tage Streak
                      </p>
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-200 hover:text-black"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((date) => {
                      const done = habit.completedDates.includes(date);
                      const isToday = date === today;

                      return (
                        <button
                          key={date}
                          onClick={() => toggleHabit(habit.id, date)}
                          className={`rounded-2xl p-3 text-center transition ${
                            done
                              ? "bg-black text-white"
                              : "bg-white text-neutral-400"
                          } ${isToday ? "ring-2 ring-black" : ""}`}
                        >
                          <p className="text-xs font-semibold">
                            {formatDay(date)}
                          </p>
                          <p className="mt-1 text-xs">{date.slice(8)}</p>
                          <p className="mt-2 text-sm">{done ? "✓" : "—"}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import SectionCard from "@/components/SectionCard";
import LifeAreaCard from "@/components/LifeAreaCard";
import GoalCard from "@/components/GoalCard";
import {
  BookOpen,
  CalendarDays,
  Flame,
  Repeat,
  Wallet,
} from "lucide-react";

type TodayTask = {
  id: number;
  title: string;
  done: boolean;
};

type LifeArea = {
  id: number;
  title: string;
  value: number;
  description: string;
};

type Goal = {
  id: number;
  title: string;
  progress: number;
};

type BudgetEntry = {
  id: number;
  amount: number;
  type: "income" | "expense";
};

type Habit = {
  id: number;
  title: string;
  completedDates: string[];
};

type JournalEntry = {
  date: string;
  fitness: number;
  business: number;
  finanzen: number;
  note: string;
};

type PlannerEvent = {
  id: number;
  title: string;
  date: string;
  start: string;
  end: string;
};

const defaultLifeAreas: LifeArea[] = [
  { id: 1, title: "Business", value: 50, description: "Karriere & Einkommen" },
  { id: 2, title: "Finanzen", value: 50, description: "Geld & Vermögen" },
  { id: 3, title: "Fitness", value: 50, description: "Körper & Gesundheit" },
  { id: 4, title: "Ernährung", value: 50, description: "Essen & Energie" },
];

function getDateKey(date: Date) {
  return date.toISOString().split("T")[0];
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

export default function Home() {
  const todayKey = getDateKey(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [userName, setUserName] = useState("");
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budget, setBudget] = useState<BudgetEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [journeyStartDate, setJourneyStartDate] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    const savedUserName = localStorage.getItem("userName");
    const savedAreas = localStorage.getItem("lifeAreas");
    const savedGoals = localStorage.getItem("goals");
    const savedBudget = localStorage.getItem("budgetEntries");
    const savedHabits = localStorage.getItem("habits");
    const savedJournal = localStorage.getItem("journal");
    const savedEvents = localStorage.getItem("events");
    const savedJourneyStart = localStorage.getItem("journeyStartDate");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedBudget) setBudget(JSON.parse(savedBudget));
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedJournal) setJournal(JSON.parse(savedJournal));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedUserName && userName === "") {
  setUserName(savedUserName);
}

    if (savedAreas) {
      const cleanedAreas = JSON.parse(savedAreas);

      const finalAreas =
        cleanedAreas.length > 0 ? cleanedAreas : defaultLifeAreas;

      setLifeAreas(finalAreas);
      localStorage.setItem("lifeAreas", JSON.stringify(finalAreas));
    } else {
      setLifeAreas(defaultLifeAreas);
      localStorage.setItem("lifeAreas", JSON.stringify(defaultLifeAreas));
    }

    if (savedJourneyStart) {
      setJourneyStartDate(savedJourneyStart);
    } else {
      localStorage.setItem("journeyStartDate", todayKey);
      setJourneyStartDate(todayKey);
    }
  }, [todayKey]);

  const totalIncome = useMemo(
    () =>
      budget
        .filter((entry) => entry.type === "income")
        .reduce((sum, entry) => sum + entry.amount, 0),
    [budget]
  );

  const totalExpenses = useMemo(
    () =>
      budget
        .filter((entry) => entry.type === "expense")
        .reduce((sum, entry) => sum + entry.amount, 0),
    [budget]
  );

  const remaining = totalIncome - totalExpenses;

  const completedTasks = tasks.filter((task) => task.done).length;
  const openTasks = tasks.length - completedTasks;

  const completedHabits = habits.filter((habit) =>
    habit.completedDates.includes(todayKey)
  ).length;

  const habitsPercent =
    habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;

  const bestStreak =
    habits.length > 0
      ? Math.max(...habits.map((habit) => calculateStreak(habit.completedDates)))
      : 0;

  const todayJournal = journal.find((entry) => entry.date === todayKey);
  const journalDone = Boolean(todayJournal);

  const todayEvents = events
    .filter((event) => event.date === todayKey)
    .sort((a, b) => a.start.localeCompare(b.start));

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

  const dayOfYear =
    Math.floor(
      (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  const totalDays = Math.floor(
    (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );

  const yearProgress = Math.round((dayOfYear / totalDays) * 100);

  const journeyDay = journeyStartDate
    ? Math.floor(
        (new Date(todayKey).getTime() -
          new Date(journeyStartDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 1;
const currentHour = new Date().getHours();

const greeting =
  currentHour < 12
    ? "Guten Morgen"
    : currentHour < 18
    ? "Hallo"
    : "Guten Abend";

  const lastJournalDate = journal.length
  ? journal
      .map((entry) => entry.date)
      .sort()
      .reverse()[0]
  : null;

const daysSinceJournal = lastJournalDate
  ? Math.floor(
      (new Date(todayKey).getTime() - new Date(lastJournalDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  : null;

const smartInsights = [
  todayEvents.length > 0
    ? `Du hast heute ${todayEvents.length} Termin(e). Plane deine Tasks um diese Zeiten herum.`
    : "Heute sind noch keine Termine geplant. Guter Tag für Fokusarbeit.",

  habits.length === 0
    ? "Du hast noch keine Habits angelegt. Starte mit 1–3 einfachen Gewohnheiten."
    : completedHabits === habits.length
    ? "Stark: Alle Habits für heute sind erledigt."
    : `Du hast noch ${habits.length - completedHabits} Habit(s) offen. Deine Streaks sind heute noch nicht safe.`,

  journalDone
    ? "Journal ist erledigt. Du hast deinen Tag bewusst reflektiert."
    : daysSinceJournal === null
    ? "Du hast noch keinen Journal-Eintrag. Starte heute mit einer kurzen Reflexion."
    : daysSinceJournal >= 3
    ? `Du hast seit ${daysSinceJournal} Tagen kein Journal geschrieben. Zeit für einen kurzen Check-in.`
    : "Dein Journal ist heute noch offen. Schreib später kurz rein, wie der Tag lief.",

  openTasks > 0
    ? `Du hast noch ${openTasks} offene Task(s). Wähle jetzt die wichtigste aus.`
    : tasks.length > 0
    ? "Alle Tasks sind erledigt. Sehr sauber."
    : "Du hast heute noch keine Tasks geplant.",

  bestStreak >= 7
    ? `Starke Konstanz: Deine beste Streak liegt bei ${bestStreak} Tagen.`
    : bestStreak > 0
    ? `Deine beste Streak liegt bei ${bestStreak} Tagen. Heute weiter sichern.`
    : "Noch keine Streak aufgebaut. Der erste erledigte Habit startet sie.",

  remaining < 0
    ? "Achtung: Dein Budget ist aktuell negativ. Prüfe deine Ausgaben."
    : remaining > 0
    ? `Du hast aktuell ${remaining.toFixed(2)} € verfügbar.`
    : "Dein Budget ist ausgeglichen.",
];
const dashboardPriorities = [
  {
    title: "Tasks",
    value: openTasks > 0 ? `${openTasks} offen` : "Alles erledigt",
    status: openTasks > 0 ? "warning" : "good",
  },
  {
    title: "Habits",
    value:
      habits.length > 0
        ? `${completedHabits}/${habits.length} erledigt`
        : "Keine Habits",
    status:
      habits.length === 0
        ? "neutral"
        : completedHabits === habits.length
        ? "good"
        : "warning",
  },
  {
    title: "Journal",
    value: journalDone ? "Erledigt" : "Offen",
    status: journalDone ? "good" : "warning",
  },
  {
    title: "Budget",
    value: `${remaining.toFixed(2)} €`,
    status: remaining < 0 ? "danger" : "good",
  },
];
  function saveTasks(updatedTasks: TodayTask[]) {
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  }

  function addTask() {
    const trimmed = newTask.trim();
    if (!trimmed) return;

    const updatedTasks: TodayTask[] = [
      ...tasks,
      { id: Date.now(), title: trimmed, done: false },
    ];

    saveTasks(updatedTasks);
    setNewTask("");
    inputRef.current?.focus();
  }

  function toggleTask(id: number) {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );

    saveTasks(updatedTasks);
  }

  function deleteTask(id: number) {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    saveTasks(updatedTasks);
  }

  function updateLifeArea(id: number, value: number) {
    const updated = lifeAreas.map((area) =>
      area.id === id ? { ...area, value } : area
    );

    setLifeAreas(updated);
    localStorage.setItem("lifeAreas", JSON.stringify(updated));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
  <p className="text-sm text-neutral-400">
    Startpunkt: {journeyStartDate || todayKey}
  </p>

  <h1 className="mt-2 text-5xl font-black">
    {greeting}
    {userName ? `, ${userName}` : ""}
  </h1>

  <p className="mt-2 text-neutral-300">
    Tag {journeyDay} deiner Reise. Dein heutiger Überblick wartet auf dich.
  </p>

  {!userName && (
    <div className="mt-5 flex gap-3">
      <input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Dein Name"
        className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-neutral-400 outline-none"
      />

      <button
        onClick={() => {
  if (userName.trim()) {
    localStorage.setItem("userName", userName);
  }
}}
        className="rounded-2xl bg-white px-5 py-3 font-semibold text-black"
      >
        Speichern
      </button>
    </div>
  )}
</section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Insights
        </p>
        <h2 className="mt-2 text-2xl font-black">Dein heutiger Stand</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {smartInsights.map((insight) => (
            <div key={insight} className="rounded-2xl bg-neutral-50 p-4">
              <p className="text-sm text-neutral-700">{insight}</p>
            </div>
          ))}
        </div>
      </section>

<section className="rounded-[2rem] bg-white p-6 shadow-md">
  <p className="text-xs uppercase tracking-wide text-neutral-400">
    Dashboard Cockpit
  </p>

  <h2 className="mt-2 text-2xl font-black">
    Dein heutiger Überblick
  </h2>

  <div className="mt-5 grid gap-3 md:grid-cols-4">
    {dashboardPriorities.map((item) => (
      <div
        key={item.title}
        className={`rounded-2xl p-4 ${
          item.status === "danger"
            ? "bg-red-50"
            : item.status === "warning"
            ? "bg-yellow-50"
            : item.status === "good"
            ? "bg-green-50"
            : "bg-neutral-50"
        }`}
      >
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          {item.title}
        </p>

        <p
          className={`mt-2 text-xl font-black ${
            item.status === "danger"
              ? "text-red-700"
              : item.status === "warning"
              ? "text-yellow-800"
              : item.status === "good"
              ? "text-green-700"
              : "text-neutral-800"
          }`}
        >
          {item.value}
        </p>
      </div>
    ))}
  </div>
</section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Daily Flow
        </p>

        <h2 className="mt-2 text-2xl font-black">Heute abschließen</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Link
            href="/planner"
            className="rounded-2xl bg-neutral-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-semibold">Planner</p>
            <p className="mt-1 text-sm text-neutral-400">
              {todayEvents.length} Termine heute
            </p>
          </Link>

          <Link
            href="/habits"
            className="rounded-2xl bg-neutral-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-semibold">Habits</p>
            <p className="mt-1 text-sm text-neutral-400">
              {completedHabits}/{habits.length} erledigt
            </p>
          </Link>

          <Link
            href="/journal"
            className="rounded-2xl bg-neutral-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-semibold">Journal</p>
            <p className="mt-1 text-sm text-neutral-400">
              {journalDone ? "Heute erledigt" : "Noch offen"}
            </p>
          </Link>

          <div className="rounded-2xl bg-neutral-50 p-4">
            <p className="font-semibold">Tasks</p>
            <p className="mt-1 text-sm text-neutral-400">
              {completedTasks}/{tasks.length} erledigt
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Jahresfortschritt
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Tag {dayOfYear} von {totalDays}
            </h2>
          </div>

          <p className="text-3xl font-black">{yearProgress}%</p>
        </div>

        <div className="mt-5 h-3 rounded-full bg-neutral-200">
          <div
            className="h-3 rounded-full bg-black"
            style={{ width: `${yearProgress}%` }}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/planner">
          <StatCard
            title="Planner"
            value={`${todayEvents.length}`}
            description="Termine heute"
            icon={CalendarDays}
          />
        </Link>

        <Link href="/habits">
          <StatCard
            title="Habits"
            value={`${completedHabits}/${habits.length}`}
            description={`${habitsPercent}% heute erledigt`}
            icon={Repeat}
          />
        </Link>

        <Link href="/journal">
          <StatCard
            title="Journal"
            value={journalDone ? "Done" : "Offen"}
            description="Heutige Reflexion"
            icon={BookOpen}
          />
        </Link>

        <Link href="/budget">
          <StatCard
            title="Budget"
            value={`${remaining.toFixed(2)} €`}
            description="Verfügbar"
            icon={Wallet}
          />
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SectionCard title="Heute">
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Neue Aufgabe"
                  className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-neutral-500"
                />

                <button
                  onClick={addTask}
                  className="rounded-2xl bg-black px-5 py-3 text-white transition hover:scale-105 active:scale-95"
                >
                  +
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
                  Keine Aufgaben für heute. Starte mit deiner ersten.
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex justify-between rounded-2xl bg-neutral-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div
                        onClick={() => toggleTask(task.id)}
                        className="flex flex-1 cursor-pointer items-center gap-3"
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                            task.done
                              ? "border-black bg-black text-white"
                              : "border-neutral-300"
                          }`}
                        >
                          {task.done && "✓"}
                        </div>

                        <span
                          className={
                            task.done ? "line-through text-neutral-400" : ""
                          }
                        >
                          {task.title}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="ml-4 text-neutral-400 transition hover:text-black"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Lebensbereiche">
            <div className="grid gap-4 md:grid-cols-2">
              {lifeAreas.map((area) => (
                <LifeAreaCard
                  key={area.id}
                  title={area.title}
                  value={area.value}
                  description={area.description}
                  onChange={(value) => updateLifeArea(area.id, value)}
                />
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Heutiger Zeitplan">
            <div className="space-y-3">
              {todayEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
                  Heute sind keine Termine eingetragen.
                </div>
              ) : (
                todayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href="/planner"
                    className="block rounded-2xl bg-neutral-50 p-4 transition hover:shadow-md"
                  >
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-1 text-sm text-neutral-400">
                      {event.start} – {event.end}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="System Status">
            <div className="space-y-4">
              <Link
                href="/habits"
                className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 transition hover:shadow-md"
              >
                <div>
                  <p className="font-semibold">Habits heute</p>
                  <p className="text-sm text-neutral-400">
                    {completedHabits}/{habits.length} erledigt
                  </p>
                </div>
                <Repeat size={20} />
              </Link>

              <Link
                href="/journal"
                className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 transition hover:shadow-md"
              >
                <div>
                  <p className="font-semibold">Journal</p>
                  <p className="text-sm text-neutral-400">
                    {journalDone ? "Heute ausgefüllt" : "Heute noch offen"}
                  </p>
                </div>
                <BookOpen size={20} />
              </Link>

              <Link
                href="/habits"
                className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 transition hover:shadow-md"
              >
                <div>
                  <p className="font-semibold">Beste Streak</p>
                  <p className="text-sm text-neutral-400">
                    {bestStreak} Tage am Stück
                  </p>
                </div>
                <Flame size={20} />
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Ziele">
            <div className="space-y-3">
              {goals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
                  Noch keine Ziele vorhanden.
                </div>
              ) : (
                goals
                  .slice(0, 3)
                  .map((goal) => (
                    <GoalCard
                      key={goal.id}
                      title={goal.title}
                      progress={goal.progress}
                    />
                  ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Budget">
            <div className="space-y-2">
              <div className="flex justify-between rounded-2xl bg-neutral-50 p-4">
                <span>Einnahmen</span>
                <span>{totalIncome.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between rounded-2xl bg-neutral-50 p-4">
                <span>Ausgaben</span>
                <span>{totalExpenses.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between rounded-2xl bg-black p-4 font-bold text-white">
                <span>Verfügbar</span>
                <span>{remaining.toFixed(2)} €</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
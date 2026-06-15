"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Goal = {
  id: number;
  title: string;
  goalType: "free" | "measurable";
  progress: number;
  currentValue: number;
  targetValue: number;
  unit: string;
};

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

type Routine = {
  id: number;
  title: string;
  completedToday: boolean;
  showOnDashboard: boolean;
};

const modules = [
  {
    title: "Ziele",
    description: "Freie und messbare Ziele verwalten.",
    href: "/goals",
    icon: "🎯",
  },
  {
    title: "Aufgaben",
    description: "Einmalige Schritte planen.",
    href: "/tasks",
    icon: "✅",
  },
  {
    title: "Routinen",
    description: "Wiederkehrende Gewohnheiten aufbauen.",
    href: "/routines",
    icon: "🔄",
  },
  {
    title: "Planer",
    description: "Tage und Wochen organisieren.",
    href: "/planner",
    icon: "📅",
  },
  {
    title: "Journal",
    description: "Morgen und Abend reflektieren.",
    href: "/journal",
    icon: "📖",
  },
  {
    title: "Finanzen",
    description: "Geld, Budget und Vermögen überblicken.",
    href: "/budget",
    icon: "💰",
  },
];

export default function HomePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    const savedGoals = localStorage.getItem("goals");
    const savedTasks = localStorage.getItem("tasks");
    const savedRoutines = localStorage.getItem("routines");

    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedRoutines) setRoutines(JSON.parse(savedRoutines));
  }, []);

  const openTasks = tasks.filter((task) => !task.completed);
  const dashboardRoutines = routines.filter(
    (routine) => routine.showOnDashboard
  );
  const openRoutines = dashboardRoutines.filter(
    (routine) => !routine.completedToday
  );

  const focusText =
    openTasks.length > 0
      ? `${openTasks.length} offene Aufgabe(n).`
      : openRoutines.length > 0
      ? `${openRoutines.length} Routine(n) noch offen.`
      : goals.length > 0
      ? "Heute ist Raum für Fortschritt an deinen Zielen."
      : "Lege dein erstes Ziel, deine erste Aufgabe oder Routine an.";

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">Life System</p>

        <h1 className="mt-2 text-5xl font-black">
          Dein Leben. Ein System.
        </h1>

        <p className="mt-3 max-w-2xl text-neutral-300">
          Baue dein eigenes Betriebssystem für dein Leben.
        </p>
      </section>

      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-md">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Heute zählt
        </p>

        <h2 className="mt-2 text-2xl font-black">{focusText}</h2>

        <p className="mt-2 text-neutral-500">
          Dein Dashboard zeigt dir die wichtigsten offenen Punkte aus Zielen,
          Aufgaben und Routinen.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Link
          href="/goals"
          className="rounded-[1.75rem] bg-white p-6 shadow-md"
        >
          <p className="text-sm text-neutral-400">Ziele</p>
          <h2 className="mt-2 text-3xl font-black">{goals.length}</h2>
          <p className="mt-1 text-sm text-neutral-500">aktiv</p>
        </Link>

        <Link
          href="/tasks"
          className="rounded-[1.75rem] bg-white p-6 shadow-md"
        >
          <p className="text-sm text-neutral-400">Aufgaben</p>
          <h2 className="mt-2 text-3xl font-black">{openTasks.length}</h2>
          <p className="mt-1 text-sm text-neutral-500">offen</p>
        </Link>

        <Link
          href="/routines"
          className="rounded-[1.75rem] bg-white p-6 shadow-md"
        >
          <p className="text-sm text-neutral-400">Routinen</p>
          <h2 className="mt-2 text-3xl font-black">
            {dashboardRoutines.length - openRoutines.length}/
            {dashboardRoutines.length}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">heute erledigt</p>
        </Link>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Offene Aufgaben</h2>
            <Link href="/tasks" className="text-sm font-semibold">
              Alle ansehen
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {openTasks.length === 0 ? (
              <p className="text-neutral-400">Keine offenen Aufgaben.</p>
            ) : (
              openTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl bg-neutral-50 p-4 font-semibold"
                >
                  {task.title}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Offene Routinen</h2>
            <Link href="/routines" className="text-sm font-semibold">
              Alle ansehen
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {openRoutines.length === 0 ? (
              <p className="text-neutral-400">Keine offenen Routinen.</p>
            ) : (
              openRoutines.slice(0, 3).map((routine) => (
                <div
                  key={routine.id}
                  className="rounded-2xl bg-neutral-50 p-4 font-semibold"
                >
                  {routine.title}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="rounded-[1.75rem] bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-4xl">{module.icon}</p>

            <h2 className="mt-4 text-2xl font-black">{module.title}</h2>

            <p className="mt-2 text-sm text-neutral-500">
              {module.description}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
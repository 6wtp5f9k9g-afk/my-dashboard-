"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SectionCard from "@/components/SectionCard";

type TodayTask = {
  id: number;
  title: string;
  done: boolean;
};

function getDateKey(date: Date) {
  return date.toISOString().split("T")[0];
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
  const date = new Date(dateString);

  return date.toLocaleDateString("de-DE", {
    weekday: "short",
  });
}

export default function WeekPage() {
  const [allTasks, setAllTasks] = useState<Record<string, TodayTask[]>>({});
  const [weeklyFocus, setWeeklyFocus] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasksByDate");
    const savedFocus = localStorage.getItem("weeklyFocus");

    if (savedTasks) {
      setAllTasks(JSON.parse(savedTasks));
    }

    if (savedFocus) {
      setWeeklyFocus(savedFocus);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("weeklyFocus", weeklyFocus);
  }, [weeklyFocus]);

  const weekDays = useMemo(() => {
    return getLast7Days();
  }, []);

  const weeklyStats = weekDays.map((date) => {
    const tasks = allTasks[date] || [];
    const done = tasks.filter((task) => task.done).length;
    const percent =
      tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

    return {
      date,
      tasks,
      done,
      percent,
    };
  });

  const totalTasks = weeklyStats.reduce((sum, day) => sum + day.tasks.length, 0);
  const totalDone = weeklyStats.reduce((sum, day) => sum + day.done, 0);
  const weekPercent =
    totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  const bestDay = [...weeklyStats].sort((a, b) => b.percent - a.percent)[0];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-500">Woche</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">
          Wochenübersicht
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Dein Überblick über die letzten 7 Tage, deinen Fortschritt und den
          Fokus dieser Woche.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Erledigte Aufgaben</p>
          <h2 className="mt-2 text-3xl font-bold">
            {totalDone}/{totalTasks}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Erledigte Aufgaben in den letzten 7 Tagen.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Wochenquote</p>
          <h2 className="mt-2 text-3xl font-bold">{weekPercent}%</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Gesamtfortschritt deiner Woche.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Stärkster Tag</p>
          <h2 className="mt-2 text-3xl font-bold">
            {bestDay ? formatDay(bestDay.date) : "-"}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Bester Fortschritt innerhalb der Woche.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Tage mit Aufgaben</p>
          <h2 className="mt-2 text-3xl font-bold">
            {weeklyStats.filter((day) => day.tasks.length > 0).length}/7
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Wie oft du diese Woche aktiv geplant hast.
          </p>
        </div>
      </section>

      <SectionCard
        title="Wochenfokus"
        subtitle="Ein klarer Satz für diese Woche."
      >
        <textarea
          value={weeklyFocus}
          onChange={(e) => setWeeklyFocus(e.target.value)}
          placeholder="Was ist mein Fokus diese Woche?"
          className="min-h-[120px] w-full rounded-2xl border border-neutral-200 bg-white p-4 outline-none transition focus:border-neutral-400"
        />
      </SectionCard>

      <SectionCard
        title="Letzte 7 Tage"
        subtitle="Klicke auf einen Tag für die Detailansicht."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {weeklyStats.map((day) => (
            <Link
              key={day.date}
              href={`/day/${day.date}`}
              className="block rounded-3xl border border-neutral-200 bg-neutral-50 p-5 transition hover:border-neutral-400 hover:bg-white"
            >
              <p className="text-sm text-neutral-500">
                {formatDay(day.date)} ({day.date.slice(5)})
              </p>
              <p className="mt-2 text-2xl font-bold">
                {day.done}/{day.tasks.length}
              </p>
              <p className="mt-1 text-sm text-neutral-600">erledigt</p>

              <div className="mt-4 h-2 rounded-full bg-neutral-200">
                <div
                  className="h-2 rounded-full bg-neutral-900"
                  style={{ width: `${day.percent}%` }}
                ></div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
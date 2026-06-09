"use client";

import { useEffect, useMemo, useState } from "react";

type PlannerEvent = {
  id: number;
  title: string;
  date: string;
  start: string;
  end: string;
};

type TodayTask = {
  id: number;
  title: string;
  done: boolean;
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 72;

export default function PlannerPage() {
  const today = getToday();

  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  const [selectedTask, setSelectedTask] = useState<TodayTask | null>(null);
  const [assignStart, setAssignStart] = useState("09:00");
  const [assignEnd, setAssignEnd] = useState("10:00");

  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    const savedTasks = localStorage.getItem("tasks");

    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addEvent() {
    const trimmed = title.trim();
    if (!trimmed || !date || !start || !end) return;

    if (timeToMinutes(end) <= timeToMinutes(start)) {
      alert("Endzeit muss nach Startzeit liegen.");
      return;
    }

    const newEvent: PlannerEvent = {
      id: Date.now(),
      title: trimmed,
      date,
      start,
      end,
    };

    setEvents((prev) =>
      [...prev, newEvent].sort((a, b) => a.start.localeCompare(b.start))
    );

    setTitle("");
    setStart("09:00");
    setEnd("10:00");
  }

  function deleteEvent(id: number) {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  const selectedEvents = useMemo(() => {
    return events
      .filter((event) => event.date === date)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [events, date]);

  const openTasks = tasks.filter((task) => !task.done);
  const doneTasks = tasks.filter((task) => task.done);

  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, index) => START_HOUR + index
  );

  const timelineHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = START_HOUR * 60;
  const endMinutes = END_HOUR * 60;

  const showNowMarker =
    date === today &&
    currentMinutes >= startMinutes &&
    currentMinutes <= endMinutes;

  const nowTop = ((currentMinutes - startMinutes) / 60) * HOUR_HEIGHT;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">{date}</p>
        <h1 className="mt-2 text-5xl font-black">Planner</h1>
        <p className="mt-2 text-neutral-300">
          Plane Termine und kombiniere sie mit deinen Tasks.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">Neuer Termin</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_130px_130px_auto]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addEvent()}
            placeholder="Termin, Aufgabe oder Zeitblock"
            className="rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500"
          />

          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500"
          />

          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500"
          />

          <button
            onClick={addEvent}
            className="rounded-2xl bg-black px-5 py-3 text-white transition hover:scale-105 active:scale-95"
          >
            +
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-[2rem] bg-white p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Timeline
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {selectedEvents.length} Termine
              </h2>
            </div>

            <button
              onClick={() => setDate(today)}
              className="rounded-2xl bg-neutral-100 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-200"
            >
              Heute
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="relative min-w-[520px]">
              <div
                className="relative ml-20 border-l border-neutral-200"
                style={{ height: `${timelineHeight}px` }}
              >
                {hours.slice(0, -1).map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute left-0 w-full border-t border-neutral-100"
                    style={{ top: `${index * HOUR_HEIGHT}px` }}
                  >
                    <span className="absolute -left-20 -top-3 text-sm font-semibold text-neutral-400">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}

                {showNowMarker && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center"
                    style={{ top: `${nowTop}px` }}
                  >
                    <div className="-ml-[7px] h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-[2px] flex-1 bg-red-500" />
                    <span className="ml-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                      Jetzt
                    </span>
                  </div>
                )}

                {selectedEvents.map((event) => {
                  const startMin = timeToMinutes(event.start);
                  const endMin = timeToMinutes(event.end);

                  const top =
                    ((startMin - startMinutes) / 60) * HOUR_HEIGHT;

                  const height =
                    ((endMin - startMin) / 60) * HOUR_HEIGHT;

                  return (
                    <div
                      key={event.id}
                      className="absolute left-4 right-4 rounded-2xl bg-black p-4 text-white shadow-lg"
                      style={{
                        top: `${Math.max(0, top)}px`,
                        height: `${Math.max(56, height)}px`,
                      }}
                    >
                      <div className="flex h-full justify-between gap-4">
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="mt-1 text-sm text-neutral-400">
                            {event.start} – {event.end}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="self-start rounded-xl px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Tasks
            </p>
            <h2 className="mt-2 text-2xl font-black">Offen</h2>

            <div className="mt-5 space-y-3">
              {openTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
                  Keine offenen Tasks.
                </div>
              ) : (
                openTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-neutral-50 p-4 text-left transition hover:shadow-md"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300" />
                    <span className="font-medium">{task.title}</span>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Erledigt
            </p>
            <h2 className="mt-2 text-2xl font-black">{doneTasks.length}</h2>

            <div className="mt-5 space-y-3">
              {doneTasks.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  Noch nichts erledigt.
                </p>
              ) : (
                doneTasks.slice(0, 5).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-neutral-50 p-4 text-left text-neutral-400 line-through transition hover:shadow-md"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                      ✓
                    </span>
                    <span>{task.title}</span>
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-[2rem] bg-white p-6 shadow-xl">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Task einplanen
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {selectedTask.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                value={assignStart}
                onChange={(e) => setAssignStart(e.target.value)}
                className="rounded-2xl border border-neutral-200 px-4 py-3"
              />

              <input
                type="time"
                value={assignEnd}
                onChange={(e) => setAssignEnd(e.target.value)}
                className="rounded-2xl border border-neutral-200 px-4 py-3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (timeToMinutes(assignEnd) <= timeToMinutes(assignStart)) {
                    alert("Endzeit muss nach Startzeit liegen.");
                    return;
                  }

                  const newEvent: PlannerEvent = {
                    id: Date.now(),
                    title: selectedTask.title,
                    date,
                    start: assignStart,
                    end: assignEnd,
                  };

                  setEvents((prev) =>
                    [...prev, newEvent].sort((a, b) =>
                      a.start.localeCompare(b.start)
                    )
                  );

                  setSelectedTask(null);
                  setAssignStart("09:00");
                  setAssignEnd("10:00");
                }}
                className="flex-1 rounded-2xl bg-black px-4 py-3 font-semibold text-white"
              >
                Einplanen
              </button>

              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 rounded-2xl bg-neutral-100 px-4 py-3 font-semibold"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
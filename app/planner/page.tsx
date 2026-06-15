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
  completed: boolean;
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

  const [editingEventId, setEditingEventId] = useState<number | null>(null);

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

  function saveEvents(updatedEvents: PlannerEvent[]) {
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
  }

  function saveTasks(updatedTasks: TodayTask[]) {
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  }

  function resetForm() {
    setEditingEventId(null);
    setTitle("");
    setStart("09:00");
    setEnd("10:00");
  }

  function saveEvent() {
    const trimmed = title.trim();
    if (!trimmed || !date || !start || !end) return;

    if (timeToMinutes(end) <= timeToMinutes(start)) {
      alert("Endzeit muss nach Startzeit liegen.");
      return;
    }

    if (editingEventId) {
      const updatedEvents = events
        .map((event) =>
          event.id === editingEventId
            ? {
                ...event,
                title: trimmed,
                date,
                start,
                end,
              }
            : event
        )
        .sort((a, b) => a.start.localeCompare(b.start));

      saveEvents(updatedEvents);
      resetForm();
      return;
    }

    const newEvent: PlannerEvent = {
      id: Date.now(),
      title: trimmed,
      date,
      start,
      end,
    };

    saveEvents([...events, newEvent].sort((a, b) => a.start.localeCompare(b.start)));
    resetForm();
  }

  function editEvent(event: PlannerEvent) {
    setEditingEventId(event.id);
    setTitle(event.title);
    setDate(event.date);
    setStart(event.start);
    setEnd(event.end);
  }

  function deleteEvent(id: number) {
    saveEvents(events.filter((event) => event.id !== id));

    if (editingEventId === id) {
      resetForm();
    }
  }

  function toggleTask(id: number) {
    saveTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function planSelectedTask() {
    if (!selectedTask) return;

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

    saveEvents([...events, newEvent].sort((a, b) => a.start.localeCompare(b.start)));

    setSelectedTask(null);
    setAssignStart("09:00");
    setAssignEnd("10:00");
  }

  const selectedEvents = useMemo(() => {
    return events
      .filter((event) => event.date === date)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [events, date]);

  const openTasks = tasks.filter((task) => !task.completed);
  const doneTasks = tasks.filter((task) => task.completed);

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
        <h1 className="mt-2 text-5xl font-black">📅 Planung</h1>
        <p className="mt-2 text-neutral-300">
          Plane Termine und kombiniere sie mit deinen Aufgaben.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">
          {editingEventId ? "Termin bearbeiten" : "Neuer Termin"}
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_130px_130px_auto]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveEvent()}
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
            onClick={saveEvent}
            className="rounded-2xl bg-black px-5 py-3 font-semibold text-white transition hover:scale-105 active:scale-95"
          >
            {editingEventId ? "Speichern" : "+"}
          </button>
        </div>

        {editingEventId && (
          <button
            onClick={resetForm}
            className="mt-3 rounded-2xl bg-neutral-100 px-5 py-3 font-semibold"
          >
            Abbrechen
          </button>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-[2rem] bg-white p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Timeline
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {selectedEvents.length} Termin(e)
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

                  const top = ((startMin - startMinutes) / 60) * HOUR_HEIGHT;
                  const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;

                  return (
                    <div
                      key={event.id}
                      className="absolute left-4 right-4 rounded-2xl bg-black p-4 text-white shadow-lg"
                      style={{
                        top: `${Math.max(0, top)}px`,
                        height: `${Math.max(64, height)}px`,
                      }}
                    >
                      <div className="flex h-full justify-between gap-4">
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="mt-1 text-sm text-neutral-400">
                            {event.start} – {event.end}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => editEvent(event)}
                            className="self-start rounded-xl px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="self-start rounded-xl px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
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
              Aufgaben
            </p>
            <h2 className="mt-2 text-2xl font-black">Offen</h2>

            <div className="mt-5 space-y-3">
              {openTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
                  Keine offenen Aufgaben.
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
                Aufgabe einplanen
              </p>
              <h2 className="mt-2 text-2xl font-black">{selectedTask.title}</h2>
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
                onClick={planSelectedTask}
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
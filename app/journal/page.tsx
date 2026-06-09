"use client";

import { useEffect, useMemo, useState } from "react";

type Mood = "Sehr schlecht" | "Schlecht" | "Okay" | "Gut" | "Sehr gut";

type JournalArea = {
  id: number;
  title: string;
  active: boolean;
  custom?: boolean;
};

type AreaScore = {
  areaId: number;
  score: number;
};

type JournalEntry = {
  date: string;
  mood: Mood;
  energy: number;
  areaScores: AreaScore[];
  gratitude: string;
  win: string;
  challenge: string;
  learned: string;
  improveTomorrow: string;
  note: string;
};

const moods: Mood[] = ["Sehr schlecht", "Schlecht", "Okay", "Gut", "Sehr gut"];

const defaultAreas: JournalArea[] = [
  { id: 1, title: "Gesundheit", active: true },
  { id: 2, title: "Schule / Ausbildung", active: true },
  { id: 3, title: "Arbeit", active: false },
  { id: 4, title: "Finanzen", active: true },
  { id: 5, title: "Familie", active: false },
  { id: 6, title: "Freunde", active: false },
  { id: 7, title: "Beziehung", active: false },
  { id: 8, title: "Mindset", active: true },
  { id: 9, title: "Sport", active: false },
  { id: 10, title: "Ernährung", active: false },
  { id: 11, title: "Kreativität", active: false },
  { id: 12, title: "Freizeit", active: false },
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getMonth(date: string) {
  return date.slice(0, 7);
}

function emptyEntry(date: string, areas: JournalArea[]): JournalEntry {
  return {
    date,
    mood: "Okay",
    energy: 5,
    areaScores: areas
      .filter((area) => area.active)
      .map((area) => ({ areaId: area.id, score: 5 })),
    gratitude: "",
    win: "",
    challenge: "",
    learned: "",
    improveTomorrow: "",
    note: "",
  };
}

function getAreaScore(entry: JournalEntry, areaId: number) {
  return (
    (entry.areaScores ?? []).find((item) => item.areaId === areaId)?.score ?? 5
  );
}

export default function JournalPage() {
  const today = getToday();

  const [areas, setAreas] = useState<JournalArea[]>(defaultAreas);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [entry, setEntry] = useState<JournalEntry>(
    emptyEntry(today, defaultAreas)
  );
  const [newArea, setNewArea] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    const savedAreas = localStorage.getItem("journalAreas");
    const savedEntries = localStorage.getItem("journal");

    const loadedAreas = savedAreas ? JSON.parse(savedAreas) : defaultAreas;
    setAreas(loadedAreas);

    if (savedEntries) {
      const parsed: JournalEntry[] = JSON.parse(savedEntries);
      setEntries(parsed);

      const existing = parsed.find((item) => item.date === today);
      setEntry(existing ? syncEntryWithAreas(existing, loadedAreas) : emptyEntry(today, loadedAreas));
    } else {
      setEntry(emptyEntry(today, loadedAreas));
    }
  }, [today]);

  useEffect(() => {
    const existing = entries.find((item) => item.date === selectedDate);
    setEntry(
      existing ? syncEntryWithAreas(existing, areas) : emptyEntry(selectedDate, areas)
    );
  }, [selectedDate, entries, areas]);

  function syncEntryWithAreas(
    currentEntry: JournalEntry,
    currentAreas: JournalArea[]
  ) {
    const activeAreas = currentAreas.filter((area) => area.active);
    const currentScores = currentEntry.areaScores ?? [];

    const syncedScores = activeAreas.map((area) => {
      const existingScore = currentScores.find(
        (score) => score.areaId === area.id
      );

      return {
        areaId: area.id,
        score: existingScore?.score ?? 5,
      };
    });

    return {
      ...emptyEntry(currentEntry.date, currentAreas),
      ...currentEntry,
      areaScores: syncedScores,
    };
  }

  function saveAreas(updatedAreas: JournalArea[]) {
    setAreas(updatedAreas);
    localStorage.setItem("journalAreas", JSON.stringify(updatedAreas));
  }

  function saveEntry() {
    const syncedEntry = syncEntryWithAreas(entry, areas);

    const updated = entries.some((item) => item.date === syncedEntry.date)
      ? entries.map((item) =>
          item.date === syncedEntry.date ? syncedEntry : item
        )
      : [syncedEntry, ...entries];

    setEntries(updated);
    setEntry(syncedEntry);
    localStorage.setItem("journal", JSON.stringify(updated));
  }

  function deleteEntry(date: string) {
    const updated = entries.filter((item) => item.date !== date);
    setEntries(updated);
    localStorage.setItem("journal", JSON.stringify(updated));
    setEntry(emptyEntry(selectedDate, areas));
  }

  function updateField<K extends keyof JournalEntry>(
    key: K,
    value: JournalEntry[K]
  ) {
    setEntry((prev) => ({ ...prev, [key]: value }));
  }

  function updateAreaScore(areaId: number, score: number) {
    setEntry((prev) => {
      const currentScores = prev.areaScores ?? [];
      const exists = currentScores.some((item) => item.areaId === areaId);

      return {
        ...prev,
        areaScores: exists
          ? currentScores.map((item) =>
              item.areaId === areaId ? { ...item, score } : item
            )
          : [...currentScores, { areaId, score }],
      };
    });
  }

  function toggleArea(id: number) {
    const updatedAreas = areas.map((area) =>
      area.id === id ? { ...area, active: !area.active } : area
    );

    saveAreas(updatedAreas);
  }

  function addArea() {
    const trimmed = newArea.trim();
    if (!trimmed) return;

    const newItem: JournalArea = {
      id: Date.now(),
      title: trimmed,
      active: true,
      custom: true,
    };

    saveAreas([...areas, newItem]);
    setNewArea("");
  }

  function deleteArea(id: number) {
    saveAreas(areas.filter((area) => area.id !== id));
  }

  const activeAreas = areas.filter((area) => area.active);

  const filteredEntries = useMemo(() => {
    let list = [...entries];

    if (selectedMonth !== "all") {
      list = list.filter((item) => getMonth(item.date) === selectedMonth);
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      list = list.filter((item) => {
        return (
          (item.note ?? "").toLowerCase().includes(query) ||
          (item.win ?? "").toLowerCase().includes(query) ||
          (item.gratitude ?? "").toLowerCase().includes(query) ||
          (item.challenge ?? "").toLowerCase().includes(query) ||
          (item.learned ?? "").toLowerCase().includes(query) ||
          (item.improveTomorrow ?? "").toLowerCase().includes(query)
        );
      });
    }

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, search, selectedMonth]);

  const availableMonths = useMemo(() => {
    return Array.from(new Set(entries.map((item) => getMonth(item.date))))
      .sort()
      .reverse();
  }, [entries]);

  const averageScore =
    activeAreas.length > 0
      ? Math.round(
          activeAreas.reduce(
            (sum, area) => sum + getAreaScore(entry, area.id),
            0
          ) / activeAreas.length
        )
      : 0;

  const journalDone = entries.some((item) => item.date === today);

  const last7Entries = useMemo(() => {
    return [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  }, [entries]);

  const journalStreak = useMemo(() => {
    let streak = 0;
    const current = new Date();

    while (true) {
      const dateKey = current.toISOString().split("T")[0];
      const exists = entries.some((item) => item.date === dateKey);

      if (!exists) break;

      streak++;
      current.setDate(current.getDate() - 1);
    }

    return streak;
  }, [entries]);

  const areaAverages = activeAreas.map((area) => {
    const scores = entries
      .map(
        (item) =>
          (item.areaScores ?? []).find((score) => score.areaId === area.id)
            ?.score
      )
      .filter((score): score is number => typeof score === "number");

    const average =
      scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;

    return { title: area.title, average };
  });

  const bestArea = [...areaAverages]
    .filter((area) => area.average > 0)
    .sort((a, b) => b.average - a.average)[0];

  const weakestArea = [...areaAverages]
    .filter((area) => area.average > 0)
    .sort((a, b) => a.average - b.average)[0];

  const averageEnergy =
    last7Entries.length > 0
      ? Math.round(
          last7Entries.reduce((sum, item) => sum + (item.energy ?? 5), 0) /
            last7Entries.length
        )
      : 0;

  const journalInsights = [
    {
      priority:
        journalStreak >= 3 ? "good" : journalStreak > 0 ? "normal" : "warning",
      text:
        journalStreak > 0
          ? `Journal-Streak: ${journalStreak} Tag(e).`
          : "Du hast aktuell keine Journal-Streak.",
    },
    {
      priority:
        averageEnergy >= 7 ? "good" : averageEnergy >= 4 ? "normal" : "warning",
      text:
        last7Entries.length > 0
          ? `Ø Energie der letzten Einträge: ${averageEnergy}/10.`
          : "Noch nicht genug Einträge für Energie-Insights.",
    },
    {
      priority: bestArea ? "good" : "normal",
      text: bestArea
        ? `Stärkster Bereich: ${bestArea.title} (${bestArea.average}/10).`
        : "Noch keine Bereichsdaten vorhanden.",
    },
    {
      priority:
        weakestArea && weakestArea.average <= 5
          ? "warning"
          : weakestArea
          ? "normal"
          : "normal",
      text: weakestArea
        ? `Potenzial: ${weakestArea.title} (${weakestArea.average}/10).`
        : "Noch kein schwächerer Bereich erkennbar.",
    },
  ];

  const trendData = useMemo(() => {
    return [...entries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((item) => ({
        date: item.date.slice(5),
        energy: item.energy ?? 5,
      }));
  }, [entries]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">{selectedDate}</p>
        <h1 className="mt-2 text-5xl font-black">Journal</h1>
        <p className="mt-2 text-neutral-300">
          Reflektiere deinen Tag, erkenne Muster und verbessere morgen.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard title="Heute" value={journalDone ? "Erledigt" : "Offen"} />
        <InfoCard title="Einträge" value={`${entries.length}`} />
        <InfoCard title="Tageswert" value={averageScore > 0 ? `${averageScore}/10` : "—"} />
        <InfoCard title="Streak" value={`${journalStreak} Tage`} />
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Eintrag
            </p>
            <h2 className="mt-2 text-2xl font-black">Heute reflektieren</h2>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          />
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Journal Insights
        </p>
        <h2 className="mt-2 text-2xl font-black">Deine Muster</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {journalInsights.map((insight) => (
            <div
              key={insight.text}
              className={`rounded-2xl p-4 ${
                insight.priority === "warning"
                  ? "bg-yellow-50"
                  : insight.priority === "good"
                  ? "bg-green-50"
                  : "bg-neutral-50"
              }`}
            >
              <p className="text-sm font-medium text-neutral-700">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Trends
        </p>
        <h2 className="mt-2 text-2xl font-black">Energie Verlauf</h2>

        {trendData.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">
            Noch nicht genug Daten für Trends.
          </p>
        ) : (
          <div className="mt-6 flex h-44 items-end gap-2">
            {trendData.map((point) => {
              const height = (point.energy / 10) * 100;

              return (
                <div
                  key={point.date}
                  className="flex h-full flex-1 flex-col items-center"
                >
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-xl bg-black transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span className="mt-2 text-xs text-neutral-400">
                    {point.date}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-md">
          <h2 className="text-2xl font-black">Daily Check-in</h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="text-sm font-semibold">Stimmung</label>
              <select
                value={entry.mood}
                onChange={(e) => updateField("mood", e.target.value as Mood)}
                className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3"
              >
                {moods.map((mood) => (
                  <option key={mood}>{mood}</option>
                ))}
              </select>
            </div>

            <RangeInput
              label="Energie"
              value={entry.energy}
              onChange={(value) => updateField("energy", value)}
            />

            {activeAreas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
                Aktiviere mindestens einen Bereich.
              </div>
            ) : (
              activeAreas.map((area) => (
                <RangeInput
                  key={area.id}
                  label={area.title}
                  value={getAreaScore(entry, area.id)}
                  onChange={(value) => updateAreaScore(area.id, value)}
                />
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-md">
          <h2 className="text-2xl font-black">Reflexion</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextArea
              label="Wofür bist du dankbar?"
              value={entry.gratitude}
              onChange={(value) => updateField("gratitude", value)}
            />

            <TextArea
              label="Größter Win"
              value={entry.win}
              onChange={(value) => updateField("win", value)}
            />

            <TextArea
              label="Was war schwierig?"
              value={entry.challenge}
              onChange={(value) => updateField("challenge", value)}
            />

            <TextArea
              label="Was hast du gelernt?"
              value={entry.learned}
              onChange={(value) => updateField("learned", value)}
            />

            <TextArea
              label="Morgen besser machen"
              value={entry.improveTomorrow}
              onChange={(value) => updateField("improveTomorrow", value)}
            />

            <TextArea
              label="Freie Notiz"
              value={entry.note}
              onChange={(value) => updateField("note", value)}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={saveEntry}
              className="rounded-2xl bg-black px-5 py-3 font-semibold text-white transition hover:scale-105 active:scale-95"
            >
              Journal speichern
            </button>

            <button
              onClick={() => deleteEntry(entry.date)}
              className="rounded-2xl bg-neutral-100 px-5 py-3 font-semibold text-neutral-500 transition hover:text-black"
            >
              Löschen
            </button>
          </div>
        </section>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">Bereiche verwalten</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Wähle aus, welche Bereiche du täglich bewerten möchtest.
        </p>

        <div className="mt-5 flex gap-3">
          <input
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addArea()}
            placeholder="Eigener Bereich, z. B. Schlaf, Lernen, Haushalt"
            className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3"
          />

          <button
            onClick={addArea}
            className="rounded-2xl bg-black px-5 py-3 font-semibold text-white"
          >
            Hinzufügen
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {areas.map((area) => (
            <div
              key={area.id}
              className={`flex items-center justify-between rounded-2xl p-4 ${
                area.active ? "bg-black text-white" : "bg-neutral-100"
              }`}
            >
              <button
                onClick={() => toggleArea(area.id)}
                className="flex-1 text-left font-semibold"
              >
                {area.active ? "✓ " : ""}
                {area.title}
              </button>

              {area.custom && (
                <button
                  onClick={() => deleteArea(area.id)}
                  className={`ml-3 rounded-xl px-2 ${
                    area.active ? "text-neutral-300" : "text-neutral-400"
                  }`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Archiv
            </p>
            <h2 className="mt-2 text-2xl font-black">Vergangene Einträge</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen..."
              className="rounded-2xl border border-neutral-200 px-4 py-3"
            />

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-2xl border border-neutral-200 px-4 py-3"
            >
              <option value="all">Alle Monate</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
              Keine passenden Journal-Einträge.
            </div>
          ) : (
            filteredEntries.map((item) => {
              const itemAreaScores = item.areaScores ?? [];

              const itemAreas = areas.filter((area) =>
                itemAreaScores.some((score) => score.areaId === area.id)
              );

              const itemAverage =
                itemAreas.length > 0
                  ? Math.round(
                      itemAreas.reduce(
                        (sum, area) =>
                          sum +
                          (itemAreaScores.find(
                            (score) => score.areaId === area.id
                          )?.score ?? 5),
                        0
                      ) / itemAreas.length
                    )
                  : item.energy ?? 5;

              return (
                <button
                  key={item.date}
                  onClick={() => setSelectedDate(item.date)}
                  className="w-full rounded-2xl bg-neutral-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.date}</p>
                      <p className="mt-1 text-sm text-neutral-400">
                        Stimmung: {item.mood}
                      </p>
                    </div>

                    <p className="text-xl font-black">{itemAverage}/10</p>
                  </div>

                  {item.win && (
                    <p className="mt-3 text-sm text-neutral-600">
                      Win: {item.win}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-md">
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        {title}
      </p>
      <h2 className="mt-3 text-3xl font-black">{value}</h2>
    </div>
  );
}

function RangeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between">
        <label className="text-sm font-semibold">{label}</label>
        <span className="text-sm font-bold">{value ?? 5}/10</span>
      </div>

      <input
        type="range"
        min="1"
        max="10"
        value={value ?? 5}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500"
      />
    </div>
  );
}
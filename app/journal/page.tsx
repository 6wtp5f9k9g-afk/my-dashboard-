"use client";

import { useEffect, useState } from "react";

type Mood = "Sehr schlecht" | "Schlecht" | "Okay" | "Gut" | "Sehr gut";

type JournalSettings = {
  morningEnabled: boolean;
  eveningEnabled: boolean;
  moodEnabled: boolean;
  focusEnabled: boolean;
  winEnabled: boolean;
  improveEnabled: boolean;
  noteEnabled: boolean;
};

type JournalEntry = {
  id: number;
  date: string;
  type: "morning" | "evening";
  mood: Mood;
  focus: string;
  win: string;
  improve: string;
  note: string;
};

const moods: Mood[] = ["Sehr schlecht", "Schlecht", "Okay", "Gut", "Sehr gut"];

const defaultSettings: JournalSettings = {
  morningEnabled: true,
  eveningEnabled: true,
  moodEnabled: true,
  focusEnabled: true,
  winEnabled: true,
  improveEnabled: true,
  noteEnabled: true,
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function JournalPage() {
  const today = getToday();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<JournalSettings>(defaultSettings);
  const [selectedDate, setSelectedDate] = useState(today);

  const [morningMood, setMorningMood] = useState<Mood>("Okay");
  const [morningFocus, setMorningFocus] = useState("");
  const [morningNote, setMorningNote] = useState("");

  const [eveningMood, setEveningMood] = useState<Mood>("Okay");
  const [eveningWin, setEveningWin] = useState("");
  const [eveningImprove, setEveningImprove] = useState("");
  const [eveningNote, setEveningNote] = useState("");

  useEffect(() => {
    const savedEntries = localStorage.getItem("journal");
    const savedSettings = localStorage.getItem("journalSettings");

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    const morning = entries.find(
      (entry) => entry.date === selectedDate && entry.type === "morning"
    );

    const evening = entries.find(
      (entry) => entry.date === selectedDate && entry.type === "evening"
    );

    setMorningMood(morning?.mood ?? "Okay");
    setMorningFocus(morning?.focus ?? "");
    setMorningNote(morning?.note ?? "");

    setEveningMood(evening?.mood ?? "Okay");
    setEveningWin(evening?.win ?? "");
    setEveningImprove(evening?.improve ?? "");
    setEveningNote(evening?.note ?? "");
  }, [selectedDate, entries]);

  function saveSettings(updated: JournalSettings) {
    setSettings(updated);
    localStorage.setItem("journalSettings", JSON.stringify(updated));
  }

  function toggleSetting(key: keyof JournalSettings) {
    saveSettings({
      ...settings,
      [key]: !settings[key],
    });
  }

  function saveEntries(updated: JournalEntry[]) {
    setEntries(updated);
    localStorage.setItem("journal", JSON.stringify(updated));
  }

  function saveMorning() {
    const entry: JournalEntry = {
      id: Date.now(),
      date: selectedDate,
      type: "morning",
      mood: morningMood,
      focus: morningFocus,
      win: "",
      improve: "",
      note: morningNote,
    };

    saveEntries([
      entry,
      ...entries.filter(
        (item) => !(item.date === selectedDate && item.type === "morning")
      ),
    ]);
  }

  function saveEvening() {
    const entry: JournalEntry = {
      id: Date.now(),
      date: selectedDate,
      type: "evening",
      mood: eveningMood,
      focus: "",
      win: eveningWin,
      improve: eveningImprove,
      note: eveningNote,
    };

    saveEntries([
      entry,
      ...entries.filter(
        (item) => !(item.date === selectedDate && item.type === "evening")
      ),
    ]);
  }

  function deleteEntry(id: number) {
    saveEntries(entries.filter((entry) => entry.id !== id));
  }

  const morningDone = entries.some(
    (entry) => entry.date === today && entry.type === "morning"
  );

  const eveningDone = entries.some(
    (entry) => entry.date === today && entry.type === "evening"
  );

  const sortedEntries = [...entries].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">{selectedDate}</p>
        <h1 className="mt-2 text-5xl font-black">📖 Journal</h1>
        <p className="mt-3 text-neutral-300">
          Baue dein eigenes Journal: morgens, abends, kurz oder ausführlich.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoCard title="Morgen" value={morningDone ? "Erledigt" : "Offen"} />
        <InfoCard title="Abend" value={eveningDone ? "Erledigt" : "Offen"} />
        <InfoCard title="Einträge" value={`${entries.length}`} />
      </section>

      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">Journal anpassen</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Entscheide selbst, welche Teile du nutzen möchtest.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <SettingToggle label="Morgen-Check-in" checked={settings.morningEnabled} onClick={() => toggleSetting("morningEnabled")} />
          <SettingToggle label="Abend-Reflexion" checked={settings.eveningEnabled} onClick={() => toggleSetting("eveningEnabled")} />
          <SettingToggle label="Stimmung" checked={settings.moodEnabled} onClick={() => toggleSetting("moodEnabled")} />
          <SettingToggle label="Tagesfokus" checked={settings.focusEnabled} onClick={() => toggleSetting("focusEnabled")} />
          <SettingToggle label="Was lief gut?" checked={settings.winEnabled} onClick={() => toggleSetting("winEnabled")} />
          <SettingToggle label="Morgen besser machen" checked={settings.improveEnabled} onClick={() => toggleSetting("improveEnabled")} />
          <SettingToggle label="Freie Notiz" checked={settings.noteEnabled} onClick={() => toggleSetting("noteEnabled")} />
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Datum
            </p>
            <h2 className="mt-2 text-2xl font-black">Eintrag bearbeiten</h2>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        {settings.morningEnabled && (
          <section className="rounded-[2rem] bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Morgen
            </p>
            <h2 className="mt-2 text-2xl font-black">🌅 Morgen-Check-in</h2>

            <div className="mt-5 space-y-4">
              {settings.moodEnabled && (
                <SelectMood value={morningMood} onChange={setMorningMood} />
              )}

              {settings.focusEnabled && (
                <TextArea
                  label="Was ist heute am wichtigsten?"
                  value={morningFocus}
                  onChange={setMorningFocus}
                />
              )}

              {settings.noteEnabled && (
                <TextArea
                  label="Notiz"
                  value={morningNote}
                  onChange={setMorningNote}
                />
              )}

              <button
                onClick={saveMorning}
                className="rounded-2xl bg-black px-5 py-3 font-semibold text-white"
              >
                Morgen speichern
              </button>
            </div>
          </section>
        )}

        {settings.eveningEnabled && (
          <section className="rounded-[2rem] bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Abend
            </p>
            <h2 className="mt-2 text-2xl font-black">🌙 Abend-Reflexion</h2>

            <div className="mt-5 space-y-4">
              {settings.moodEnabled && (
                <SelectMood value={eveningMood} onChange={setEveningMood} />
              )}

              {settings.winEnabled && (
                <TextArea
                  label="Was lief heute gut?"
                  value={eveningWin}
                  onChange={setEveningWin}
                />
              )}

              {settings.improveEnabled && (
                <TextArea
                  label="Was möchtest du morgen besser machen?"
                  value={eveningImprove}
                  onChange={setEveningImprove}
                />
              )}

              {settings.noteEnabled && (
                <TextArea
                  label="Notiz"
                  value={eveningNote}
                  onChange={setEveningNote}
                />
              )}

              <button
                onClick={saveEvening}
                className="rounded-2xl bg-black px-5 py-3 font-semibold text-white"
              >
                Abend speichern
              </button>
            </div>
          </section>
        )}
      </section>

      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-md">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Archiv
        </p>
        <h2 className="mt-2 text-2xl font-black">Vergangene Einträge</h2>

        <div className="mt-5 space-y-3">
          {sortedEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
              Noch keine Journal-Einträge vorhanden.
            </div>
          ) : (
            sortedEntries.map((entry, index) => (
              <div key={`${entry.date}-${entry.type}-${index}`} className="rounded-2xl bg-neutral-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <button
                    onClick={() => setSelectedDate(entry.date)}
                    className="text-left"
                  >
                    <p className="font-black">
                      {entry.type === "morning" ? "🌅 Morgen" : "🌙 Abend"} ·{" "}
                      {entry.date}
                    </p>

                    <p className="mt-1 text-sm text-neutral-400">
                      Stimmung: {entry.mood}
                    </p>

                    {entry.focus && (
                      <p className="mt-2 text-sm text-neutral-600">
                        Fokus: {entry.focus}
                      </p>
                    )}

                    {entry.win && (
                      <p className="mt-2 text-sm text-neutral-600">
                        Win: {entry.win}
                      </p>
                    )}
                  </button>

                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="rounded-xl bg-white px-3 py-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-md">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{title}</p>
      <h2 className="mt-3 text-3xl font-black">{value}</h2>
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-4 text-left font-semibold ${
        checked ? "bg-black text-white" : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {checked ? "✓ " : ""}
      {label}
    </button>
  );
}

function SelectMood({
  value,
  onChange,
}: {
  value: Mood;
  onChange: (value: Mood) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">Stimmung</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Mood)}
        className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3"
      >
        {moods.map((mood) => (
          <option key={mood}>{mood}</option>
        ))}
      </select>
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500"
      />
    </div>
  );
}
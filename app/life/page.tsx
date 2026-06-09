"use client";

import { useEffect, useState } from "react";

type LifeArea = {
  id: number;
  title: string;
  value: number;
  description: string;
};

const initialLifeAreas: LifeArea[] = [
  {
    id: 1,
    title: "Business",
    value: 50,
    description: "Karriere & Einkommen",
  },
  {
    id: 2,
    title: "Finanzen",
    value: 50,
    description: "Geld & Vermögen",
  },
  {
    id: 3,
    title: "Fitness",
    value: 50,
    description: "Körper & Gesundheit",
  },
  {
    id: 4,
    title: "Ernährung",
    value: 50,
    description: "Essen & Energie",
  },
];

export default function LifePage() {
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);

  // 🔥 Reset + korrekt laden
  useEffect(() => {
    localStorage.removeItem("lifeAreas"); // löscht alte Daten

    const saved = localStorage.getItem("lifeAreas");

    if (saved) {
      setLifeAreas(JSON.parse(saved));
    } else {
      setLifeAreas(initialLifeAreas);
    }
  }, []);

  // speichern
  useEffect(() => {
    localStorage.setItem("lifeAreas", JSON.stringify(lifeAreas));
  }, [lifeAreas]);

  function updateValue(id: number, value: number) {
    setLifeAreas(
      lifeAreas.map((area) =>
        area.id === id ? { ...area, value } : area
      )
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">Lebensbereiche</p>
        <h1 className="mt-2 text-5xl font-black">Life Balance</h1>
        <p className="mt-2 text-neutral-300">
          Behalte alle wichtigen Bereiche im Blick.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {lifeAreas.map((area) => (
          <div
            key={area.id}
            className="rounded-[1.75rem] bg-white p-5 shadow-md"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">{area.title}</h2>
                <p className="text-sm text-neutral-400">
                  {area.description}
                </p>
              </div>
              <span className="text-lg font-bold">
                {area.value}%
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={area.value}
              onChange={(e) =>
                updateValue(area.id, Number(e.target.value))
              }
              className="mt-4 w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
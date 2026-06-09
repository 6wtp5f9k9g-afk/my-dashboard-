"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved) {
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setDark(true);
      }
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      if (systemDark) {
        document.documentElement.classList.add("dark");
        setDark(true);
      }
    }
  }, []);

  function toggleTheme() {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }

    setDark(!dark);
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-xl bg-neutral-200 px-3 py-2 text-sm dark:bg-neutral-800"
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
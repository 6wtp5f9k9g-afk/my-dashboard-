"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Repeat,
  Calendar,
  BookOpen,
  Wallet,
} from "lucide-react";

const links = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/goals",
    label: "Ziele",
    icon: Target,
  },
  {
    href: "/tasks",
    label: "Aufgaben",
    icon: CheckSquare,
  },
  {
    href: "/routines",
    label: "Routinen",
    icon: Repeat,
  },
  {
    href: "/planner",
    label: "Planung",
    icon: Calendar,
  },
  {
    href: "/journal",
    label: "Journal",
    icon: BookOpen,
  },
  {
    href: "/budget",
    label: "Finanzen",
    icon: Wallet,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[2rem] bg-neutral-950 p-4 text-white shadow-2xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:p-5">
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-neutral-950">
          LS
        </div>

        <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Life System
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight">
          Dein System
        </h2>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-white text-neutral-950 shadow-lg"
                  : "text-neutral-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 hidden rounded-3xl bg-white/10 p-4 lg:block">
        <p className="text-sm font-semibold">
          Heute zählt Fortschritt.
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          Kleine Schritte. Jeden Tag.
        </p>
      </div>
    </aside>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Book,
  Repeat,
  Calendar,
  CalendarDays,
  Target,
  Activity,
  Wallet,
} from "lucide-react";

const sections = [
  {
    title: "Overview",
    links: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Tracking",
    links: [
      { href: "/journal", label: "Journal", icon: Book },
      { href: "/habits", label: "Habits", icon: Repeat },
    ],
  },
  {
    title: "Planung",
    links: [
      { href: "/planner", label: "Planner", icon: Calendar },
      { href: "/week", label: "Woche", icon: CalendarDays },
      { href: "/goals", label: "Ziele", icon: Target },
    ],
  },
  {
    title: "System",
    links: [
      { href: "/life", label: "Bereiche", icon: Activity },
      { href: "/budget", label: "Budget", icon: Wallet },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[2rem] bg-neutral-950 p-4 text-white shadow-2xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:p-5">
      <div className="mb-6 lg:mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-neutral-950">
          M
        </div>

        <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Life System
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight">
          Dashboard
        </h2>
      </div>

      <nav className="space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
              {section.title}
            </p>

            <div className="space-y-2">
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-white text-neutral-950 shadow-lg"
                        : "text-neutral-300 hover:bg-white/10 hover:text-white lg:hover:translate-x-1"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 hidden rounded-3xl bg-white/10 p-4 lg:block">
        <p className="text-sm font-semibold">Heute zählt Klarheit.</p>
        <p className="mt-1 text-xs text-neutral-400">
          Plane weniger, aber zieh es durch.
        </p>
      </div>
    </aside>
  );
}
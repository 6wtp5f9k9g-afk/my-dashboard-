import "./globals.css";
import Sidebar from "@/components/Sidebar";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-[#f4f1ea] text-neutral-950 dark:bg-neutral-900 dark:text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:gap-6 lg:p-6">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
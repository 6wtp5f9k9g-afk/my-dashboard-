"use client";

import { useEffect, useMemo, useState } from "react";

type EntryType = "income" | "expense";

type Frequency =
  | "once"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "half-yearly"
  | "yearly";

type Category =
  | "Einnahmen"
  | "Fixkosten"
  | "Variable Kosten"
  | "Lifestyle"
  | "Sparen"
  | "Sonstiges";

type Account = {
  id: number;
  name: string;
  startBalance: number;
};

type BudgetEntry = {
  id: number;
  title: string;
  amount: number;
  type: EntryType;
  frequency: Frequency;
  date: string;
  category: Category;
  paidDates?: string[];
  accountId: number;
};

type ManualBalance = {
  month: string;
  accountId: number;
  amount: number;
};

const categories: Category[] = [
  "Einnahmen",
  "Fixkosten",
  "Variable Kosten",
  "Lifestyle",
  "Sparen",
  "Sonstiges",
];

const frequencyLabels: Record<Frequency, string> = {
  once: "Einmalig",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
  quarterly: "Vierteljährlich",
  "half-yearly": "Halbjährlich",
  yearly: "Jährlich",
};

const categoryStyles: Record<Category, string> = {
  Einnahmen: "bg-green-100 text-green-700",
  Fixkosten: "bg-blue-100 text-blue-700",
  "Variable Kosten": "bg-yellow-100 text-yellow-800",
  Lifestyle: "bg-purple-100 text-purple-700",
  Sparen: "bg-emerald-100 text-emerald-700",
  Sonstiges: "bg-neutral-100 text-neutral-700",
};

const defaultAccounts: Account[] = [
  { id: 1, name: "Girokonto", startBalance: 0 },
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getMonthKey(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 7);
}

function addMonths(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + amount);
  return copy;
}

function generateMonths() {
  const today = new Date();
  const months: string[] = [];

  for (let i = -12; i <= 24; i++) {
    months.push(getMonthKey(addMonths(today, i)));
  }

  return months;
}

function getPreviousMonth(month: string) {
  const d = new Date(`${month}-01`);
  d.setMonth(d.getMonth() - 1);
  return getMonthKey(d);
}

function getNextDueDate(entry: BudgetEntry, selectedMonth: string) {
  const base = new Date(entry.date);

  if (entry.frequency === "once") return entry.date;

  const next = new Date(base);

  while (getMonthKey(next) < selectedMonth) {
    if (entry.frequency === "weekly") next.setDate(next.getDate() + 7);
    if (entry.frequency === "monthly") next.setMonth(next.getMonth() + 1);
    if (entry.frequency === "quarterly") next.setMonth(next.getMonth() + 3);
    if (entry.frequency === "half-yearly") next.setMonth(next.getMonth() + 6);
    if (entry.frequency === "yearly") next.setFullYear(next.getFullYear() + 1);
  }

  return next.toISOString().split("T")[0];
}

function appearsInMonth(entry: BudgetEntry, month: string) {
  if (entry.frequency === "once") {
    return getMonthKey(entry.date) === month;
  }

  const due = getNextDueDate(entry, month);
  return getMonthKey(due) === month;
}

export default function BudgetPage() {
  const today = getToday();

  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [manualBalances, setManualBalances] = useState<ManualBalance[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(today));
  const [selectedAccountId, setSelectedAccountId] = useState<number | "all">(
    "all"
  );
  const [isFlipped, setIsFlipped] = useState(false);

  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<EntryType>("expense");
  const [category, setCategory] = useState<Category>("Fixkosten");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [date, setDate] = useState(today);
  const [accountId, setAccountId] = useState(1);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);

  useEffect(() => {
    const savedAccounts = localStorage.getItem("budgetAccounts");
    const savedEntries = localStorage.getItem("budgetEntries");
    const savedBalances = localStorage.getItem("monthlyBalances");

    if (savedAccounts) {
      const parsedAccounts: Account[] = JSON.parse(savedAccounts);
      setAccounts(parsedAccounts.length > 0 ? parsedAccounts : defaultAccounts);
    } else {
      localStorage.setItem("budgetAccounts", JSON.stringify(defaultAccounts));
    }

    if (savedEntries) {
      const parsed: BudgetEntry[] = JSON.parse(savedEntries);

      const migrated = parsed.map((entry) => ({
        ...entry,
        accountId: entry.accountId ?? 1,
        paidDates: entry.paidDates ?? [],
      }));

      setEntries(migrated);
      localStorage.setItem("budgetEntries", JSON.stringify(migrated));
    }

    if (savedBalances) setManualBalances(JSON.parse(savedBalances));
  }, []);

  function saveAccounts(updated: Account[]) {
    setAccounts(updated);
    localStorage.setItem("budgetAccounts", JSON.stringify(updated));
  }

  function saveEntries(updated: BudgetEntry[]) {
    setEntries(updated);
    localStorage.setItem("budgetEntries", JSON.stringify(updated));
  }

  function saveBalances(updated: ManualBalance[]) {
    setManualBalances(updated);
    localStorage.setItem("monthlyBalances", JSON.stringify(updated));
  }

  function addAccount() {
    const trimmed = newAccountName.trim();
    if (!trimmed) return;

    const newAccount: Account = {
      id: Date.now(),
      name: trimmed,
      startBalance: Number(newAccountBalance) || 0,
    };

    saveAccounts([...accounts, newAccount]);
    setNewAccountName("");
    setNewAccountBalance("");
  }

  function deleteAccount(id: number) {
    if (accounts.length <= 1) return;

    const fallbackAccount = accounts.find((account) => account.id !== id);
    if (!fallbackAccount) return;

    const updatedAccounts = accounts.filter((account) => account.id !== id);

    const updatedEntries = entries.map((entry) =>
      entry.accountId === id
        ? { ...entry, accountId: fallbackAccount.id }
        : entry
    );

    const updatedBalances = manualBalances.filter(
      (balance) => balance.accountId !== id
    );

    saveAccounts(updatedAccounts);
    saveEntries(updatedEntries);
    saveBalances(updatedBalances);

    if (selectedAccountId === id) setSelectedAccountId("all");
    if (accountId === id) setAccountId(fallbackAccount.id);
  }

  function addEntry() {
    const trimmedTitle = title.trim();
    const numericAmount = Number(amount);

    if (!trimmedTitle || !numericAmount) return;

    if (editingEntryId) {
      const updatedEntries = entries.map((entry) =>
        entry.id === editingEntryId
          ? {
              ...entry,
              title: trimmedTitle,
              amount: numericAmount,
              type,
              frequency,
              date,
              category: type === "income" ? "Einnahmen" : category,
              accountId,
            }
          : entry
      );

      saveEntries(updatedEntries);
      setEditingEntryId(null);
    } else {
      const newEntry: BudgetEntry = {
        id: Date.now(),
        title: trimmedTitle,
        amount: numericAmount,
        type,
        frequency,
        date,
        category: type === "income" ? "Einnahmen" : category,
        paidDates: [],
        accountId,
      };

      saveEntries([newEntry, ...entries]);
    }

    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Fixkosten");
    setFrequency("monthly");
    setDate(today);
    setAccountId(accounts[0]?.id ?? 1);
  }

  function editEntry(entry: BudgetEntry) {
    setEditingEntryId(entry.id);
    setTitle(entry.title);
    setAmount(entry.amount.toString());
    setType(entry.type);
    setCategory(entry.category);
    setFrequency(entry.frequency);
    setDate(entry.date);
    setAccountId(entry.accountId);
  }

  function cancelEdit() {
    setEditingEntryId(null);
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Fixkosten");
    setFrequency("monthly");
    setDate(today);
    setAccountId(accounts[0]?.id ?? 1);
  }

  function deleteEntry(id: number) {
    saveEntries(entries.filter((entry) => entry.id !== id));
  }

  function togglePaid(entryId: number, paidDate: string) {
    const updated = entries.map((entry) => {
      if (entry.id !== entryId) return entry;

      const paidDates = entry.paidDates ?? [];
      const alreadyPaid = paidDates.includes(paidDate);

      return {
        ...entry,
        paidDates: alreadyPaid
          ? paidDates.filter((date) => date !== paidDate)
          : [...paidDates, paidDate],
      };
    });

    saveEntries(updated);
  }

  const months = useMemo(() => generateMonths(), []);

  const monthEntries = useMemo(() => {
    return entries
      .filter((entry) => appearsInMonth(entry, selectedMonth))
      .filter((entry) =>
        selectedAccountId === "all"
          ? true
          : entry.accountId === selectedAccountId
      )
      .sort((a, b) =>
        getNextDueDate(a, selectedMonth).localeCompare(
          getNextDueDate(b, selectedMonth)
        )
      );
  }, [entries, selectedMonth, selectedAccountId]);

  function getRelevantEntries(month: string, accountFilter: number | "all") {
    return entries
      .filter((entry) => appearsInMonth(entry, month))
      .filter((entry) =>
        accountFilter === "all" ? true : entry.accountId === accountFilter
      );
  }

  function getIncome(month: string, accountFilter: number | "all") {
    return getRelevantEntries(month, accountFilter)
      .filter((entry) => entry.type === "income")
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  function getExpenses(month: string, accountFilter: number | "all") {
    return getRelevantEntries(month, accountFilter)
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  function getManualBalance(month: string, currentAccountId: number) {
    return manualBalances.find(
      (balance) =>
        balance.month === month && balance.accountId === currentAccountId
    )?.amount;
  }

  function getStartBalanceForAccount(
    month: string,
    currentAccountId: number
  ): number {
    const manual = getManualBalance(month, currentAccountId);
    const account = accounts.find((item) => item.id === currentAccountId);

    if (manual !== undefined) return manual;

    const previousMonth = getPreviousMonth(month);

    if (!months.includes(previousMonth)) {
      return account?.startBalance ?? 0;
    }

    return getEndBalanceForAccount(previousMonth, currentAccountId);
  }

  function getEndBalanceForAccount(month: string, currentAccountId: number) {
    return (
      getStartBalanceForAccount(month, currentAccountId) +
      getIncome(month, currentAccountId) -
      getExpenses(month, currentAccountId)
    );
  }

  function getStartBalance(month: string, accountFilter: number | "all") {
    if (accountFilter !== "all") {
      return getStartBalanceForAccount(month, accountFilter);
    }

    return accounts.reduce(
      (sum, account) => sum + getStartBalanceForAccount(month, account.id),
      0
    );
  }

  function getEndBalance(month: string, accountFilter: number | "all") {
    if (accountFilter !== "all") {
      return getEndBalanceForAccount(month, accountFilter);
    }

    return accounts.reduce(
      (sum, account) => sum + getEndBalanceForAccount(month, account.id),
      0
    );
  }

  function getAccountName(id: number) {
    return accounts.find((account) => account.id === id)?.name ?? "Konto";
  }

  const startBalance = getStartBalance(selectedMonth, selectedAccountId);
  const income = getIncome(selectedMonth, selectedAccountId);
  const expenses = getExpenses(selectedMonth, selectedAccountId);
  const monthResult = income - expenses;
  const endBalance = getEndBalance(selectedMonth, selectedAccountId);

  const budgetPercentage =
    income > 0
      ? Math.max(0, Math.min(100, Math.round((endBalance / income) * 100)))
      : 0;

  const budgetColor =
    budgetPercentage > 60
      ? "bg-green-500"
      : budgetPercentage > 30
      ? "bg-yellow-500"
      : "bg-red-500";

  const totalWealth = accounts.reduce(
    (sum, account) => sum + getEndBalanceForAccount(selectedMonth, account.id),
    0
  );

  const expensesByCategory = useMemo(() => {
    const result: Record<string, number> = {};

    monthEntries
      .filter((entry) => entry.type === "expense")
      .forEach((entry) => {
        result[entry.category] = (result[entry.category] || 0) + entry.amount;
      });

    return result;
  }, [monthEntries]);

  const openDueCount = monthEntries.filter((entry) => {
    const due = getNextDueDate(entry, selectedMonth);
    const isAutoPaid = due <= today;
    const paidDates = entry.paidDates ?? [];
    const isManuallyChanged = paidDates.includes(due);
    const isPaid = isAutoPaid !== isManuallyChanged;

    return !isPaid;
  }).length;

  const fixkosten = expensesByCategory["Fixkosten"] ?? 0;
  const lifestyle = expensesByCategory["Lifestyle"] ?? 0;

  const fixkostenPercent =
    income > 0 ? Math.round((fixkosten / income) * 100) : 0;

  const lifestylePercent =
    expenses > 0 ? Math.round((lifestyle / expenses) * 100) : 0;

  const budgetInsights = [
    {
      priority: endBalance < 0 ? "danger" : "good",
      text:
        endBalance < 0
          ? "Dein Endkontostand ist negativ. Prüfe deine Ausgaben."
          : "Dein Endkontostand ist positiv.",
    },
    {
      priority: income === 0 ? "warning" : "good",
      text:
        income === 0
          ? "Für diesen Monat sind noch keine Einnahmen eingetragen."
          : "Einnahmen sind für diesen Monat vorhanden.",
    },
    {
      priority: expenses > income ? "danger" : "good",
      text:
        expenses > income
          ? "Deine Ausgaben sind höher als deine Einnahmen."
          : "Deine Ausgaben liegen unter deinen Einnahmen.",
    },
    {
      priority: fixkostenPercent >= 60 ? "warning" : "normal",
      text:
        fixkostenPercent >= 60
          ? `Fixkosten sind hoch: ${fixkostenPercent}% deiner Einnahmen.`
          : `Fixkosten: ${fixkostenPercent}% deiner Einnahmen.`,
    },
    {
      priority: lifestylePercent >= 30 ? "warning" : "normal",
      text:
        lifestylePercent >= 30
          ? `Lifestyle-Ausgaben sind auffällig: ${lifestylePercent}% deiner Ausgaben.`
          : `Lifestyle-Anteil: ${lifestylePercent}% deiner Ausgaben.`,
    },
    {
      priority: openDueCount > 0 ? "warning" : "good",
      text:
        openDueCount > 0
          ? `${openDueCount} Fälligkeit(en) sind noch offen.`
          : "Alle Fälligkeiten sind bezahlt oder automatisch erledigt.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">Budget</p>
        <h1 className="mt-2 text-5xl font-black">Money Cockpit</h1>
        <p className="mt-2 text-neutral-300">
          Konten, Monatsübertrag, Kategorien und Fälligkeiten.
        </p>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        {accounts.length > 1 && (
          <select
            value={selectedAccountId}
            onChange={(e) =>
              setSelectedAccountId(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-3"
          >
            <option value="all">Alle Konten</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => setSelectedMonth(getMonthKey(today))}
          className="rounded-2xl bg-neutral-100 px-4 py-3 font-semibold transition hover:bg-neutral-200"
        >
          Aktueller Monat
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {accounts.map((account) => {
          const accountEnd = getEndBalanceForAccount(selectedMonth, account.id);

          return (
            <button
              key={account.id}
              onClick={() => setSelectedAccountId(account.id)}
              className={`rounded-[1.75rem] p-5 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${
                selectedAccountId === account.id ? "bg-black text-white" : "bg-white"
              }`}
            >
              <p
                className={`text-sm ${
                  selectedAccountId === account.id
                    ? "text-neutral-300"
                    : "text-neutral-400"
                }`}
              >
                Konto
              </p>
              <h3 className="mt-2 text-xl font-black">{account.name}</h3>
              <p className="mt-3 text-2xl font-black">{accountEnd.toFixed(2)} €</p>
            </button>
          );
        })}

        {accounts.length > 1 && (
          <button
            onClick={() => setSelectedAccountId("all")}
            className={`rounded-[1.75rem] p-5 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${
              selectedAccountId === "all" ? "bg-black text-white" : "bg-white"
            }`}
          >
            <p
              className={`text-sm ${
                selectedAccountId === "all"
                  ? "text-neutral-300"
                  : "text-neutral-400"
              }`}
            >
              Gesamt
            </p>
            <h3 className="mt-2 text-xl font-black">Alle Konten</h3>
            <p className="mt-3 text-2xl font-black">{totalWealth.toFixed(2)} €</p>
          </button>
        )}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Verfügbares Budget
        </p>

        <div className="mt-2 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black">{endBalance.toFixed(2)} €</h2>
            <p className="text-sm text-neutral-500">
              Noch verfügbar in diesem Monat
            </p>
          </div>

          <p className="text-xl font-black">{budgetPercentage}%</p>
        </div>

        <div className="mt-5 h-5 rounded-full bg-neutral-200">
          <div
            className={`h-5 rounded-full transition-all ${budgetColor}`}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Budget Insights
        </p>
        <h2 className="mt-2 text-2xl font-black">Finanz-Check</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {budgetInsights.map((insight) => (
            <div
              key={insight.text}
              className={`rounded-2xl p-4 ${
                insight.priority === "danger"
                  ? "bg-red-50"
                  : insight.priority === "warning"
                  ? "bg-yellow-50"
                  : insight.priority === "good"
                  ? "bg-green-50"
                  : "bg-neutral-50"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  insight.priority === "danger"
                    ? "text-red-700"
                    : insight.priority === "warning"
                    ? "text-yellow-800"
                    : insight.priority === "good"
                    ? "text-green-700"
                    : "text-neutral-700"
                }`}
              >
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer rounded-[2rem] bg-white p-6 shadow-md transition hover:shadow-lg"
      >
        {!isFlipped ? (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Cockpit
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Überblick {selectedMonth}
                </h2>
              </div>

              <p className="text-sm text-neutral-400">Klicken zum Drehen</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-5">
              <div className="rounded-2xl bg-neutral-100 p-5">
                <p className="text-sm text-neutral-600">Start</p>
                <h3 className="mt-2 text-2xl font-black">
                  {startBalance.toFixed(2)} €
                </h3>
              </div>

              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-sm text-green-700">Einnahmen</p>
                <h3 className="mt-2 text-2xl font-black">
                  {income.toFixed(2)} €
                </h3>
              </div>

              <div className="rounded-2xl bg-red-50 p-5">
                <p className="text-sm text-red-700">Ausgaben</p>
                <h3 className="mt-2 text-2xl font-black">
                  {expenses.toFixed(2)} €
                </h3>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-sm text-blue-700">Monatssaldo</p>
                <h3 className="mt-2 text-2xl font-black">
                  {monthResult.toFixed(2)} €
                </h3>
              </div>

              <div
                className={`rounded-2xl p-5 ${
                  endBalance < 0 ? "bg-red-100" : "bg-black text-white"
                }`}
              >
                <p className="text-sm opacity-70">Ende</p>
                <h3 className="mt-2 text-2xl font-black">
                  {endBalance.toFixed(2)} €
                </h3>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Kategorien
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Ausgaben nach Kategorie
                </h2>
              </div>

              <p className="text-sm text-neutral-400">Klicken zum Drehen</p>
            </div>

            <div className="mt-6 space-y-4">
              {Object.entries(expensesByCategory).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
                  Keine Ausgaben in diesem Monat.
                </div>
              ) : (
                Object.entries(expensesByCategory).map(([cat, value]) => {
                  const percent =
                    expenses > 0 ? Math.round((value / expenses) * 100) : 0;

                  return (
                    <div key={cat}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{cat}</span>
                        <span>
                          {value.toFixed(2)} € · {percent}%
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-neutral-200">
                        <div
                          className="h-3 rounded-full bg-black"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">Konto hinzufügen</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="z. B. Tagesgeld, Bargeld, Kreditkarte"
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          />

          <input
            type="number"
            value={newAccountBalance}
            onChange={(e) => setNewAccountBalance(e.target.value)}
            placeholder="Startkontostand"
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          />

          <button
            onClick={addAccount}
            className="rounded-2xl bg-black px-5 py-3 font-semibold text-white"
          >
            Konto hinzufügen
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4"
            >
              <div>
                <p className="font-semibold">{account.name}</p>
                <p className="text-sm text-neutral-400">
                  Start: {account.startBalance.toFixed(2)} €
                </p>
              </div>

              <button
                onClick={() => deleteAccount(account.id)}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-neutral-400 transition hover:text-black"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">
          {editingEntryId ? "Eintrag bearbeiten" : "Neuer Eintrag"}
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name, z. B. Netflix"
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          />

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Betrag"
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          />

          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as EntryType;
              setType(newType);
              setCategory(newType === "income" ? "Einnahmen" : "Fixkosten");
            }}
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          >
            <option value="expense">Ausgabe</option>
            <option value="income">Einnahme</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            disabled={type === "income"}
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          >
            {categories
              .filter((cat) =>
                type === "income" ? cat === "Einnahmen" : cat !== "Einnahmen"
              )
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>

          <select
            value={accountId}
            onChange={(e) => setAccountId(Number(e.target.value))}
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          >
            {Object.entries(frequencyLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl border border-neutral-200 px-4 py-3"
          />

          <button
            onClick={addEntry}
            className="rounded-2xl bg-black px-5 py-3 font-semibold text-white transition hover:scale-105 active:scale-95"
          >
            {editingEntryId ? "Speichern" : "Hinzufügen"}
          </button>
        </div>

        {editingEntryId && (
          <button
            onClick={cancelEdit}
            className="mt-3 rounded-2xl bg-neutral-100 px-5 py-3 font-semibold text-neutral-500 transition hover:text-black"
          >
            Bearbeiten abbrechen
          </button>
        )}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">Fälligkeiten</h2>

        <div className="mt-5 space-y-3">
          {monthEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
              Keine Einträge für diesen Monat.
            </div>
          ) : (
            monthEntries.map((entry) => {
              const due = getNextDueDate(entry, selectedMonth);
              const isAutoPaid = due <= today;
              const paidDates = entry.paidDates ?? [];
              const isManuallyChanged = paidDates.includes(due);
              const isPaid = isAutoPaid !== isManuallyChanged;

              return (
                <div
                  key={`${entry.id}-${due}`}
                  className="flex flex-col gap-3 rounded-2xl bg-neutral-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{entry.title}</p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          categoryStyles[entry.category]
                        }`}
                      >
                        {entry.category}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-500">
                        {frequencyLabels[entry.frequency]}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-500">
                        {getAccountName(entry.accountId)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-neutral-400">
                      Fällig: {due} · {entry.amount.toFixed(2)} €
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => togglePaid(entry.id, due)}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                        isPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isPaid ? "✅ bezahlt" : "⏳ offen"}
                    </button>

                    <button
                      onClick={() => editEntry(entry)}
                      className="rounded-2xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700"
                    >
                      Bearbeiten
                    </button>

                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-neutral-400 transition hover:text-black"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
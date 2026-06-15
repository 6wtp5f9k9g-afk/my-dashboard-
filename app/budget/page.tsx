"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category: string;
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<Transaction["type"]>("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getToday());

  useEffect(() => {
    const saved = localStorage.getItem("financeTransactions");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  function saveTransactions(updated: Transaction[]) {
    setTransactions(updated);
    localStorage.setItem("financeTransactions", JSON.stringify(updated));
  }

  function addTransaction() {
    if (!title.trim() || !amount) return;

    const newTransaction: Transaction = {
      id: Date.now(),
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category || "Sonstiges",
      date,
    };

    saveTransactions([newTransaction, ...transactions]);

    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("");
    setDate(getToday());
  }

  function deleteTransaction(id: number) {
    saveTransactions(transactions.filter((item) => item.id !== id));
  }

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expenses;

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
        <p className="text-sm text-neutral-400">Life System</p>
        <h1 className="mt-2 text-5xl font-black">💰 Finanzen</h1>
        <p className="mt-3 text-neutral-300">
          Einnahmen, Ausgaben und dein aktueller Überblick.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoCard title="Einnahmen" value={`${income.toFixed(2)} €`} />
        <InfoCard title="Ausgaben" value={`${expenses.toFixed(2)} €`} />
        <InfoCard title="Saldo" value={`${balance.toFixed(2)} €`} />
      </section>

      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">Neue Buchung</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name, z. B. Gehalt, Miete, Rewe"
            className="rounded-2xl border p-3"
          />

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Betrag"
            className="rounded-2xl border p-3"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as Transaction["type"])}
            className="rounded-2xl border p-3"
          >
            <option value="expense">Ausgabe</option>
            <option value="income">Einnahme</option>
          </select>

          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Kategorie, z. B. Lebensmittel"
            className="rounded-2xl border p-3"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl border p-3"
          />

          <button
            onClick={addTransaction}
            className="rounded-2xl bg-black p-3 font-semibold text-white"
          >
            Buchung hinzufügen
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-md">
        <h2 className="text-2xl font-black">Buchungen</h2>

        <div className="mt-5 space-y-3">
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
              Noch keine Buchungen vorhanden.
            </div>
          ) : (
            transactions.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4"
              >
                <div>
                  <p className="font-black">{item.title}</p>
                  <p className="text-sm text-neutral-400">
                    {item.category} · {item.date}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p
                    className={`font-black ${
                      item.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {item.amount.toFixed(2)} €
                  </p>

                  <button
                    onClick={() => deleteTransaction(item.id)}
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
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        {title}
      </p>
      <h2 className="mt-3 text-3xl font-black">{value}</h2>
    </div>
  );
}
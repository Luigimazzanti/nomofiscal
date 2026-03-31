"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DailyLogTable } from "@/components/nomofiscal/daily-log-table";
import { useNomoFiscalStore } from "@/hooks/use-nomofiscal-store";

export default function ReportsPage() {
  const { store } = useNomoFiscalStore();
  const [period, setPeriod] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [client, setClient] = useState("all");

  const filteredEntries = useMemo(() => {
    return store.entries.filter((entry) => {
      const periodOk = period === "all" || entry.date.slice(0, 7) === period;
      const startOk = !startDate || entry.date >= startDate;
      const endOk = !endDate || entry.date <= endDate;
      const clientOk = client === "all" || entry.client === client;
      return periodOk && startOk && endOk && clientOk;
    });
  }, [client, endDate, period, startDate, store.entries]);

  const periodOptions = useMemo(
    () =>
      Array.from(new Set(store.entries.map((entry) => entry.date.slice(0, 7)))).sort((a, b) =>
        b.localeCompare(a)
      ),
    [store.entries]
  );

  const clientOptions = useMemo(
    () => Array.from(new Set(store.entries.map((entry) => entry.client))).sort(),
    [store.entries]
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <label className="text-sm font-medium text-slate-600">Periodo</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">Todos</option>
              {periodOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <label className="text-sm font-medium text-slate-600">Fecha Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <label className="text-sm font-medium text-slate-600">Fecha Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <label className="text-sm font-medium text-slate-600">Cliente</label>
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">Todos</option>
              {clientOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      <DailyLogTable entries={filteredEntries} />
    </section>
  );
}

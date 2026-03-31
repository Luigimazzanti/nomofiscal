"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { DollarSign, Euro, Files, Users } from "lucide-react";
import { DailyLogTable } from "@/components/nomofiscal/daily-log-table";
import { SummaryCard } from "@/components/nomofiscal/summary-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNomoFiscalStore } from "@/hooks/use-nomofiscal-store";
import type { DailyEntry } from "@/types/nomofiscal";

function formatCurrency(value: number, currency: "GBP" | "EUR") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DailyLogPage() {
  const { store, addEntry, updateEntry, deleteEntry, closePeriod } = useNomoFiscalStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DailyEntry | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    client: "",
    service: "",
    qty: 1,
    price: 0,
    discount: 0,
  });
  const [closeForm, setCloseForm] = useState({
    label: "PERIODO ACTUAL",
    startDate: "",
    endDate: "",
  });

  const totalGbp = store.entries.reduce((acc, item) => acc + item.subtotalGbp, 0);
  const totalEur = store.entries.reduce((acc, item) => acc + item.subtotalEur, 0);
  const totalEntries = store.entries.length;
  const activeClients = new Set(store.entries.map((entry) => entry.client)).size;

  const clientOptions = useMemo(() => store.clients.map((c) => c.companyName), [store.clients]);
  const serviceOptions = useMemo(() => store.services.map((s) => s.name), [store.services]);

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7856/ingest/38a7fdbf-23ef-4eba-be79-e9824cf9b81c", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "e66cdf",
      },
      body: JSON.stringify({
        sessionId: "e66cdf",
        runId: "pre-fix-1",
        hypothesisId: "H2",
        location: "daily-log/page.tsx:48",
        message: "DailyLog initial date state and locale",
        data: {
          formDate: form.date,
          nowIso: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.client || !form.service) return;
    if (editing) {
      await updateEntry(editing.id, form);
    } else {
      await addEntry(form);
    }
    setOpen(false);
    setEditing(null);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      client: clientOptions[0] ?? "",
      service: serviceOptions[0] ?? "",
      qty: 1,
      price: 0,
      discount: 0,
    });
    setOpen(true);
  };

  const startEdit = (entry: DailyEntry) => {
    setEditing(entry);
    setForm({
      date: entry.date,
      client: entry.client,
      service: entry.service,
      qty: entry.qty,
      price: entry.price,
      discount: entry.discount,
    });
    setOpen(true);
  };

  const closeCurrentPeriod = async () => {
    await closePeriod(closeForm.label, closeForm.startDate, closeForm.endDate);
    setCloseOpen(false);
  };

  return (
    <section className="space-y-5 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Log</h1>
          <p className="text-sm text-slate-500">
            Control diario de servicios freelance con doble moneda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setCloseOpen(true)}>
            Cerrar Periodo
          </Button>
          <Button onClick={startCreate}>+ New Entry</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Revenue (GBP)"
          value={formatCurrency(totalGbp, "GBP")}
          accent="mint"
          icon={DollarSign}
        />
        <SummaryCard
          title="Total Revenue (EUR)"
          value={formatCurrency(totalEur, "EUR")}
          accent="sky"
          icon={Euro}
        />
        <SummaryCard
          title="Total Entries"
          value={String(totalEntries)}
          accent="violet"
          icon={Files}
        />
        <SummaryCard
          title="Active Clients"
          value={String(activeClients)}
          accent="orange"
          icon={Users}
        />
      </div>

      <DailyLogTable entries={store.entries} onEdit={startEdit} onDelete={deleteEntry} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Entry" : "Nuevo Entry"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={onSubmit}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
            />
            <select
              value={form.client}
              onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
            >
              {clientOptions.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <select
              value={form.service}
              onChange={(e) => setForm((prev) => ({ ...prev, service: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
            >
              {serviceOptions.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="number"
                min={1}
                value={form.qty}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, qty: Number(e.target.value || 0) }))
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                placeholder="Qty"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: Number(e.target.value || 0) }))
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                placeholder="Price GBP"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.discount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, discount: Number(e.target.value || 0) }))
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                placeholder="Discount"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editing ? "Guardar cambios" : "Crear entry"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar periodo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              value={closeForm.label}
              onChange={(e) => setCloseForm((prev) => ({ ...prev, label: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              placeholder="Etiqueta (ej: MARZO 2026)"
            />
            <input
              type="date"
              value={closeForm.startDate}
              onChange={(e) =>
                setCloseForm((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              type="date"
              value={closeForm.endDate}
              onChange={(e) => setCloseForm((prev) => ({ ...prev, endDate: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setCloseOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={closeCurrentPeriod}>Confirmar cierre</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

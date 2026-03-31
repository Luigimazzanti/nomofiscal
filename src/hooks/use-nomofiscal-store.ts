"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Client, ClosedPeriod, DailyEntry, Service } from "@/types/nomofiscal";

interface NomoFiscalStore {
  entries: DailyEntry[];
  clients: Client[];
  services: Service[];
  periods: ClosedPeriod[];
}

export function useNomoFiscalStore() {
  const [store, setStore] = useState<NomoFiscalStore>({
    entries: [],
    clients: [],
    services: [],
    periods: [],
  });

  const refresh = useCallback(async () => {
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
        hypothesisId: "H3",
        location: "use-nomofiscal-store.ts:18",
        message: "Refresh start with empty initial store",
        data: { phase: "start" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const [entries, clients, services, periods] = await Promise.all([
      fetch("/api/entries").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/periods").then((r) => r.json()),
    ]);

    setStore({ entries, clients, services, periods });
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
        hypothesisId: "H3",
        location: "use-nomofiscal-store.ts:45",
        message: "Refresh end with API data",
        data: {
          entriesLen: entries.length,
          clientsLen: clients.length,
          servicesLen: services.length,
          periodsLen: periods.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const api = useMemo(
    () => ({
      store,
      addClient: async (companyName: string) => {
        await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyName }),
        });
        await refresh();
      },
      updateClient: async (id: string, companyName: string) => {
        await fetch(`/api/clients/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyName }),
        });
        await refresh();
      },
      deleteClient: async (id: string) => {
        await fetch(`/api/clients/${id}`, { method: "DELETE" });
        await refresh();
      },
      addService: async (name: string, basePrice: number) => {
        await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, basePrice }),
        });
        await refresh();
      },
      updateService: async (id: string, name: string, basePrice: number) => {
        await fetch(`/api/services/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, basePrice }),
        });
        await refresh();
      },
      deleteService: async (id: string) => {
        await fetch(`/api/services/${id}`, { method: "DELETE" });
        await refresh();
      },
      addEntry: async (payload: Omit<DailyEntry, "id" | "subtotalGbp" | "subtotalEur">) => {
        await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await refresh();
      },
      updateEntry: async (
        id: string,
        payload: Omit<DailyEntry, "id" | "subtotalGbp" | "subtotalEur">
      ) => {
        await fetch(`/api/entries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await refresh();
      },
      deleteEntry: async (id: string) => {
        await fetch(`/api/entries/${id}`, { method: "DELETE" });
        await refresh();
      },
      closePeriod: async (label: string, startDate: string, endDate: string) => {
        await fetch("/api/periods/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label, startDate, endDate }),
        });
        await refresh();
      },
      deletePeriod: async (id: string) => {
        await fetch(`/api/periods/${id}`, { method: "DELETE" });
        await refresh();
      },
    }),
    [refresh, store]
  );

  return api;
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNomoFiscalStore } from "@/hooks/use-nomofiscal-store";

function money(value: number, currency: "GBP" | "EUR") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PeriodosPage() {
  const { store, deletePeriod } = useNomoFiscalStore();

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Periodos Cerrados</h1>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {store.periods.map((period) => (
          <Card key={period.id} className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-base text-slate-900">{period.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-5 text-sm text-slate-600">
              <p>
                <strong>Inicio:</strong> {period.startDate}
              </p>
              <p>
                <strong>Fin:</strong> {period.endDate}
              </p>
              <p>
                <strong>Servicios:</strong> {period.serviceCount}
              </p>
              <p>
                <strong>Total GBP:</strong> {money(period.totalGbp, "GBP")}
              </p>
              <p>
                <strong>Total EUR:</strong> {money(period.totalEur, "EUR")}
              </p>
              <p>
                <strong>Cierre:</strong> {period.closedAt}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary">Editar Entries</Button>
                <Button variant="danger" onClick={async () => deletePeriod(period.id)}>
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

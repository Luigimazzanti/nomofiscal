import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TD,
  TH,
} from "@/components/ui/table";
import type { DailyEntry } from "@/types/nomofiscal";

function formatCurrency(value: number, currency: "GBP" | "EUR") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function DailyLogTable({
  entries,
  onEdit,
  onDelete,
}: {
  entries: DailyEntry[];
  onEdit?: (entry: DailyEntry) => void;
  onDelete?: (entryId: string) => void;
}) {
  return (
    <Card className="p-2 sm:p-3">
      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              <TH>Date</TH>
              <TH>Client</TH>
              <TH>Service</TH>
              <TH>Qty</TH>
              <TH>Price</TH>
              <TH>Discount</TH>
              <TH>Subtotal (£)</TH>
              <TH>Subtotal (€)</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50/70">
                <TD>{entry.date}</TD>
                <TD className="font-medium text-slate-900">{entry.client}</TD>
                <TD>{entry.service}</TD>
                <TD>{entry.qty}</TD>
                <TD>{formatCurrency(entry.price, "GBP")}</TD>
                <TD>{entry.discount}%</TD>
                <TD>{formatCurrency(entry.subtotalGbp, "GBP")}</TD>
                <TD>{formatCurrency(entry.subtotalEur, "EUR")}</TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => onEdit?.(entry)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Eliminar"
                      onClick={() => onDelete?.(entry.id)}
                    >
                      <Trash2 size={16} className="text-rose-500" />
                    </Button>
                  </div>
                </TD>
              </tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

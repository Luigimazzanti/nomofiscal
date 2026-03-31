"use client";

import { type FormEvent, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNomoFiscalStore } from "@/hooks/use-nomofiscal-store";
import type { Service } from "@/types/nomofiscal";

function formatGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function ServicesPage() {
  const { store, addService, updateService, deleteService } = useNomoFiscalStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (editing) await updateService(editing.id, name.trim(), price);
    else await addService(name.trim(), price);
    setOpen(false);
    setEditing(null);
    setName("");
    setPrice(0);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Services</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setName("");
            setPrice(0);
            setOpen(true);
          }}
        >
          + New Service
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {store.services.map((service) => (
          <Card key={service.id}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{service.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Base Price: {formatGbp(service.basePrice)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar servicio"
                    onClick={() => {
                      setEditing(service);
                      setName(service.name);
                      setPrice(service.basePrice);
                      setOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar servicio"
                    onClick={async () => deleteService(service.id)}
                  >
                    <Trash2 size={16} className="text-rose-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={submit}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              placeholder="Nombre del servicio"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value || 0))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              placeholder="Precio base GBP"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editing ? "Guardar" : "Crear"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

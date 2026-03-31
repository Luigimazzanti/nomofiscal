"use client";

import { type FormEvent, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNomoFiscalStore } from "@/hooks/use-nomofiscal-store";
import type { Client } from "@/types/nomofiscal";

export default function ClientsPage() {
  const { store, addClient, updateClient, deleteClient } = useNomoFiscalStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [name, setName] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (editing) await updateClient(editing.id, name.trim());
    else await addClient(name.trim());
    setOpen(false);
    setName("");
    setEditing(null);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setName("");
            setOpen(true);
          }}
        >
          + New Client
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {store.clients.map((client) => (
          <Card key={client.id}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{client.companyName}</p>
                  <p className="mt-1 text-sm text-slate-500">Added: {client.createdAt}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar cliente"
                    onClick={() => {
                      setEditing(client);
                      setName(client.companyName);
                      setOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar cliente"
                    onClick={async () => deleteClient(client.id)}
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
            <DialogTitle>{editing ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={submit}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              placeholder="Nombre de empresa"
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

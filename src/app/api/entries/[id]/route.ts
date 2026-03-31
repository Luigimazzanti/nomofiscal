import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const EUR_RATE = 1.17;

const updateSchema = z.object({
  date: z.string().min(1),
  client: z.string().min(1),
  service: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.number().nonnegative(),
  discount: z.number().nonnegative(),
});

function computeTotals(price: number, qty: number, discount: number) {
  const subtotalGbp = Math.max(price * qty - discount, 0);
  const subtotalEur = subtotalGbp * EUR_RATE;
  return { subtotalGbp, subtotalEur };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const totals = computeTotals(
    parsed.data.price,
    parsed.data.qty,
    parsed.data.discount
  );

  const updated = await prisma.dailyEntry.update({
    where: { id },
    data: { ...parsed.data, ...totals },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.dailyEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDbSeeded } from "@/lib/db-seed";
import { prisma } from "@/lib/prisma";

const EUR_RATE = 1.17;

const baseSchema = z.object({
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

export async function GET() {
  await ensureDbSeeded();
  const data = await prisma.dailyEntry.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = baseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const totals = computeTotals(
    parsed.data.price,
    parsed.data.qty,
    parsed.data.discount
  );

  const created = await prisma.dailyEntry.create({
    data: { ...parsed.data, ...totals },
  });
  return NextResponse.json(created, { status: 201 });
}

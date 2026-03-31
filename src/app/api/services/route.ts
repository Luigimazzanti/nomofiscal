import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDbSeeded } from "@/lib/db-seed";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1),
  basePrice: z.number().nonnegative(),
});

export async function GET() {
  await ensureDbSeeded();
  const data = await prisma.service.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const created = await prisma.service.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}

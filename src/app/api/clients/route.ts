import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDbSeeded } from "@/lib/db-seed";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  companyName: z.string().min(1),
});

export async function GET() {
  await ensureDbSeeded();
  const data = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const created = await prisma.client.create({
    data: {
      companyName: parsed.data.companyName,
      createdAt: new Date().toISOString().slice(0, 10),
    },
  });

  return NextResponse.json(created, { status: 201 });
}

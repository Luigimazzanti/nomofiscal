import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const closeSchema = z.object({
  label: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = closeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const entries = await prisma.dailyEntry.findMany({
    where: { date: { gte: parsed.data.startDate, lte: parsed.data.endDate } },
  });
  if (entries.length === 0) {
    return NextResponse.json({ error: "No hay entries para ese rango" }, { status: 400 });
  }

  const totalGbp = entries.reduce((acc, item) => acc + item.subtotalGbp, 0);
  const totalEur = entries.reduce((acc, item) => acc + item.subtotalEur, 0);

  const created = await prisma.$transaction(async (tx) => {
    const period = await tx.closedPeriod.create({
      data: {
        label: parsed.data.label,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        serviceCount: entries.length,
        totalGbp,
        totalEur,
        closedAt: new Date().toISOString().slice(0, 10),
      },
    });

    await tx.dailyEntry.deleteMany({
      where: { date: { gte: parsed.data.startDate, lte: parsed.data.endDate } },
    });

    return period;
  });

  return NextResponse.json(created, { status: 201 });
}

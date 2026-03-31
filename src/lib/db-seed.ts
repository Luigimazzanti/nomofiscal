import { prisma } from "@/lib/prisma";
import { clients, closedPeriods, dailyEntries, services } from "@/lib/mock-data";

let seeded = false;

export async function ensureDbSeeded() {
  if (seeded) return;
  const count = await prisma.client.count();
  if (count > 0) {
    seeded = true;
    return;
  }

  await prisma.$transaction([
    prisma.client.createMany({ data: clients, skipDuplicates: true }),
    prisma.service.createMany({ data: services, skipDuplicates: true }),
    prisma.dailyEntry.createMany({ data: dailyEntries, skipDuplicates: true }),
    prisma.closedPeriod.createMany({ data: closedPeriods, skipDuplicates: true }),
  ]);

  seeded = true;
}

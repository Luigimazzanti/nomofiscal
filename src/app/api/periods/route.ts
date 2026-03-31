import { NextResponse } from "next/server";
import { ensureDbSeeded } from "@/lib/db-seed";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDbSeeded();
  const data = await prisma.closedPeriod.findMany({ orderBy: { closedAt: "desc" } });
  return NextResponse.json(data);
}

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
const EUR_RATE = 1.17;

const defaults = {
  clients: "C:/Users/luigg/Downloads/clients.csv",
  services: "C:/Users/luigg/Downloads/services.csv",
  periods: "C:/Users/luigg/Downloads/periodos (1).csv",
  reportsPdf: "C:/Users/luigg/Downloads/reports _ AutoCal Pro.pdf",
};

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}

function toIsoDateFromSlash(input) {
  const [d, m, y] = String(input).split("/");
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function toNumber(input) {
  return Number(String(input).replace(/[^\d.-]/g, "")) || 0;
}

async function importClients(filePath) {
  const rows = readCsv(filePath);
  let created = 0;
  for (const row of rows) {
    const companyName = String(row.Name).trim();
    const createdAt = toIsoDateFromSlash(row["Added Date"]);
    const exists = await prisma.client.findFirst({ where: { companyName } });
    if (!exists) {
      await prisma.client.create({ data: { companyName, createdAt } });
      created += 1;
    }
  }
  return { source: rows.length, created };
}

async function importServices(filePath) {
  const rows = readCsv(filePath);
  let created = 0;
  for (const row of rows) {
    const name = String(row.Name).trim();
    const basePrice = toNumber(row["Price (GBP)"]);
    const exists = await prisma.service.findFirst({ where: { name } });
    if (!exists) {
      await prisma.service.create({ data: { name, basePrice } });
      created += 1;
    }
  }
  return { source: rows.length, created };
}

async function importPeriods(filePath) {
  const rows = readCsv(filePath);
  let created = 0;
  for (const row of rows) {
    const label = String(row.Name).trim();
    const startDate = String(row["Start Date"]).trim();
    const endDate = String(row["End Date"]).trim();
    const serviceCount = toNumber(row.Services);
    const totalGbp = toNumber(row["Total GBP"]);
    const totalEur = toNumber(row["Total EUR"]);
    const exists = await prisma.closedPeriod.findFirst({
      where: { label, startDate, endDate },
    });
    if (!exists) {
      await prisma.closedPeriod.create({
        data: {
          label,
          startDate,
          endDate,
          serviceCount,
          totalGbp,
          totalEur,
          closedAt: endDate,
        },
      });
      created += 1;
    }
  }
  return { source: rows.length, created };
}

function extractEntriesFromPdfText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const dateRegex = /^(\d{2})\s([A-Za-z]{3})\s(\d{4})$/;
  const tailRegex = /(\d+)\s+£([\d.]+)\s+(\d+)%$/;
  const monthMap = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const entries = [];
  const ambiguos = [];
  let currentDate = null;

  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    if (dateMatch) {
      const [, d, mon, y] = dateMatch;
      const mm = monthMap[mon];
      if (mm) currentDate = `${y}-${mm}-${d}`;
      continue;
    }

    const tailMatch = line.match(tailRegex);
    if (!tailMatch || !currentDate) continue;
    const qty = Number(tailMatch[1]);
    const price = Number(tailMatch[2]);
    const discountPct = Number(tailMatch[3]);
    const prefix = line.slice(0, line.length - tailMatch[0].length).trim();

    // Heurística: en PDF la columna cliente/servicio puede venir rota.
    // Guardamos el texto completo para revisión manual posterior.
    if (!prefix) {
      ambiguos.push({ date: currentDate, raw: line });
      continue;
    }

    entries.push({
      date: currentDate,
      raw: prefix,
      qty,
      price,
      discount: discountPct,
    });
  }

  return { entries, ambiguos };
}

async function importEntriesFromPdf(filePath) {
  if (!fs.existsSync(filePath)) return { source: 0, created: 0, ambiguos: 0 };
  const parser = new PDFParse({ data: fs.readFileSync(filePath) });
  const textResult = await parser.getText();
  await parser.destroy();
  const { entries, ambiguos } = extractEntriesFromPdfText(textResult.text);

  let created = 0;
  for (const item of entries) {
    const subtotalGbp = Math.max(item.qty * item.price - item.qty * item.price * (item.discount / 100), 0);
    const subtotalEur = subtotalGbp * EUR_RATE;
    const exists = await prisma.dailyEntry.findFirst({
      where: {
        date: item.date,
        service: item.raw,
        qty: item.qty,
        price: item.price,
        discount: item.discount,
      },
    });
    if (!exists) {
      await prisma.dailyEntry.create({
        data: {
          date: item.date,
          client: "PENDING_FROM_PDF",
          service: item.raw,
          qty: item.qty,
          price: item.price,
          discount: item.discount,
          subtotalGbp,
          subtotalEur,
        },
      });
      created += 1;
    }
  }

  return { source: entries.length, created, ambiguos: ambiguos.length };
}

async function main() {
  const clientsPath = process.env.LEGACY_CLIENTS_CSV ?? defaults.clients;
  const servicesPath = process.env.LEGACY_SERVICES_CSV ?? defaults.services;
  const periodsPath = process.env.LEGACY_PERIODS_CSV ?? defaults.periods;
  const reportsPdfPath = process.env.LEGACY_REPORTS_PDF ?? defaults.reportsPdf;

  if (!fs.existsSync(clientsPath) || !fs.existsSync(servicesPath) || !fs.existsSync(periodsPath)) {
    throw new Error(
      "No se encontraron archivos CSV requeridos. Define LEGACY_CLIENTS_CSV, LEGACY_SERVICES_CSV y LEGACY_PERIODS_CSV."
    );
  }

  const summary = {
    clients: await importClients(clientsPath),
    services: await importServices(servicesPath),
    periods: await importPeriods(periodsPath),
    entriesPdf: await importEntriesFromPdf(reportsPdfPath),
  };

  const outDir = path.resolve("migration-output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "import-summary.json");
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), "utf-8");
  console.log("Import complete:", summary);
  console.log("Summary:", outPath);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

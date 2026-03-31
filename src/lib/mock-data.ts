import {
  type Client,
  type ClosedPeriod,
  type DailyEntry,
  type Service,
} from "@/types/nomofiscal";

export const dailyEntries: DailyEntry[] = [
  {
    id: "1",
    date: "2026-03-28",
    client: "Acme Studio",
    service: "UX Audit",
    qty: 1,
    price: 320,
    discount: 20,
    subtotalGbp: 300,
    subtotalEur: 351,
  },
  {
    id: "2",
    date: "2026-03-29",
    client: "BlueHarbor Ltd",
    service: "Landing Page",
    qty: 2,
    price: 180,
    discount: 0,
    subtotalGbp: 360,
    subtotalEur: 421.2,
  },
  {
    id: "3",
    date: "2026-03-30",
    client: "Northline Agency",
    service: "SEO Sprint",
    qty: 1,
    price: 250,
    discount: 10,
    subtotalGbp: 240,
    subtotalEur: 280.8,
  },
];

export const clients: Client[] = [
  { id: "c1", companyName: "Acme Studio", createdAt: "2026-01-05" },
  { id: "c2", companyName: "BlueHarbor Ltd", createdAt: "2026-02-11" },
  { id: "c3", companyName: "Northline Agency", createdAt: "2026-03-01" },
];

export const services: Service[] = [
  { id: "s1", name: "UX Audit", basePrice: 320 },
  { id: "s2", name: "Landing Page", basePrice: 180 },
  { id: "s3", name: "SEO Sprint", basePrice: 250 },
];

export const closedPeriods: ClosedPeriod[] = [
  {
    id: "p1",
    label: "MARZO 2026",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    serviceCount: 28,
    totalGbp: 6840,
    totalEur: 8002.8,
    closedAt: "2026-03-31",
  },
  {
    id: "p2",
    label: "FEBRERO 2026",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    serviceCount: 21,
    totalGbp: 5290,
    totalEur: 6189.3,
    closedAt: "2026-02-28",
  },
];

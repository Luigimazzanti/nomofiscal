export type CurrencyCode = "GBP" | "EUR";

export interface DailyEntry {
  id: string;
  date: string;
  client: string;
  service: string;
  qty: number;
  price: number;
  discount: number;
  subtotalGbp: number;
  subtotalEur: number;
}

export interface Client {
  id: string;
  companyName: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  basePrice: number;
}

export interface ClosedPeriod {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  serviceCount: number;
  totalGbp: number;
  totalEur: number;
  closedAt: string;
}

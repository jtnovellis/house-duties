import chalk from "chalk";
import { BillType, PaymentStatus } from "@prisma/client";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatBillType = (type: BillType): string => {
  const typeMap: Record<BillType, string> = {
    RENT: "Rent",
    ELECTRICITY: "Electricity",
    WATER: "Water",
    GAS: "Gas",
    INTERNET: "Internet",
    PHONE: "Phone",
    OTHER: "Other",
  };
  return typeMap[type];
};

export const formatPaymentStatus = (status: PaymentStatus): string => {
  const statusColors = {
    PAID: chalk.green("✓ Paid"),
    PENDING: chalk.yellow("○ Pending"),
    OVERDUE: chalk.red("✗ Overdue"),
  };
  return statusColors[status];
};

export const formatMonth = (date: Date): string => {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
  }).format(date);
};

export const formatPercentage = (value: number | null): string => {
  if (value === null) {
    return 'N/A';
  }

  // Format with 1 decimal place and % symbol
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);

  return formatted;
};

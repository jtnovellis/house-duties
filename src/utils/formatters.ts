import chalk from 'chalk';
import { BillType, PaymentStatus } from '@prisma/client';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatBillType = (type: BillType): string => {
  const typeMap: Record<BillType, string> = {
    RENT: 'Rent',
    ELECTRICITY: 'Electricity',
    WATER: 'Water',
    GAS: 'Gas',
    INTERNET: 'Internet',
    PHONE: 'Phone',
    OTHER: 'Other',
  };
  return typeMap[type];
};

export const formatPaymentStatus = (status: PaymentStatus): string => {
  const statusColors = {
    PAID: chalk.green('✓ Paid'),
    PENDING: chalk.yellow('○ Pending'),
    OVERDUE: chalk.red('✗ Overdue'),
  };
  return statusColors[status];
};

export const formatMonth = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
  }).format(date);
};

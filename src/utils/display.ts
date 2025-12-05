import Table from 'cli-table3';
import chalk from 'chalk';
import { Bill, Payment } from '@prisma/client';
import { formatCurrency, formatDate, formatBillType, formatPaymentStatus } from './formatters.js';

export const displayBills = (bills: Bill[]): void => {
  if (bills.length === 0) {
    console.log(chalk.yellow('\nNo bills found.'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Type'),
      chalk.cyan('Amount'),
      chalk.cyan('Due Day'),
      chalk.cyan('Status'),
    ],
    style: {
      head: [],
      border: ['grey'],
    },
  });

  bills.forEach((bill) => {
    table.push([
      bill.name,
      formatBillType(bill.type),
      formatCurrency(bill.amount),
      bill.dueDay.toString(),
      bill.active ? chalk.green('Active') : chalk.red('Inactive'),
    ]);
  });

  console.log('\n' + table.toString());
};

export const displayPayments = (
  payments: (Payment & { bill: Bill })[]
): void => {
  if (payments.length === 0) {
    console.log(chalk.yellow('\nNo payments found.'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('Bill'),
      chalk.cyan('Amount'),
      chalk.cyan('Due Date'),
      chalk.cyan('Status'),
      chalk.cyan('Paid Date'),
    ],
    style: {
      head: [],
      border: ['grey'],
    },
  });

  payments.forEach((payment) => {
    table.push([
      payment.bill.name,
      formatCurrency(payment.amount),
      formatDate(payment.dueDate),
      formatPaymentStatus(payment.status),
      payment.paidDate ? formatDate(payment.paidDate) : '-',
    ]);
  });

  console.log('\n' + table.toString());
};

export const displaySummary = (
  total: number,
  paid: number,
  pending: number,
  overdue: number
): void => {
  console.log(chalk.bold('\n=== Monthly Summary ==='));
  console.log(`Total Amount: ${chalk.cyan(formatCurrency(total))}`);
  console.log(`Paid: ${chalk.green(formatCurrency(paid))}`);
  console.log(`Pending: ${chalk.yellow(formatCurrency(pending))}`);
  console.log(`Overdue: ${chalk.red(formatCurrency(overdue))}`);
};

export const displaySuccess = (message: string): void => {
  console.log(chalk.green(`\n✓ ${message}`));
};

export const displayError = (message: string): void => {
  console.log(chalk.red(`\n✗ ${message}`));
};

export const displayInfo = (message: string): void => {
  console.log(chalk.blue(`\nℹ ${message}`));
};

export const displayWarning = (message: string): void => {
  console.log(chalk.yellow(`\n⚠ ${message}`));
};

import Table from 'cli-table3';
import chalk from 'chalk';
import { Bill, Payment } from '@prisma/client';
import { formatCurrency, formatDate, formatBillType, formatPaymentStatus, formatPercentage } from './formatters.js';
import { PaymentComparison, ComparisonMetric } from '../services/paymentService.js';

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

export const displayPaymentComparison = (comparison: PaymentComparison): void => {
  const { months, metrics } = comparison;

  // Build table headers
  const table = new Table({
    head: [
      chalk.cyan('Metric'),
      chalk.cyan(months[0].monthLabel),
      chalk.cyan(months[1].monthLabel),
      chalk.cyan(months[2].monthLabel),
      chalk.cyan('Change'),
      chalk.cyan('% Change'),
      chalk.cyan('Trend'),
    ],
    style: {
      head: [],
      border: ['grey'],
    },
    colWidths: [12, 16, 16, 16, 14, 12, 8],
  });

  // Helper function to format trend indicator
  const formatTrend = (trend: 'up' | 'down' | 'stable'): string => {
    if (trend === 'up') return chalk.red('↑');
    if (trend === 'down') return chalk.green('↓');
    return chalk.gray('→');
  };

  // Helper function to format change with color
  const formatChange = (
    change: number,
    trend: 'up' | 'down' | 'stable',
    isBadMetric: boolean
  ): string => {
    if (trend === 'stable') {
      return chalk.gray(formatCurrency(0));
    }

    const formatted = formatCurrency(Math.abs(change));
    const sign = change >= 0 ? '+' : '-';

    // For pending/overdue, decrease is good (green), increase is bad (red)
    // For total/paid, increase can be neutral (cyan)
    if (isBadMetric) {
      return change > 0 ? chalk.red(`${sign}${formatted}`) : chalk.green(`${sign}${formatted}`);
    } else {
      return chalk.cyan(`${sign}${formatted}`);
    }
  };

  // Helper function to format percentage change with color
  const formatPercentageChange = (
    percentageChange: number | null,
    trend: 'up' | 'down' | 'stable',
    isBadMetric: boolean
  ): string => {
    if (percentageChange === null) {
      return chalk.gray('N/A');
    }

    if (trend === 'stable') {
      return chalk.gray('0,0%');
    }

    const formatted = formatPercentage(Math.abs(percentageChange));
    const sign = percentageChange >= 0 ? '+' : '-';

    if (isBadMetric) {
      return percentageChange > 0
        ? chalk.red(`${sign}${formatted}`)
        : chalk.green(`${sign}${formatted}`);
    } else {
      return chalk.cyan(`${sign}${formatted}`);
    }
  };

  // Add rows for each metric
  const addMetricRow = (
    metric: ComparisonMetric,
    isBadMetric: boolean = false
  ): void => {
    table.push([
      metric.metricName,
      formatCurrency(metric.values[0]),
      formatCurrency(metric.values[1]),
      formatCurrency(metric.values[2]),
      formatChange(metric.change, metric.trend, isBadMetric),
      formatPercentageChange(metric.percentageChange, metric.trend, isBadMetric),
      formatTrend(metric.trend),
    ]);
  };

  addMetricRow(metrics.total, false);
  addMetricRow(metrics.paid, false);
  addMetricRow(metrics.pending, true);
  addMetricRow(metrics.overdue, true);

  console.log(chalk.bold('\n=== Payment Comparison (Last 3 Months) ==='));
  console.log('\n' + table.toString());

  // Add legend
  console.log(chalk.gray('\nLegend:'));
  console.log(chalk.gray('  ↑ = Increase  ↓ = Decrease  → = No change'));
  console.log(chalk.green('  Green') + chalk.gray(' = Favorable change'));
  console.log(chalk.red('  Red') + chalk.gray(' = Unfavorable change'));
  console.log(chalk.cyan('  Cyan') + chalk.gray(' = Neutral change'));
};

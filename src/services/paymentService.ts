import { PaymentStatus, Payment, Bill } from '@prisma/client';
import { getPrismaClient } from './database.js';
import { formatMonth } from '../utils/formatters.js';

export interface CreatePaymentInput {
  billId: string;
  amount: number;
  dueDate: Date;
  notes?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  status?: PaymentStatus;
  paidDate?: Date;
  notes?: string;
}

export interface PaymentWithBill extends Payment {
  bill: Bill;
}

export interface MonthSummary {
  year: number;
  month: number;
  monthLabel: string;
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}

export interface ComparisonMetric {
  metricName: string;
  values: number[];
  change: number;
  percentageChange: number | null;
  trend: 'up' | 'down' | 'stable';
}

export interface PaymentComparison {
  months: MonthSummary[];
  metrics: {
    total: ComparisonMetric;
    paid: ComparisonMetric;
    pending: ComparisonMetric;
    overdue: ComparisonMetric;
  };
}

export class PaymentService {
  private prisma = getPrismaClient();

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    return this.prisma.payment.create({
      data: input,
    });
  }

  async getAllPayments(): Promise<PaymentWithBill[]> {
    return this.prisma.payment.findMany({
      include: { bill: true },
      orderBy: { dueDate: 'desc' },
    });
  }

  async getPaymentById(id: string): Promise<PaymentWithBill | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { bill: true },
    });
  }

  async getPaymentsByMonth(year: number, month: number): Promise<PaymentWithBill[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.payment.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { bill: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getPaymentsByStatus(status: PaymentStatus): Promise<PaymentWithBill[]> {
    return this.prisma.payment.findMany({
      where: { status },
      include: { bill: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async updatePayment(id: string, input: UpdatePaymentInput): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data: input,
    });
  }

  async markAsPaid(id: string, paidDate?: Date): Promise<Payment> {
    return this.updatePayment(id, {
      status: 'PAID',
      paidDate: paidDate || new Date(),
    });
  }

  async deletePayment(id: string): Promise<Payment> {
    return this.prisma.payment.delete({
      where: { id },
    });
  }

  async generateMonthlyPayments(year: number, month: number): Promise<Payment[]> {
    const bills = await this.prisma.bill.findMany({
      where: { active: true },
    });

    const payments: Payment[] = [];

    for (const bill of bills) {
      // Check if payment already exists for this month
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          billId: bill.id,
          dueDate: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        },
      });

      if (!existingPayment) {
        const dueDate = new Date(year, month - 1, bill.dueDay);
        const payment = await this.createPayment({
          billId: bill.id,
          amount: bill.amount,
          dueDate,
        });
        payments.push(payment);
      }
    }

    return payments;
  }

  async updateOverduePayments(): Promise<number> {
    const result = await this.prisma.payment.updateMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: new Date(),
        },
      },
      data: {
        status: 'OVERDUE',
      },
    });

    return result.count;
  }

  async getPaymentsSummary(year: number, month: number): Promise<{
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  }> {
    const payments = await this.getPaymentsByMonth(year, month);

    const summary = {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
    };

    payments.forEach((payment) => {
      summary.total += payment.amount;
      if (payment.status === 'PAID') {
        summary.paid += payment.amount;
      } else if (payment.status === 'PENDING') {
        summary.pending += payment.amount;
      } else if (payment.status === 'OVERDUE') {
        summary.overdue += payment.amount;
      }
    });

    return summary;
  }

  async getPaymentComparison(year: number, month: number): Promise<PaymentComparison> {
    // Calculate the 3 months to compare
    const months = this.calculatePreviousMonths(year, month, 3);

    // Fetch summaries for all 3 months in parallel
    const summaries = await Promise.all(
      months.map(async ({ year, month }) => {
        const summary = await this.getPaymentsSummary(year, month);
        return {
          year,
          month,
          monthLabel: formatMonth(new Date(year, month - 1)),
          ...summary,
        };
      })
    );

    // Calculate comparison metrics
    const metrics = this.calculateComparisonMetrics(summaries);

    return {
      months: summaries,
      metrics,
    };
  }

  private calculatePreviousMonths(
    year: number,
    month: number,
    count: number
  ): Array<{ year: number; month: number }> {
    const months: Array<{ year: number; month: number }> = [];

    for (let i = count - 1; i >= 0; i--) {
      let targetMonth = month - i;
      let targetYear = year;

      // Handle year boundary
      while (targetMonth < 1) {
        targetMonth += 12;
        targetYear -= 1;
      }

      months.push({ year: targetYear, month: targetMonth });
    }

    return months;
  }

  private calculateComparisonMetrics(
    summaries: MonthSummary[]
  ): PaymentComparison['metrics'] {
    const createMetric = (
      metricName: string,
      values: number[]
    ): ComparisonMetric => {
      const previousValue = values[1];
      const currentValue = values[2];
      const change = currentValue - previousValue;

      // Calculate percentage change (avoid division by zero)
      let percentageChange: number | null = null;
      if (previousValue !== 0) {
        percentageChange = (change / previousValue) * 100;
      }

      // Determine trend
      let trend: 'up' | 'down' | 'stable';
      if (Math.abs(change) < 0.01) {
        trend = 'stable';
      } else if (change > 0) {
        trend = 'up';
      } else {
        trend = 'down';
      }

      return {
        metricName,
        values,
        change,
        percentageChange,
        trend,
      };
    };

    return {
      total: createMetric('Total', summaries.map((s) => s.total)),
      paid: createMetric('Paid', summaries.map((s) => s.paid)),
      pending: createMetric('Pending', summaries.map((s) => s.pending)),
      overdue: createMetric('Overdue', summaries.map((s) => s.overdue)),
    };
  }
}

import { PaymentStatus, Payment, Bill } from '@prisma/client';
import { getPrismaClient } from './database.js';

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
}

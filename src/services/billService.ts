import { BillType, Bill } from '@prisma/client';
import { getPrismaClient } from './database.js';

export interface CreateBillInput {
  name: string;
  type: BillType;
  amount: number;
  dueDay: number;
  description?: string;
}

export interface UpdateBillInput {
  name?: string;
  type?: BillType;
  amount?: number;
  dueDay?: number;
  description?: string;
  active?: boolean;
}

export class BillService {
  private prisma = getPrismaClient();

  async createBill(input: CreateBillInput): Promise<Bill> {
    return this.prisma.bill.create({
      data: input,
    });
  }

  async getAllBills(activeOnly: boolean = false): Promise<Bill[]> {
    return this.prisma.bill.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { dueDay: 'asc' },
    });
  }

  async getBillById(id: string): Promise<Bill | null> {
    return this.prisma.bill.findUnique({
      where: { id },
    });
  }

  async getBillByName(name: string): Promise<Bill | null> {
    return this.prisma.bill.findFirst({
      where: { name },
    });
  }

  async updateBill(id: string, input: UpdateBillInput): Promise<Bill> {
    return this.prisma.bill.update({
      where: { id },
      data: input,
    });
  }

  async deleteBill(id: string): Promise<Bill> {
    return this.prisma.bill.delete({
      where: { id },
    });
  }

  async toggleBillStatus(id: string): Promise<Bill> {
    const bill = await this.getBillById(id);
    if (!bill) {
      throw new Error('Bill not found');
    }
    return this.updateBill(id, { active: !bill.active });
  }
}

import inquirer from 'inquirer';
import { PaymentStatus } from '@prisma/client';
import { PaymentService } from '../services/paymentService.js';
import { BillService } from '../services/billService.js';
import {
  displayPayments,
  displaySuccess,
  displayError,
  displayInfo,
  displaySummary,
} from '../utils/display.js';
import { formatCurrency, formatMonth } from '../utils/formatters.js';

const paymentService = new PaymentService();
const billService = new BillService();

export const listPayments = async (month?: number, year?: number): Promise<void> => {
  try {
    let payments;

    if (month && year) {
      payments = await paymentService.getPaymentsByMonth(year, month);
      console.log(`\nPayments for ${formatMonth(new Date(year, month - 1))}`);
    } else {
      const now = new Date();
      payments = await paymentService.getPaymentsByMonth(
        now.getFullYear(),
        now.getMonth() + 1
      );
      console.log(`\nPayments for ${formatMonth(now)}`);
    }

    displayPayments(payments);
  } catch (error) {
    displayError('Failed to fetch payments');
    console.error(error);
  }
};

export const addPayment = async (): Promise<void> => {
  try {
    const bills = await billService.getAllBills(true);

    if (bills.length === 0) {
      displayInfo('No active bills available. Please create a bill first.');
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'billId',
        message: 'Select bill:',
        choices: bills.map((bill) => ({
          name: `${bill.name} - ${formatCurrency(bill.amount)}`,
          value: bill.id,
        })),
      },
      {
        type: 'number',
        name: 'amount',
        message: 'Payment amount:',
        default: (answers: any) => {
          const bill = bills.find((b) => b.id === answers.billId);
          return bill?.amount || 0;
        },
        validate: (input) => input > 0 || 'Amount must be greater than 0',
      },
      {
        type: 'input',
        name: 'dueDate',
        message: 'Due date (YYYY-MM-DD):',
        default: () => {
          const now = new Date();
          return now.toISOString().split('T')[0];
        },
        validate: (input) => {
          const date = new Date(input);
          return !isNaN(date.getTime()) || 'Invalid date format';
        },
      },
      {
        type: 'input',
        name: 'notes',
        message: 'Notes (optional):',
      },
    ]);

    const payment = await paymentService.createPayment({
      billId: answers.billId,
      amount: answers.amount,
      dueDate: new Date(answers.dueDate),
      notes: answers.notes.trim() || undefined,
    });

    displaySuccess(
      `Payment created successfully (${formatCurrency(payment.amount)})`
    );
  } catch (error) {
    displayError('Failed to create payment');
    console.error(error);
  }
};

export const updatePayment = async (): Promise<void> => {
  try {
    const now = new Date();
    const payments = await paymentService.getPaymentsByMonth(
      now.getFullYear(),
      now.getMonth() + 1
    );

    if (payments.length === 0) {
      displayInfo('No payments available for this month');
      return;
    }

    const { paymentId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'paymentId',
        message: 'Select payment to update:',
        choices: payments.map((payment) => ({
          name: `${payment.bill.name} - ${formatCurrency(payment.amount)} - ${payment.status}`,
          value: payment.id,
        })),
      },
    ]);

    const selectedPayment = payments.find((p) => p.id === paymentId)!;

    const { fieldsToUpdate } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'fieldsToUpdate',
        message: 'What would you like to update?',
        choices: [
          { name: 'Amount', value: 'amount' },
          { name: 'Status', value: 'status' },
          { name: 'Paid Date', value: 'paidDate' },
          { name: 'Notes', value: 'notes' },
        ],
      },
    ]);

    if (fieldsToUpdate.length === 0) {
      displayInfo('No fields selected to update');
      return;
    }

    const updateQuestions: any[] = [];

    if (fieldsToUpdate.includes('amount')) {
      updateQuestions.push({
        type: 'number',
        name: 'amount',
        message: 'New amount:',
        default: selectedPayment.amount,
        validate: (input: number) => input > 0 || 'Amount must be greater than 0',
      });
    }

    if (fieldsToUpdate.includes('status')) {
      updateQuestions.push({
        type: 'list',
        name: 'status',
        message: 'New status:',
        choices: Object.values(PaymentStatus),
        default: selectedPayment.status,
      });
    }

    if (fieldsToUpdate.includes('paidDate')) {
      updateQuestions.push({
        type: 'input',
        name: 'paidDate',
        message: 'Paid date (YYYY-MM-DD):',
        default: selectedPayment.paidDate
          ? selectedPayment.paidDate.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        validate: (input: string) => {
          const date = new Date(input);
          return !isNaN(date.getTime()) || 'Invalid date format';
        },
      });
    }

    if (fieldsToUpdate.includes('notes')) {
      updateQuestions.push({
        type: 'input',
        name: 'notes',
        message: 'New notes:',
        default: selectedPayment.notes || '',
      });
    }

    const updates = await inquirer.prompt(updateQuestions);

    if (updates.paidDate) {
      updates.paidDate = new Date(updates.paidDate);
    }

    await paymentService.updatePayment(paymentId, updates);
    displaySuccess('Payment updated successfully');
  } catch (error) {
    displayError('Failed to update payment');
    console.error(error);
  }
};

export const markPaymentAsPaid = async (): Promise<void> => {
  try {
    const pendingPayments = await paymentService.getPaymentsByStatus('PENDING');
    const overduePayments = await paymentService.getPaymentsByStatus('OVERDUE');
    const unpaidPayments = [...pendingPayments, ...overduePayments];

    if (unpaidPayments.length === 0) {
      displayInfo('No unpaid payments found');
      return;
    }

    const { paymentId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'paymentId',
        message: 'Select payment to mark as paid:',
        choices: unpaidPayments.map((payment) => ({
          name: `${payment.bill.name} - ${formatCurrency(payment.amount)} - ${payment.status}`,
          value: payment.id,
        })),
      },
    ]);

    const { paidDate } = await inquirer.prompt([
      {
        type: 'input',
        name: 'paidDate',
        message: 'Paid date (YYYY-MM-DD):',
        default: new Date().toISOString().split('T')[0],
        validate: (input) => {
          const date = new Date(input);
          return !isNaN(date.getTime()) || 'Invalid date format';
        },
      },
    ]);

    await paymentService.markAsPaid(paymentId, new Date(paidDate));
    displaySuccess('Payment marked as paid');
  } catch (error) {
    displayError('Failed to mark payment as paid');
    console.error(error);
  }
};

export const deletePayment = async (): Promise<void> => {
  try {
    const now = new Date();
    const payments = await paymentService.getPaymentsByMonth(
      now.getFullYear(),
      now.getMonth() + 1
    );

    if (payments.length === 0) {
      displayInfo('No payments available to delete');
      return;
    }

    const { paymentId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'paymentId',
        message: 'Select payment to delete:',
        choices: payments.map((payment) => ({
          name: `${payment.bill.name} - ${formatCurrency(payment.amount)}`,
          value: payment.id,
        })),
      },
    ]);

    const selectedPayment = payments.find((p) => p.id === paymentId)!;

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete this payment for "${selectedPayment.bill.name}"?`,
        default: false,
      },
    ]);

    if (confirm) {
      await paymentService.deletePayment(paymentId);
      displaySuccess('Payment deleted successfully');
    } else {
      displayInfo('Deletion cancelled');
    }
  } catch (error) {
    displayError('Failed to delete payment');
    console.error(error);
  }
};

export const generateMonthlyPayments = async (): Promise<void> => {
  try {
    const { monthYear } = await inquirer.prompt([
      {
        type: 'input',
        name: 'monthYear',
        message: 'Enter month and year (YYYY-MM):',
        default: () => {
          const now = new Date();
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        },
        validate: (input) => {
          const regex = /^\d{4}-\d{2}$/;
          return regex.test(input) || 'Invalid format. Use YYYY-MM';
        },
      },
    ]);

    const [year, month] = monthYear.split('-').map(Number);

    const payments = await paymentService.generateMonthlyPayments(year, month);

    if (payments.length === 0) {
      displayInfo('All payments for this month already exist');
    } else {
      displaySuccess(
        `Generated ${payments.length} payment(s) for ${formatMonth(new Date(year, month - 1))}`
      );
    }
  } catch (error) {
    displayError('Failed to generate monthly payments');
    console.error(error);
  }
};

export const showMonthlySummary = async (): Promise<void> => {
  try {
    const { monthYear } = await inquirer.prompt([
      {
        type: 'input',
        name: 'monthYear',
        message: 'Enter month and year (YYYY-MM):',
        default: () => {
          const now = new Date();
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        },
        validate: (input) => {
          const regex = /^\d{4}-\d{2}$/;
          return regex.test(input) || 'Invalid format. Use YYYY-MM';
        },
      },
    ]);

    const [year, month] = monthYear.split('-').map(Number);

    // Update overdue payments first
    await paymentService.updateOverduePayments();

    const summary = await paymentService.getPaymentsSummary(year, month);
    const payments = await paymentService.getPaymentsByMonth(year, month);

    console.log(`\n${formatMonth(new Date(year, month - 1))}`);
    displayPayments(payments);
    displaySummary(summary.total, summary.paid, summary.pending, summary.overdue);
  } catch (error) {
    displayError('Failed to show monthly summary');
    console.error(error);
  }
};

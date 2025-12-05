import inquirer from 'inquirer';
import { BillType } from '@prisma/client';
import { BillService } from '../services/billService.js';
import { displayBills, displaySuccess, displayError, displayInfo } from '../utils/display.js';
import { formatCurrency } from '../utils/formatters.js';

const billService = new BillService();

export const listBills = async (activeOnly: boolean = false): Promise<void> => {
  try {
    const bills = await billService.getAllBills(activeOnly);
    displayBills(bills);
  } catch (error) {
    displayError('Failed to fetch bills');
    console.error(error);
  }
};

export const addBill = async (): Promise<void> => {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Bill name:',
        validate: (input) => input.trim() !== '' || 'Name is required',
      },
      {
        type: 'list',
        name: 'type',
        message: 'Bill type:',
        choices: Object.values(BillType),
      },
      {
        type: 'number',
        name: 'amount',
        message: 'Amount:',
        validate: (input) => input > 0 || 'Amount must be greater than 0',
      },
      {
        type: 'number',
        name: 'dueDay',
        message: 'Due day of month (1-31):',
        validate: (input) =>
          (input >= 1 && input <= 31) || 'Day must be between 1 and 31',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):',
      },
    ]);

    const bill = await billService.createBill({
      name: answers.name.trim(),
      type: answers.type,
      amount: answers.amount,
      dueDay: answers.dueDay,
      description: answers.description.trim() || undefined,
    });

    displaySuccess(
      `Bill "${bill.name}" created successfully (${formatCurrency(bill.amount)} due on day ${bill.dueDay})`
    );
  } catch (error) {
    displayError('Failed to create bill');
    console.error(error);
  }
};

export const updateBill = async (): Promise<void> => {
  try {
    const bills = await billService.getAllBills();

    if (bills.length === 0) {
      displayInfo('No bills available to update');
      return;
    }

    const { billId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'billId',
        message: 'Select bill to update:',
        choices: bills.map((bill) => ({
          name: `${bill.name} - ${formatCurrency(bill.amount)} (Due: ${bill.dueDay})`,
          value: bill.id,
        })),
      },
    ]);

    const selectedBill = bills.find((b) => b.id === billId)!;

    const { fieldsToUpdate } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'fieldsToUpdate',
        message: 'What would you like to update?',
        choices: [
          { name: 'Name', value: 'name' },
          { name: 'Type', value: 'type' },
          { name: 'Amount', value: 'amount' },
          { name: 'Due Day', value: 'dueDay' },
          { name: 'Description', value: 'description' },
          { name: 'Status (Active/Inactive)', value: 'active' },
        ],
      },
    ]);

    if (fieldsToUpdate.length === 0) {
      displayInfo('No fields selected to update');
      return;
    }

    const updateQuestions: any[] = [];

    if (fieldsToUpdate.includes('name')) {
      updateQuestions.push({
        type: 'input',
        name: 'name',
        message: 'New name:',
        default: selectedBill.name,
        validate: (input: string) => input.trim() !== '' || 'Name is required',
      });
    }

    if (fieldsToUpdate.includes('type')) {
      updateQuestions.push({
        type: 'list',
        name: 'type',
        message: 'New type:',
        choices: Object.values(BillType),
        default: selectedBill.type,
      });
    }

    if (fieldsToUpdate.includes('amount')) {
      updateQuestions.push({
        type: 'number',
        name: 'amount',
        message: 'New amount:',
        default: selectedBill.amount,
        validate: (input: number) => input > 0 || 'Amount must be greater than 0',
      });
    }

    if (fieldsToUpdate.includes('dueDay')) {
      updateQuestions.push({
        type: 'number',
        name: 'dueDay',
        message: 'New due day (1-31):',
        default: selectedBill.dueDay,
        validate: (input: number) =>
          (input >= 1 && input <= 31) || 'Day must be between 1 and 31',
      });
    }

    if (fieldsToUpdate.includes('description')) {
      updateQuestions.push({
        type: 'input',
        name: 'description',
        message: 'New description:',
        default: selectedBill.description || '',
      });
    }

    if (fieldsToUpdate.includes('active')) {
      updateQuestions.push({
        type: 'confirm',
        name: 'active',
        message: 'Is this bill active?',
        default: selectedBill.active,
      });
    }

    const updates = await inquirer.prompt(updateQuestions);

    const updatedBill = await billService.updateBill(billId, updates);
    displaySuccess(`Bill "${updatedBill.name}" updated successfully`);
  } catch (error) {
    displayError('Failed to update bill');
    console.error(error);
  }
};

export const deleteBill = async (): Promise<void> => {
  try {
    const bills = await billService.getAllBills();

    if (bills.length === 0) {
      displayInfo('No bills available to delete');
      return;
    }

    const { billId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'billId',
        message: 'Select bill to delete:',
        choices: bills.map((bill) => ({
          name: `${bill.name} - ${formatCurrency(bill.amount)}`,
          value: bill.id,
        })),
      },
    ]);

    const selectedBill = bills.find((b) => b.id === billId)!;

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete "${selectedBill.name}"? This will also delete all associated payments.`,
        default: false,
      },
    ]);

    if (confirm) {
      await billService.deleteBill(billId);
      displaySuccess(`Bill "${selectedBill.name}" deleted successfully`);
    } else {
      displayInfo('Deletion cancelled');
    }
  } catch (error) {
    displayError('Failed to delete bill');
    console.error(error);
  }
};

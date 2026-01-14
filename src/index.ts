#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { disconnectDatabase } from './services/database.js';
import { getVersion } from './utils/version.js';
import {
  listBills,
  addBill,
  updateBill,
  deleteBill,
} from './commands/billCommands.js';
import {
  listPayments,
  addPayment,
  updatePayment,
  markPaymentAsPaid,
  deletePayment,
  generateMonthlyPayments,
  showMonthlySummary,
  comparePayments,
} from './commands/paymentCommands.js';

// Load environment variables
dotenv.config();

const program = new Command();

const version = getVersion();

program
  .name('house-duties')
  .description('Console application to track rent and utility bills')
  .version(version);

// Interactive menu
const showMainMenu = async (): Promise<void> => {
  console.clear();
  console.log(chalk.bold.cyan('\n================================='));
  console.log(chalk.bold.cyan('   House Duties - Bill Tracker'));
  console.log(chalk.bold.cyan(`         Version ${version}`));
  console.log(chalk.bold.cyan('=================================\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: chalk.green('=� Show Monthly Summary'), value: 'summary' },
        { name: '=� List Bills', value: 'list-bills' },
        { name: '� Add Bill', value: 'add-bill' },
        { name: '  Update Bill', value: 'update-bill' },
        { name: '=�  Delete Bill', value: 'delete-bill' },
        new inquirer.Separator(),
        { name: '=� List Payments', value: 'list-payments' },
        { name: '� Add Payment', value: 'add-payment' },
        { name: '  Update Payment', value: 'update-payment' },
        { name: ' Mark Payment as Paid', value: 'mark-paid' },
        { name: '=�  Delete Payment', value: 'delete-payment' },
        new inquirer.Separator(),
        { name: '= Generate Monthly Payments', value: 'generate-payments' },
        { name: '📊 Compare Payments (Last 3 Months)', value: 'compare-payments' },
        new inquirer.Separator(),
        { name: chalk.red('=� Exit'), value: 'exit' },
      ],
      pageSize: 20,
    },
  ]);

  switch (action) {
    case 'summary':
      await showMonthlySummary();
      break;
    case 'list-bills':
      await listBills();
      break;
    case 'add-bill':
      await addBill();
      break;
    case 'update-bill':
      await updateBill();
      break;
    case 'delete-bill':
      await deleteBill();
      break;
    case 'list-payments':
      await listPayments();
      break;
    case 'add-payment':
      await addPayment();
      break;
    case 'update-payment':
      await updatePayment();
      break;
    case 'mark-paid':
      await markPaymentAsPaid();
      break;
    case 'delete-payment':
      await deletePayment();
      break;
    case 'generate-payments':
      await generateMonthlyPayments();
      break;
    case 'compare-payments':
      await comparePayments();
      break;
    case 'exit':
      console.log(chalk.cyan('\nGoodbye! =K\n'));
      await disconnectDatabase();
      process.exit(0);
  }

  // Ask if user wants to continue
  const { continueAction } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continueAction',
      message: 'Continue?',
      default: true,
    },
  ]);

  if (continueAction) {
    await showMainMenu();
  } else {
    console.log(chalk.cyan('\nGoodbye! =K\n'));
    await disconnectDatabase();
    process.exit(0);
  }
};

// CLI Commands
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    try {
      await showMainMenu();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('bills:list')
  .description('List all bills')
  .option('-a, --active-only', 'Show only active bills')
  .action(async (options) => {
    try {
      await listBills(options.activeOnly);
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('bills:add')
  .description('Add a new bill')
  .action(async () => {
    try {
      await addBill();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('bills:update')
  .description('Update a bill')
  .action(async () => {
    try {
      await updateBill();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('bills:delete')
  .description('Delete a bill')
  .action(async () => {
    try {
      await deleteBill();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('payments:list')
  .description('List payments for current month')
  .option('-m, --month <month>', 'Month (1-12)')
  .option('-y, --year <year>', 'Year')
  .action(async (options) => {
    try {
      const month = options.month ? parseInt(options.month) : undefined;
      const year = options.year ? parseInt(options.year) : undefined;
      await listPayments(month, year);
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('payments:add')
  .description('Add a new payment')
  .action(async () => {
    try {
      await addPayment();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('payments:update')
  .description('Update a payment')
  .action(async () => {
    try {
      await updatePayment();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('payments:mark-paid')
  .description('Mark a payment as paid')
  .action(async () => {
    try {
      await markPaymentAsPaid();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('payments:delete')
  .description('Delete a payment')
  .action(async () => {
    try {
      await deletePayment();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('payments:generate')
  .description('Generate monthly payments from active bills')
  .action(async () => {
    try {
      await generateMonthlyPayments();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('summary')
  .description('Show monthly summary')
  .action(async () => {
    try {
      await showMonthlySummary();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

program
  .command('payments:compare')
  .description('Compare payment summaries for the last 3 months')
  .action(async () => {
    try {
      await comparePayments();
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      await disconnectDatabase();
      process.exit(1);
    }
  });

// Default to interactive mode if no command is provided
if (process.argv.length === 2) {
  showMainMenu().catch((error) => {
    console.error(chalk.red('Error:'), error);
    disconnectDatabase().finally(() => process.exit(1));
  });
} else {
  program.parse(process.argv);
}

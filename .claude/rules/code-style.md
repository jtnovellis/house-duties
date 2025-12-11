---
paths: src/**/*.ts
---

# Code Style Guide - House Duties

This document defines the code styling standards for the House Duties project, based on industry best practices and established patterns within the codebase.

## Table of Contents

1. [Naming Conventions](#naming-conventions)
2. [File Organization](#file-organization)
3. [Import/Export Patterns](#importexport-patterns)
4. [TypeScript Conventions](#typescript-conventions)
5. [Function Declarations](#function-declarations)
6. [Error Handling](#error-handling)
7. [Comments and Documentation](#comments-and-documentation)
8. [Class vs Functional Patterns](#class-vs-functional-patterns)
9. [Async/Await Usage](#asyncawait-usage)
10. [Formatting and Whitespace](#formatting-and-whitespace)
11. [Best Practices](#best-practices)

---

## 1. Naming Conventions

### Variables and Functions

**Rule**: Use `camelCase` for all variables, functions, and methods.

```typescript
// ✅ Good
const billService = new BillService();
const selectedBill = bills.find((b) => b.id === id);
async function getAllBills(): Promise<Bill[]> {}
const fetchPaymentData = async () => {};

// ❌ Bad
const BillService = new BillService();
const selected_bill = bills.find((b) => b.id === id);
async function GetAllBills(): Promise<Bill[]> {}
const fetch_payment_data = async () => {};
```

### Classes, Interfaces, Types, and Enums

**Rule**: Use `PascalCase` for all classes, interfaces, types, and enums.

```typescript
// ✅ Good
export class BillService {}
export interface CreateBillInput {}
export type PaymentWithBill = Payment & { bill: Bill };
enum BillType {
  RENT,
  ELECTRICITY,
}

// ❌ Bad
export class billService {}
export interface createBillInput {}
export type paymentWithBill = Payment & { bill: Bill };
enum billType {
  RENT,
  ELECTRICITY,
}
```

### File Names

**Rule**: Follow these conventions for file naming:

- **Services**: `*Service.ts` (e.g., `billService.ts`, `paymentService.ts`)
- **Commands**: `*Commands.ts` (e.g., `billCommands.ts`, `paymentCommands.ts`)
- **Utilities**: Use descriptive names (e.g., `display.ts`, `formatters.ts`, `version.ts`)
- **Main entry**: Use descriptive names (e.g., `index.ts`)

```
✅ Good
src/services/billService.ts
src/commands/paymentCommands.ts
src/utils/display.ts

❌ Bad
src/services/bill.service.ts
src/commands/payment_commands.ts
src/utils/Display.ts
```

### CLI Commands

**Rule**: Use `kebab-case` for CLI command names.

```typescript
// ✅ Good
program.command("bills:list");
program.command("payments:mark-paid");

// ❌ Bad
program.command("billsList");
program.command("payments_markPaid");
```

### Boolean Variables

**Rule**: Prefix boolean variables with `is`, `has`, `should`, or `can` for clarity.

```typescript
// ✅ Good
const isActive = bill.active;
const hasPayments = payments.length > 0;
const shouldUpdate = status === "PENDING";

// ❌ Bad
const active = bill.active;
const payments = payments.length > 0;
const update = status === "PENDING";
```

---

## 2. File Organization

### Directory Structure

**Rule**: Organize files by layer (services, commands, utils) and feature.

```
src/
├── commands/           # CLI command implementations (user-facing)
│   ├── billCommands.ts
│   └── paymentCommands.ts
├── services/           # Business logic layer (data access)
│   ├── database.ts
│   ├── billService.ts
│   └── paymentService.ts
├── utils/              # Helper functions (formatting, display)
│   ├── display.ts
│   ├── formatters.ts
│   └── version.ts
└── index.ts            # Main entry point
```

### File Structure Order

**Rule**: Order file contents in this sequence:

1. Imports (external, then internal)
2. Type definitions and interfaces
3. Constants and configuration
4. Class definitions or function exports
5. Helper functions (non-exported)

```typescript
// ✅ Good: Proper ordering
import inquirer from "inquirer";
import { BillType } from "@prisma/client";

import { BillService } from "../services/billService.js";
import { displayBills } from "../utils/display.js";

export interface CreateBillInput {
  name: string;
  type: BillType;
  amount: number;
}

const billService = new BillService();

export const listBills = async (): Promise<void> => {
  // implementation
};

const validateBillInput = (input: string): boolean => {
  // helper function
};
```

---

## 3. Import/Export Patterns

### Import Order

**Rule**: Group imports in three tiers:

1. **External libraries** (Node.js built-ins, npm packages) - alphabetically
2. **Internal modules** (services, utils) - by layer
3. **Types and interfaces** (if importing types separately)

```typescript
// ✅ Good
import { readFile } from "fs/promises";
import chalk from "chalk";
import inquirer from "inquirer";

import { BillService } from "../services/billService.js";
import { PaymentService } from "../services/paymentService.js";
import { displayBills, displayError } from "../utils/display.js";
import { formatCurrency } from "../utils/formatters.js";

// ❌ Bad: Mixed ordering
import { displayBills } from "../utils/display.js";
import inquirer from "inquirer";
import { BillService } from "../services/billService.js";
import chalk from "chalk";
```

### Import Statements

**Rule**: Always use `.js` extension for ES module imports (required for TypeScript ES modules).

```typescript
// ✅ Good
import { disconnectDatabase } from "./services/database.js";
import { listBills } from "./commands/billCommands.js";

// ❌ Bad
import { disconnectDatabase } from "./services/database";
import { listBills } from "./commands/billCommands.ts";
```

### Export Style

**Rule**: Use named exports exclusively. Avoid default exports.

```typescript
// ✅ Good
export const listBills = async (): Promise<void> => {};
export class BillService {}
export interface CreateBillInput {}

// ❌ Bad
export default async function listBills(): Promise<void> {}
export default class BillService {}
```

**Rationale**: Named exports provide better IDE support, refactoring safety, and explicit imports.

### Grouped Imports

**Rule**: Group multiple imports from the same module on a single line.

```typescript
// ✅ Good
import {
  displayBills,
  displayError,
  displaySuccess,
} from "../utils/display.js";

// ❌ Bad
import { displayBills } from "../utils/display.js";
import { displayError } from "../utils/display.js";
import { displaySuccess } from "../utils/display.js";
```

---

## 4. TypeScript Conventions

### Type Annotations

**Rule**: Always explicitly annotate return types for functions and methods.

```typescript
// ✅ Good
async getAllBills(activeOnly: boolean = false): Promise<Bill[]> {
  return this.prisma.bill.findMany({ where: { active: activeOnly } });
}

export const listBills = async (activeOnly: boolean = false): Promise<void> => {
  const bills = await billService.getAllBills(activeOnly);
  displayBills(bills);
};

// ❌ Bad: Missing return type
async getAllBills(activeOnly: boolean = false) {
  return this.prisma.bill.findMany({ where: { active: activeOnly } });
}
```

**Rationale**: Explicit return types catch errors early and improve code documentation.

### Parameter Types

**Rule**: Always type function parameters, including optional parameters.

```typescript
// ✅ Good
async getPaymentsByMonth(year: number, month: number): Promise<PaymentWithBill[]> { }
async updateBill(id: string, input: UpdateBillInput): Promise<Bill> { }
const formatCurrency = (amount: number): string => { };

// ❌ Bad
async getPaymentsByMonth(year, month) { }
async updateBill(id, input) { }
const formatCurrency = (amount) => { };
```

### Interface Definitions

**Rule**: Use interfaces for input objects, and extend types when adding relationships.

```typescript
// ✅ Good: Input interfaces
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

// ✅ Good: Extended types for relationships
export interface PaymentWithBill extends Payment {
  bill: Bill;
}

// ❌ Bad: Using types for input objects
export type CreateBillInput = {
  name: string;
  type: BillType;
  // ...
};
```

**Rationale**: Interfaces can be extended and merged, making them more flexible for input definitions. The distinction between `Create*Input` and `Update*Input` clarifies required vs optional fields.

### Type vs Interface

**Rule**: Use interfaces for object shapes and contracts. Use types for unions, intersections, and complex types.

```typescript
// ✅ Good: Interface for object shapes
export interface CreateBillInput {
  name: string;
  type: BillType;
}

// ✅ Good: Type for unions and complex types
export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE";
export type PaymentSummary = {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
};

// ✅ Good: Type for lookups
const typeMap: Record<BillType, string> = {
  RENT: "Rent",
  ELECTRICITY: "Electricity",
};
```

### Strict Type Checking

**Rule**: Follow strict TypeScript settings (already configured in `tsconfig.json`):

- Enable `strict: true`
- Enable `noUnusedLocals: true`
- Enable `noUnusedParameters: true`
- Enable `noImplicitReturns: true`
- Enable `noFallthroughCasesInSwitch: true`

```typescript
// ✅ Good: No unused variables
const bills = await billService.getAllBills(activeOnly);
displayBills(bills);

// ❌ Bad: Unused variable (caught by strict mode)
const bills = await billService.getAllBills(activeOnly);
const payments = await paymentService.getAll(); // unused
displayBills(bills);
```

### Type Assertions

**Rule**: Minimize type assertions. Use only when TypeScript cannot infer type safety but you have guaranteed correctness.

```typescript
// ✅ Good: Necessary assertion after filter
const selectedBill = bills.find((b) => b.id === billId)!;

// ⚠️ Use with caution
const data = JSON.parse(response) as BillData;

// ❌ Bad: Unnecessary assertion
const bills = (await billService.getAllBills()) as Bill[];
```

---

## 5. Function Declarations

### Arrow Functions

**Rule**: Use arrow functions for exported command functions and utility functions.

```typescript
// ✅ Good
export const listBills = async (activeOnly: boolean = false): Promise<void> => {
  try {
    const bills = await billService.getAllBills(activeOnly);
    displayBills(bills);
  } catch (error) {
    displayError("Failed to fetch bills");
    console.error(error);
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(amount);
};
```

### Class Methods

**Rule**: Use standard method syntax for class methods in services.

```typescript
// ✅ Good: Standard method syntax
export class BillService {
  private prisma = getPrismaClient();

  async createBill(input: CreateBillInput): Promise<Bill> {
    return this.prisma.bill.create({ data: input });
  }

  async getAllBills(activeOnly: boolean = false): Promise<Bill[]> {
    return this.prisma.bill.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { dueDay: "asc" },
    });
  }
}

// ❌ Bad: Arrow function properties
export class BillService {
  private prisma = getPrismaClient();

  createBill = async (input: CreateBillInput): Promise<Bill> => {
    return this.prisma.bill.create({ data: input });
  };
}
```

**Rationale**: Standard method syntax is more conventional for class methods, binds properly, and works better with inheritance.

### Default Parameters

**Rule**: Use default parameters instead of conditional logic when possible.

```typescript
// ✅ Good
async getAllBills(activeOnly: boolean = false): Promise<Bill[]> {
  return this.prisma.bill.findMany({
    where: activeOnly ? { active: true } : {},
  });
}

// ❌ Bad
async getAllBills(activeOnly?: boolean): Promise<Bill[]> {
  const filter = activeOnly !== undefined ? activeOnly : false;
  return this.prisma.bill.findMany({
    where: filter ? { active: true } : {},
  });
}
```

### Async Function Syntax

**Rule**: Mark async functions with `async` keyword before arrow or function keyword.

```typescript
// ✅ Good
export const listBills = async (): Promise<void> => {};
const showMainMenu = async (): Promise<void> => {};

// ❌ Bad
export const listBills = (): Promise<void> => {
  return new Promise((resolve) => {});
};
```

---

## 6. Error Handling

### Try-Catch Blocks

**Rule**: Wrap all command function bodies in try-catch blocks.

```typescript
// ✅ Good
export const addBill = async (): Promise<void> => {
  try {
    const answers = await inquirer.prompt([
      /* questions */
    ]);
    const newBill = await billService.createBill(answers);
    displaySuccess(`Bill "${newBill.name}" created successfully!`);
  } catch (error) {
    displayError("Failed to create bill");
    console.error(error);
  }
};

// ❌ Bad: No error handling
export const addBill = async (): Promise<void> => {
  const answers = await inquirer.prompt([
    /* questions */
  ]);
  const newBill = await billService.createBill(answers);
  displaySuccess(`Bill "${newBill.name}" created successfully!`);
};
```

### Error Display Strategy

**Rule**: Use two-tier error display:

1. User-friendly message via `displayError()`
2. Full error details via `console.error()`

```typescript
// ✅ Good
try {
  const bills = await billService.getAllBills(activeOnly);
  displayBills(bills);
} catch (error) {
  displayError("Failed to fetch bills");
  console.error(error);
}

// ❌ Bad: Only generic message
try {
  const bills = await billService.getAllBills(activeOnly);
  displayBills(bills);
} catch (error) {
  displayError("Failed to fetch bills");
}

// ❌ Bad: Only technical error
try {
  const bills = await billService.getAllBills(activeOnly);
  displayBills(bills);
} catch (error) {
  console.error(error);
}
```

### Service Layer Error Handling

**Rule**: Throw descriptive errors in services; let command layer handle display.

```typescript
// ✅ Good: Service throws, command handles
export class BillService {
  async toggleBillStatus(id: string): Promise<Bill> {
    const bill = await this.getBillById(id);
    if (!bill) {
      throw new Error("Bill not found");
    }
    return this.prisma.bill.update({
      where: { id },
      data: { active: !bill.active },
    });
  }
}

// Command layer
export const toggleBill = async (): Promise<void> => {
  try {
    const updatedBill = await billService.toggleBillStatus(id);
    displaySuccess("Bill status updated");
  } catch (error) {
    displayError("Failed to update bill status");
    console.error(error);
  }
};

// ❌ Bad: Service handles display
export class BillService {
  async toggleBillStatus(id: string): Promise<Bill | null> {
    const bill = await this.getBillById(id);
    if (!bill) {
      console.error("Bill not found"); // Wrong layer for this
      return null;
    }
    return this.prisma.bill.update({
      where: { id },
      data: { active: !bill.active },
    });
  }
}
```

### Resource Cleanup

**Rule**: Always cleanup resources (database connections) in CLI action handlers.

```typescript
// ✅ Good
program.command("bills:list").action(async (options) => {
  try {
    await listBills(options.activeOnly);
    await disconnectDatabase();
  } catch (error) {
    console.error(chalk.red("Error:"), error);
    await disconnectDatabase();
    process.exit(1);
  }
});

// ❌ Bad: Missing cleanup in error case
program.command("bills:list").action(async (options) => {
  await listBills(options.activeOnly);
  await disconnectDatabase();
});
```

---

## 7. Comments and Documentation

### General Comment Philosophy

**Rule**: Write self-documenting code. Use comments only to explain "why", not "what".

```typescript
// ✅ Good: Comment explains non-obvious reasoning
// month-1 because JavaScript Date uses 0-indexed months
const startDate = new Date(year, month - 1, 1);

// ✅ Good: Comment explains business logic
// Check if payment already exists to avoid duplicates
const existingPayment = await this.prisma.payment.findFirst({
  where: { billId: bill.id, year, month },
});

// ❌ Bad: Comment states the obvious
// Get all bills
const bills = await billService.getAllBills();

// ❌ Bad: Comment describes what code clearly shows
// Loop through payments
for (const payment of payments) {
  // ...
}
```

### Section Comments

**Rule**: Use simple section comments to organize code in main files.

```typescript
// ✅ Good
// Interactive menu
const showMainMenu = async (): Promise<void> => {
  // implementation
};

// CLI Commands
program.command("bills:list").description("List all bills");
```

### JSDoc Comments

**Rule**: JSDoc comments are optional. Rely on TypeScript types for documentation.

```typescript
// ✅ Good: Types provide documentation
export const listBills = async (activeOnly: boolean = false): Promise<void> => {
  const bills = await billService.getAllBills(activeOnly);
  displayBills(bills);
};

// ✅ Also good: JSDoc for complex public APIs (optional)
/**
 * Generates monthly payments for all active bills.
 * Skips bills that already have payments for the specified month.
 *
 * @param year - The year for payment generation
 * @param month - The month (1-12) for payment generation
 * @returns Array of newly created payments
 */
export async generateMonthlyPayments(
  year: number,
  month: number
): Promise<Payment[]> {
  // implementation
}
```

### TODO Comments

**Rule**: Use `TODO:` prefix for temporary notes. Include context and owner if applicable.

```typescript
// ✅ Good
// TODO: Add validation for future dates
// TODO: Refactor to use shared validation utility
// TODO(@username): Implement retry logic for network failures

// ❌ Bad
// fix this later
// HACK
// needs work
```

### Commented-Out Code

**Rule**: Delete commented-out code. Use version control instead.

```typescript
// ❌ Bad
export const listBills = async (): Promise<void> => {
  const bills = await billService.getAllBills();
  // const filteredBills = bills.filter(b => b.active);
  // console.log('Bills:', bills);
  displayBills(bills);
};

// ✅ Good
export const listBills = async (): Promise<void> => {
  const bills = await billService.getAllBills();
  displayBills(bills);
};
```

---

## 8. Class vs Functional Patterns

### Service Layer: Class-Based

**Rule**: Use classes for services that manage data access and business logic.

```typescript
// ✅ Good: Service layer uses classes
export class BillService {
  private prisma = getPrismaClient();

  async createBill(input: CreateBillInput): Promise<Bill> {
    return this.prisma.bill.create({ data: input });
  }

  async getAllBills(activeOnly: boolean = false): Promise<Bill[]> {
    return this.prisma.bill.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { dueDay: "asc" },
    });
  }

  async getBillById(id: string): Promise<Bill | null> {
    return this.prisma.bill.findUnique({ where: { id } });
  }
}
```

### Service Instantiation

**Rule**: Instantiate services once at module scope in command files.

```typescript
// ✅ Good: Single instance per module
const billService = new BillService();
const paymentService = new PaymentService();

export const listBills = async (): Promise<void> => {
  const bills = await billService.getAllBills();
  displayBills(bills);
};

// ❌ Bad: Creating new instances repeatedly
export const listBills = async (): Promise<void> => {
  const billService = new BillService();
  const bills = await billService.getAllBills();
  displayBills(bills);
};
```

### Command Layer: Functional

**Rule**: Use exported functions for commands that orchestrate between user input and services.

```typescript
// ✅ Good: Command layer uses functions
export const listBills = async (activeOnly: boolean = false): Promise<void> => {
  try {
    const bills = await billService.getAllBills(activeOnly);
    displayBills(bills);
  } catch (error) {
    displayError("Failed to fetch bills");
    console.error(error);
  }
};

export const addBill = async (): Promise<void> => {
  try {
    const answers = await inquirer.prompt([
      /* questions */
    ]);
    const newBill = await billService.createBill(answers);
    displaySuccess(`Bill "${newBill.name}" created successfully!`);
  } catch (error) {
    displayError("Failed to create bill");
    console.error(error);
  }
};

// ❌ Bad: Command layer as class
export class BillCommands {
  async listBills(): Promise<void> {}
  async addBill(): Promise<void> {}
}
```

**Rationale**: Commands are stateless and don't benefit from class structure.

### Utils Layer: Pure Functions

**Rule**: Use pure functions for utilities that format or transform data.

```typescript
// ✅ Good: Utils are pure functions
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

// ❌ Bad: Utils with state or side effects (except console output)
let cachedCurrency: string;
export const formatCurrency = (amount: number): string => {
  if (cachedCurrency) return cachedCurrency;
  cachedCurrency = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(amount);
  return cachedCurrency;
};
```

**Exception**: Display utilities that output to console are allowed side effects.

---

## 9. Async/Await Usage

### Consistent Async Pattern

**Rule**: Mark all I/O operations as async and use await consistently.

```typescript
// ✅ Good
export const listBills = async (activeOnly: boolean = false): Promise<void> => {
  const bills = await billService.getAllBills(activeOnly);
  displayBills(bills);
};

async createBill(input: CreateBillInput): Promise<Bill> {
  return await this.prisma.bill.create({ data: input });
}

// ❌ Bad: Mixing Promise and async/await
export const listBills = (activeOnly: boolean = false): Promise<void> => {
  return billService.getAllBills(activeOnly).then((bills) => {
    displayBills(bills);
  });
};
```

### Sequential vs Parallel Operations

**Rule**: Use sequential awaits for dependent operations, parallel for independent operations.

```typescript
// ✅ Good: Sequential for dependencies
const bill = await billService.getBillById(billId);
if (!bill) throw new Error("Bill not found");
const payment = await paymentService.createPayment({
  billId: bill.id,
  amount: bill.amount,
});

// ✅ Good: Parallel for independent operations
const [pendingPayments, overduePayments] = await Promise.all([
  paymentService.getPaymentsByStatus("PENDING"),
  paymentService.getPaymentsByStatus("OVERDUE"),
]);

// ❌ Bad: Sequential when parallel is possible
const pendingPayments = await paymentService.getPaymentsByStatus("PENDING");
const overduePayments = await paymentService.getPaymentsByStatus("OVERDUE");
```

### Array Operations

**Rule**: Use `for...of` loops for async operations on arrays. Avoid `forEach` with async.

```typescript
// ✅ Good: for...of with await
for (const bill of activeBills) {
  const payment = await paymentService.createPayment({
    billId: bill.id,
    amount: bill.amount,
  });
  payments.push(payment);
}

// ✅ Good: Promise.all for parallel async operations
const payments = await Promise.all(
  activeBills.map((bill) =>
    paymentService.createPayment({
      billId: bill.id,
      amount: bill.amount,
    })
  )
);

// ❌ Bad: forEach with async (doesn't wait)
activeBills.forEach(async (bill) => {
  const payment = await paymentService.createPayment({
    billId: bill.id,
    amount: bill.amount,
  });
});

// ✅ Good: forEach for synchronous operations
payments.forEach((payment) => {
  summary.total += payment.amount;
  if (payment.status === "PAID") {
    summary.paid += payment.amount;
  }
});
```

### Promise Return Types

**Rule**: Always annotate async functions with `Promise<T>` return type.

```typescript
// ✅ Good
async createBill(input: CreateBillInput): Promise<Bill> { }
async getAllBills(): Promise<Bill[]> { }
export const listBills = async (): Promise<void> => { };

// ❌ Bad: Missing Promise wrapper
async createBill(input: CreateBillInput): Bill { }
async getAllBills(): Bill[] { }
```

---

## 10. Formatting and Whitespace

### Indentation

**Rule**: Use 2 spaces for indentation (configured in editor/prettier).

```typescript
// ✅ Good
export const listBills = async (): Promise<void> => {
  try {
    const bills = await billService.getAllBills();
    displayBills(bills);
  } catch (error) {
    displayError("Failed to fetch bills");
  }
};

// ❌ Bad: 4 spaces or tabs
export const listBills = async (): Promise<void> => {
  try {
    const bills = await billService.getAllBills();
    displayBills(bills);
  } catch (error) {
    displayError("Failed to fetch bills");
  }
};
```

### Line Length

**Rule**: Prefer line length under 100 characters. Break long lines logically.

```typescript
// ✅ Good
const newBill = await billService.createBill({
  name: answers.name.trim(),
  type: answers.type,
  amount: answers.amount,
  dueDay: answers.dueDay,
  description: answers.description.trim() || undefined,
});

// ❌ Bad: Long line
const newBill = await billService.createBill({
  name: answers.name.trim(),
  type: answers.type,
  amount: answers.amount,
  dueDay: answers.dueDay,
  description: answers.description.trim() || undefined,
});
```

### Blank Lines

**Rule**: Use blank lines to separate logical sections.

```typescript
// ✅ Good
export const addBill = async (): Promise<void> => {
  try {
    const answers = await inquirer.prompt([
      /* questions */
    ]);

    const input: CreateBillInput = {
      name: answers.name.trim(),
      type: answers.type,
      amount: answers.amount,
      dueDay: answers.dueDay,
      description: answers.description.trim() || undefined,
    };

    const newBill = await billService.createBill(input);

    displaySuccess(`Bill "${newBill.name}" created successfully!`);
  } catch (error) {
    displayError("Failed to create bill");
    console.error(error);
  }
};

// ❌ Bad: No separation
export const addBill = async (): Promise<void> => {
  try {
    const answers = await inquirer.prompt([
      /* questions */
    ]);
    const input: CreateBillInput = {
      name: answers.name.trim(),
      type: answers.type,
      amount: answers.amount,
      dueDay: answers.dueDay,
      description: answers.description.trim() || undefined,
    };
    const newBill = await billService.createBill(input);
    displaySuccess(`Bill "${newBill.name}" created successfully!`);
  } catch (error) {
    displayError("Failed to create bill");
    console.error(error);
  }
};
```

### Trailing Commas

**Rule**: Use trailing commas in multi-line arrays, objects, and function parameters.

```typescript
// ✅ Good
const input: CreateBillInput = {
  name: answers.name.trim(),
  type: answers.type,
  amount: answers.amount,
  dueDay: answers.dueDay,
  description: answers.description.trim() || undefined,
};

const billTypes = ["RENT", "ELECTRICITY", "WATER", "GAS"];

// ❌ Bad: Missing trailing comma
const input: CreateBillInput = {
  name: answers.name.trim(),
  type: answers.type,
  amount: answers.amount,
  dueDay: answers.dueDay,
  description: answers.description.trim() || undefined,
};
```

**Rationale**: Trailing commas reduce git diffs and make adding new items easier.

### Semicolons

**Rule**: Use semicolons consistently at the end of statements.

```typescript
// ✅ Good
const bills = await billService.getAllBills();
displayBills(bills);

// ❌ Bad: Inconsistent semicolon usage
const bills = await billService.getAllBills();
displayBills(bills);
```

### String Quotes

**Rule**: Use single quotes for strings unless string contains single quotes.

```typescript
// ✅ Good
const message = "Bill created successfully";
const description = "User's monthly rent payment";

// ❌ Bad: Unnecessary double quotes
const message = "Bill created successfully";

// ✅ Good: Template literals for interpolation
const message = `Bill "${billName}" created successfully`;
```

---

## 11. Best Practices

### Input Validation and Sanitization

**Rule**: Always trim user input and provide validation in inquirer prompts.

```typescript
// ✅ Good
const answers = await inquirer.prompt([
  {
    type: "input",
    name: "name",
    message: "Bill name:",
    validate: (input: string) => {
      const trimmed = input.trim();
      return trimmed.length > 0 || "Bill name is required";
    },
  },
  {
    type: "number",
    name: "amount",
    message: "Amount:",
    validate: (input: number) => {
      return input > 0 || "Amount must be greater than 0";
    },
  },
]);

const input: CreateBillInput = {
  name: answers.name.trim(),
  description: answers.description.trim() || undefined,
  amount: answers.amount,
};

// ❌ Bad: No validation or trimming
const answers = await inquirer.prompt([
  {
    type: "input",
    name: "name",
    message: "Bill name:",
  },
]);
const input: CreateBillInput = {
  name: answers.name,
  description: answers.description,
};
```

### Defensive Programming

**Rule**: Check for null/undefined before operations. Use guard clauses.

```typescript
// ✅ Good: Guard clause
async toggleBillStatus(id: string): Promise<Bill> {
  const bill = await this.getBillById(id);
  if (!bill) {
    throw new Error('Bill not found');
  }

  return this.prisma.bill.update({
    where: { id },
    data: { active: !bill.active },
  });
}

// ❌ Bad: No null check
async toggleBillStatus(id: string): Promise<Bill> {
  const bill = await this.getBillById(id);
  return this.prisma.bill.update({
    where: { id },
    data: { active: !bill.active },
  });
}
```

### Ternary Operators

**Rule**: Use ternary operators for simple conditional expressions. Use if-else for complex logic.

```typescript
// ✅ Good: Simple ternary
const statusColor = bill.active ? chalk.green("Active") : chalk.red("Inactive");
const displayDate = payment.paidDate ? formatDate(payment.paidDate) : "-";

// ✅ Good: if-else for complex logic
let statusColor: string;
if (payment.status === "PAID") {
  statusColor = chalk.green("Paid");
} else if (payment.status === "OVERDUE") {
  statusColor = chalk.red("Overdue");
} else {
  statusColor = chalk.yellow("Pending");
}

// ❌ Bad: Nested ternaries
const statusColor =
  payment.status === "PAID"
    ? chalk.green("Paid")
    : payment.status === "OVERDUE"
    ? chalk.red("Overdue")
    : chalk.yellow("Pending");
```

### Database Query Patterns

**Rule**: Always include relationships when querying related data. Use Prisma's `include` option.

```typescript
// ✅ Good: Include related data
async getPaymentsByMonth(year: number, month: number): Promise<PaymentWithBill[]> {
  return this.prisma.payment.findMany({
    where: { year, month },
    include: { bill: true },
    orderBy: { dueDate: 'asc' },
  });
}

// ❌ Bad: Missing relationships (requires additional queries)
async getPaymentsByMonth(year: number, month: number): Promise<Payment[]> {
  return this.prisma.payment.findMany({
    where: { year, month },
    orderBy: { dueDate: 'asc' },
  });
}
```

### Date Handling

**Rule**: Always adjust for JavaScript's 0-indexed months. Add comments when doing date math.

```typescript
// ✅ Good: Explicit month adjustment with comment
// month-1 because JavaScript Date uses 0-indexed months
const startDate = new Date(year, month - 1, 1);
const endDate = new Date(year, month, 0); // Last day of month

// ❌ Bad: No adjustment or explanation
const startDate = new Date(year, month, 1);
```

### Singleton Pattern

**Rule**: Use singleton pattern for shared resources like database connections.

```typescript
// ✅ Good: Singleton Prisma client
let prisma: PrismaClient;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
  }
};

// ❌ Bad: Creating multiple instances
export const getPrismaClient = (): PrismaClient => {
  return new PrismaClient(); // Creates new instance every time
};
```

### CLI Output Styling

**Rule**: Use chalk consistently for colored output:

- `chalk.green()` - Success messages and active states
- `chalk.red()` - Error messages and inactive states
- `chalk.yellow()` - Warnings and pending states
- `chalk.cyan()` - Informational messages
- `chalk.blue()` - Generic info
- `chalk.bold()` - Emphasis

```typescript
// ✅ Good: Consistent color usage
displaySuccess(chalk.green(`Bill "${newBill.name}" created successfully!`));
displayError(chalk.red("Failed to fetch bills"));
const statusLabel = bill.active ? chalk.green("Active") : chalk.red("Inactive");
const statusLabel =
  payment.status === "PENDING" ? chalk.yellow("Pending") : chalk.green("Paid");

// ❌ Bad: Inconsistent colors
displaySuccess(chalk.blue(`Bill "${newBill.name}" created successfully!`));
const statusLabel = bill.active
  ? chalk.cyan("Active")
  : chalk.yellow("Inactive");
```

### Localization

**Rule**: Use configured locale (es-CO) for all currency and date formatting.

```typescript
// ✅ Good: Consistent locale
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

// ❌ Bad: Hardcoded or missing locale
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};
```

### Magic Numbers

**Rule**: Extract magic numbers to named constants or use descriptive variables.

```typescript
// ✅ Good: Named constants
const MIN_DUE_DAY = 1;
const MAX_DUE_DAY = 31;

const validateDueDay = (day: number): boolean => {
  return day >= MIN_DUE_DAY && day <= MAX_DUE_DAY;
};

// ✅ Also good: Inline for obvious values
if (dueDay < 1 || dueDay > 31) {
  throw new Error("Due day must be between 1 and 31");
}

// ❌ Bad: Unclear magic number
if (dueDay < 1 || dueDay > 31) {
  throw new Error("Invalid day");
}
```

### Avoid Premature Optimization

**Rule**: Write clear, readable code first. Optimize only when necessary and measured.

```typescript
// ✅ Good: Clear and readable
const unpaidPayments = [
  ...(await paymentService.getPaymentsByStatus("PENDING")),
  ...(await paymentService.getPaymentsByStatus("OVERDUE")),
];

// ❌ Bad: Premature optimization that hurts readability
const unpaidPayments = (
  await Promise.all([
    paymentService.getPaymentsByStatus("PENDING"),
    paymentService.getPaymentsByStatus("OVERDUE"),
  ])
).flat();
```

---

## Summary Checklist

When writing new code, ensure:

- [ ] **Naming**: camelCase for variables/functions, PascalCase for classes/types
- [ ] **Imports**: External first, internal second, all with `.js` extension
- [ ] **Exports**: Named exports only, no default exports
- [ ] **Types**: All parameters and return types explicitly annotated
- [ ] **Functions**: Arrow functions for commands/utils, standard methods for classes
- [ ] **Async**: All I/O operations use async/await consistently
- [ ] **Errors**: Try-catch blocks in commands, descriptive throws in services
- [ ] **Comments**: Minimal and explain "why", not "what"
- [ ] **Services**: Class-based with singleton pattern for shared resources
- [ ] **Commands**: Functional and stateless, orchestrate between user input and services
- [ ] **Utils**: Pure functions with no state (except console output)
- [ ] **Validation**: Trim user input and validate in inquirer prompts
- [ ] **Null checks**: Defensive programming with guard clauses
- [ ] **Formatting**: 2-space indentation, trailing commas, single quotes
- [ ] **Locale**: Use es-CO for all currency and date formatting
- [ ] **Cleanup**: Always disconnect database in CLI action handlers

---

## References

- **TypeScript Style Guide**: https://google.github.io/styleguide/tsguide.html
- **Airbnb JavaScript Style Guide**: https://github.com/airbnb/javascript
- **Prisma Best Practices**: https://www.prisma.io/docs/guides/performance-and-optimization
- **Commander.js Documentation**: https://github.com/tj/commander.js
- **Inquirer.js Documentation**: https://github.com/SBoudrias/Inquirer.js

---

This style guide is a living document. Update it as the project evolves and new patterns emerge.

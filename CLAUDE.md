# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

House Duties is a Node.js TypeScript console application for tracking rent and utility bills by month. It uses PostgreSQL (via Docker) with Prisma ORM, and provides both an interactive menu system and direct CLI commands.

## Essential Commands

### Development Setup (First Time)
```bash
pnpm install                # Install dependencies
pnpm db:start              # Start PostgreSQL container
pnpm db:generate           # Generate Prisma client
pnpm db:migrate            # Run database migrations
```

### Development
```bash
pnpm dev                   # Run in development mode (uses tsx)
pnpm build                 # Compile TypeScript to dist/
pnpm start                 # Run compiled version

# Running specific commands in dev mode
pnpm dev bills:list
pnpm dev payments:generate
pnpm dev summary
```

### Database Management
```bash
pnpm db:start              # Start PostgreSQL container
pnpm db:stop               # Stop PostgreSQL container
pnpm db:studio             # Open Prisma Studio (visual database editor)
pnpm db:reset              # Reset database (deletes all data)
```

### Docker (Alternative Deployment)
```bash
pnpm docker:run            # Build and start all services
pnpm docker:stop           # Stop services
pnpm docker:logs           # View logs
pnpm docker:exec           # Execute commands in container
```

## Architecture

### Entry Point Flow
The application (`src/index.ts`) uses Commander.js to provide two modes:
1. **Interactive Menu**: When run without arguments (`pnpm dev`), shows an inquirer-based menu
2. **Direct CLI Commands**: When run with specific commands (e.g., `bills:list`, `payments:generate`)

All commands properly handle database disconnection on exit using `disconnectDatabase()`.

### Core Domain Models

**Bill**: Represents a recurring expense (rent, utilities, etc.)
- Has a `type` (RENT, ELECTRICITY, WATER, GAS, INTERNET, PHONE, OTHER)
- Has a `dueDay` (1-31) indicating when it's due each month
- Can be marked `active` or inactive (inactive bills aren't used for payment generation)

**Payment**: Represents a specific month's payment for a bill
- Linked to a Bill via `billId` with cascade delete
- Has a `status` (PENDING, PAID, OVERDUE)
- Generated automatically from active bills via `generateMonthlyPayments()`

### Key Service Layer Patterns

**BillService** (`src/services/billService.ts`):
- Standard CRUD operations for bills
- All queries use the shared Prisma client from `getPrismaClient()`
- Lists are ordered by `dueDay` ascending

**PaymentService** (`src/services/paymentService.ts`):
- CRUD operations plus specialized queries
- `generateMonthlyPayments(year, month)`: Creates payments for all active bills for a given month, skipping duplicates
- `updateOverduePayments()`: Automatically marks PENDING payments past due date as OVERDUE
- `getPaymentsSummary(year, month)`: Calculates total, paid, pending, and overdue amounts
- All payment queries include related bill data via `{ include: { bill: true } }`

### Command Layer Pattern

Commands (`src/commands/billCommands.ts`, `src/commands/paymentCommands.ts`) follow this pattern:
1. Use inquirer.js to prompt for user input
2. Call service layer methods
3. Use display utilities (chalk, cli-table3) to show results
4. Return to caller (which handles database cleanup)

### Database Connection Management

- Single Prisma client instance created in `src/services/database.ts` via `getPrismaClient()`
- All services import and use this shared instance
- Always call `disconnectDatabase()` before process exit
- The database runs in a Docker container defined in `docker-compose.yml`

### File Naming Conventions

- Services: `*Service.ts` (use classes with methods)
- Commands: `*Commands.ts` (use exported async functions)
- All imports use `.js` extension (required for ES modules even with TypeScript)

## Prisma Schema Notes

The schema (`prisma/schema.prisma`) uses:
- UUID strings for all IDs
- Enums for BillType and PaymentStatus
- Cascade delete: deleting a Bill deletes all related Payments
- Indexes on: `billId`, `dueDate`, `status` for performance
- `@@map()` directive maps models to lowercase plural table names

## Important Quirks

1. **ES Modules**: This project uses `"type": "module"` in package.json. All imports must include `.js` extension even for TypeScript files.

2. **Month Handling**: JavaScript dates are 0-indexed (January = 0), but users expect 1-indexed months. Service layer handles this correctly:
   ```typescript
   const startDate = new Date(year, month - 1, 1);  // month-1 for JS Date
   ```

3. **Due Day Edge Cases**: Bills with `dueDay: 31` will use the last day of months with fewer than 31 days (JavaScript Date handles this automatically).

4. **Payment Generation**: `generateMonthlyPayments()` checks for existing payments to avoid duplicates, so it's safe to call multiple times for the same month.

5. **Interactive Menu Loop**: The main menu recursively calls itself after each action completes if the user confirms "Continue?".

## Package Manager

This project uses **pnpm** (specified in `packageManager` field). Always use `pnpm` commands, not `npm` or `yarn`.

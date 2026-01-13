# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See @.claude/rules/code-style.md for code styling conventions and @.claude/rules/testing.md for testing standards.

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

## Project Overview

House Duties is a Node.js TypeScript console application for tracking rent and utility bills by month. It uses PostgreSQL (via Docker) with Prisma ORM, and provides both an interactive menu system and direct CLI commands. Currency and date formatting is configured for Colombian locale (es-CO, COP).

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
pnpm dev bills:list --active-only
pnpm dev payments:list --month 12 --year 2024
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

### Docker (Full Deployment)

```bash
pnpm docker:build          # Build Docker image
pnpm docker:run            # Build and start all services (postgres + app)
pnpm docker:stop           # Stop services
pnpm docker:logs           # View app logs
pnpm docker:exec           # Execute shell in container
```

## Architecture

### Entry Point Flow

The application (`src/index.ts`) uses Commander.js to provide two modes:

1. **Interactive Menu**: When run without arguments (`pnpm dev`), shows an inquirer-based menu
2. **Direct CLI Commands**: When run with specific commands (e.g., `bills:list`, `payments:generate`)

All commands properly handle database disconnection on exit using `disconnectDatabase()`.

### Project Structure

```
house-duties/
├── src/
│   ├── commands/           # CLI command implementations
│   │   ├── billCommands.ts     # CRUD + list operations for bills
│   │   └── paymentCommands.ts  # CRUD + generate + summary for payments
│   ├── services/           # Business logic layer
│   │   ├── database.ts         # Prisma client singleton
│   │   ├── billService.ts      # Bill CRUD operations
│   │   └── paymentService.ts   # Payment operations + monthly generation
│   ├── utils/              # Helper functions
│   │   ├── display.ts          # Table rendering with cli-table3 & chalk
│   │   ├── formatters.ts       # Currency/date/status formatting (es-CO locale)
│   │   └── version.ts          # Dynamic version from package.json
│   └── index.ts            # Main entry point with Commander.js
├── prisma/
│   └── schema.prisma       # Database schema
├── docs/
│   ├── QUICKSTART.md       # Quick start guide
│   └── DOCKER.md           # Docker deployment documentation
├── Dockerfile              # Multi-stage build for production
├── docker-compose.yml      # PostgreSQL + app services
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

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

- Standard CRUD operations for bills (create, getAllBills, getBillById, getBillByName, update, delete)
- `toggleBillStatus()` to quickly activate/deactivate a bill
- All queries use the shared Prisma client from `getPrismaClient()`
- Lists are ordered by `dueDay` ascending

**PaymentService** (`src/services/paymentService.ts`):

- CRUD operations plus specialized queries
- `generateMonthlyPayments(year, month)`: Creates payments for all active bills for a given month, skipping duplicates
- `updateOverduePayments()`: Automatically marks PENDING payments past due date as OVERDUE
- `getPaymentsSummary(year, month)`: Calculates total, paid, pending, and overdue amounts
- `getPaymentsByStatus(status)`: Filter payments by PENDING, PAID, or OVERDUE
- All payment queries include related bill data via `{ include: { bill: true } }`

### Command Layer Pattern

Commands (`src/commands/billCommands.ts`, `src/commands/paymentCommands.ts`) follow this pattern:

1. Use inquirer.js to prompt for user input with validation
2. Call service layer methods
3. Use display utilities (chalk, cli-table3) to show results
4. Return to caller (which handles database cleanup)

Available exports from `billCommands.ts`: `listBills`, `addBill`, `updateBill`, `deleteBill`
Available exports from `paymentCommands.ts`: `listPayments`, `addPayment`, `updatePayment`, `markPaymentAsPaid`, `deletePayment`, `generateMonthlyPayments`, `showMonthlySummary`

### Database Connection Management

- Single Prisma client instance created in `src/services/database.ts` via `getPrismaClient()`
- All services import and use this shared instance
- Always call `disconnectDatabase()` before process exit
- The database runs in a Docker container defined in `docker-compose.yml`
- Default connection: `postgresql://postgres:postgres@localhost:5432/house_duties`

### Display & Formatting Utilities

**display.ts** provides:

- `displayBills()` - Renders bills in a table format
- `displayPayments()` - Renders payments with bill info in a table
- `displaySummary()` - Shows total, paid, pending, overdue amounts
- `displaySuccess()`, `displayError()`, `displayInfo()`, `displayWarning()` - Styled console messages

**formatters.ts** provides (Colombian locale):

- `formatCurrency()` - Formats as COP currency
- `formatDate()` - Formats as es-CO short date
- `formatMonth()` - Formats as full month name + year
- `formatBillType()` - Maps enum to readable names
- `formatPaymentStatus()` - Colored status indicators

### File Naming Conventions

- Services: `*Service.ts` (use classes with static-like methods via class instances)
- Commands: `*Commands.ts` (use exported async functions)
- All imports use `.js` extension (required for ES modules even with TypeScript)

## Prisma Schema Notes

The schema (`prisma/schema.prisma`) uses:

- UUID strings for all IDs (`@default(uuid())`)
- Enums for BillType and PaymentStatus
- Cascade delete: deleting a Bill deletes all related Payments
- Indexes on: `billId`, `dueDate`, `status` for query performance
- `@@map()` directive maps models to lowercase plural table names (`bills`, `payments`)

## Important Quirks

1. **ES Modules**: This project uses `"type": "module"` in package.json. All imports must include `.js` extension even for TypeScript files.

2. **Month Handling**: JavaScript dates are 0-indexed (January = 0), but users expect 1-indexed months. Service layer handles this correctly:

   ```typescript
   const startDate = new Date(year, month - 1, 1); // month-1 for JS Date
   ```

3. **Due Day Edge Cases**: Bills with `dueDay: 31` will use the last day of months with fewer than 31 days (JavaScript Date handles this automatically).

4. **Payment Generation**: `generateMonthlyPayments()` checks for existing payments to avoid duplicates, so it's safe to call multiple times for the same month.

5. **Interactive Menu Loop**: The main menu recursively calls itself after each action completes if the user confirms "Continue?".

6. **TypeScript Target**: Compiles to ES2020 with ESNext modules, outputting to `dist/` directory with source maps and declaration files.

7. **Strict TypeScript**: Uses strict mode with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`.

## Docker Configuration

### Multi-stage Dockerfile

- **Stage 1 (deps)**: Installs dependencies with pnpm
- **Stage 2 (test)**: Runs unit tests (build fails if tests fail), supports SKIP_TESTS build arg
- **Stage 3 (builder)**: Inherits from test stage, builds TypeScript
- **Stage 4 (runner)**: Production image with non-root user, minimal dependencies

### Docker Compose Services

- **postgres**: PostgreSQL 16 Alpine with health checks, persistent volume
- **app**: House Duties app, waits for healthy postgres, runs migrations on startup

## Package Manager

This project uses **pnpm** (specified in `packageManager` field as pnpm@10.25.0). Always use `pnpm` commands, not `npm` or `yarn`.

## Testing

### Testing Framework and Standards

The project uses **Vitest** for unit testing with comprehensive coverage standards:

- **Test Location**: Tests are co-located with source files using `.test.ts` suffix
- **Current Coverage**:
  - `formatters.ts`: 509 lines of tests covering all formatting functions
  - `version.ts`: 532 lines of tests with extensive edge case coverage
- **Test Structure**: AAA pattern (Arrange, Act, Assert) with descriptive test names
- **Coverage Targets**:
  - Services: 80%+ (business logic)
  - Utils: 90%+ (pure functions)
  - Commands: 60%+ (integration points)

### Running Tests

```bash
pnpm test              # Run all tests
pnpm test:ui           # Run tests with UI
pnpm test:coverage     # Run tests with coverage report
```

### Testing in CI/CD

The Docker build pipeline includes automated testing:
- **Stage 2 (test)**: Runs all unit tests during image build
- **Build fails if tests fail**: Ensures only tested code is deployed
- **Skip tests**: Use `--build-arg SKIP_TESTS=true` (emergency only, not recommended)

See `.claude/rules/testing.md` for detailed testing conventions and best practices.

### Test Files

Current test coverage:
- `src/utils/formatters.test.ts`: Currency, date, month, bill type, and payment status formatting
- `src/utils/version.test.ts`: Version extraction with edge cases and error handling

## Claude Code Features

### Skills

The project includes custom skills for code quality and development workflow:

- **commit-helper**: Generates clear commit messages from git diffs
- **code-reviewer**: Reviews code for best practices and potential issues
- **unit-test-writer**: Writes comprehensive unit tests for functions and classes

Use skills with the `/` prefix in Claude Code CLI (e.g., `/commit-helper`).

### Agents

Custom agents are available for specialized tasks:

- **code-reviewer**: Automated code review with suggestions
- **task-planner**: Breaks down development tasks into actionable steps
- **unit-test-generator**: Creates comprehensive test suites with edge cases

Agents are defined in `.claude/agents/` directory.

### Code Style and Testing Rules

- **Code Style**: See `.claude/rules/code-style.md` for comprehensive coding standards
- **Testing Standards**: See `.claude/rules/testing.md` for testing conventions

## CLI Commands Reference

```bash
# Interactive mode (default)
pnpm dev                    # or: pnpm dev interactive, pnpm dev i

# Bills
pnpm dev bills:list         # List all bills
pnpm dev bills:list -a      # List active bills only
pnpm dev bills:add          # Add new bill
pnpm dev bills:update       # Update existing bill
pnpm dev bills:delete       # Delete bill (cascades to payments)

# Payments
pnpm dev payments:list              # List current month payments
pnpm dev payments:list -m 12 -y 2024  # List specific month
pnpm dev payments:add               # Add payment manually
pnpm dev payments:update            # Update payment
pnpm dev payments:mark-paid         # Mark payment as paid
pnpm dev payments:delete            # Delete payment
pnpm dev payments:generate          # Generate payments from active bills

# Summary
pnpm dev summary            # Show monthly summary with totals
```

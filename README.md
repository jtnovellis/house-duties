# House Duties - Bill Tracker

A friendly console application to track rent and utility bills by month, built with Node.js, TypeScript, and PostgreSQL.

## Features

- Track recurring bills (rent, electricity, water, gas, internet, etc.)
- Manage monthly payments with status tracking (Paid, Pending, Overdue)
- Generate monthly payments automatically from active bills
- Interactive console UI with user-friendly prompts
- Monthly summary with payment statistics
- Full CRUD operations for bills and payments
- PostgreSQL database with Prisma ORM

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Database:** PostgreSQL (via Docker)
- **ORM:** Prisma
- **CLI Framework:** Commander.js
- **Interactive Prompts:** Inquirer.js
- **UI Styling:** Chalk, cli-table3

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- pnpm (recommended) or npm

## Installation

1. Clone the repository:

```bash
cd house-duties
```

2. Install dependencies:

```bash
pnpm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Start PostgreSQL database:

```bash
pnpm db:start
```

5. Run Prisma migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

## Usage

### Option 1: Docker (Recommended for Production)

The easiest way to run the application is using Docker:

```bash
# Build and start all services
pnpm docker:run

# View logs
pnpm docker:logs

# Stop services
pnpm docker:stop
```

See [docs/DOCKER.md](DOCKER.md) for detailed Docker documentation.

### Option 2: Local Development

### Interactive Mode (Recommended)

Simply run the application without any arguments to start the interactive menu:

```bash
pnpm dev
```

Or build and run:

```bash
pnpm build
pnpm start
```

### CLI Commands

You can also use specific commands directly:

#### Bills Management

```bash
# List all bills
pnpm dev bills:list

# List only active bills
pnpm dev bills:list --active-only

# Add a new bill
pnpm dev bills:add

# Update a bill
pnpm dev bills:update

# Delete a bill
pnpm dev bills:delete
```

#### Payments Management

```bash
# List payments for current month
pnpm dev payments:list

# List payments for specific month
pnpm dev payments:list --month 12 --year 2024

# Add a new payment
pnpm dev payments:add

# Update a payment
pnpm dev payments:update

# Mark payment as paid
pnpm dev payments:mark-paid

# Delete a payment
pnpm dev payments:delete

# Generate monthly payments from active bills
pnpm dev payments:generate
```

#### Summary

```bash
# Show monthly summary
pnpm dev summary
```

## Database Management

```bash
# Start database
pnpm db:start

# Stop database
pnpm db:stop

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Reset database (WARNING: This will delete all data)
pnpm db:reset

# Open Prisma Studio (GUI for database)
pnpm db:studio
```

## Project Structure

```
house-duties/
├── src/
│   ├── commands/           # CLI command implementations
│   │   ├── billCommands.ts
│   │   └── paymentCommands.ts
│   ├── services/           # Business logic
│   │   ├── database.ts
│   │   ├── billService.ts
│   │   └── paymentService.ts
│   ├── utils/             # Helper functions
│   │   ├── formatters.ts
│   │   └── display.ts
│   └── index.ts           # Main entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── docker-compose.yml     # PostgreSQL container
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies

```

## Database Schema

### Bills Table

- `id`: UUID (Primary Key)
- `name`: String (Bill name, e.g., "Electric Company")
- `type`: Enum (RENT, ELECTRICITY, WATER, GAS, INTERNET, PHONE, OTHER)
- `amount`: Float (Default amount)
- `dueDay`: Integer (Day of month 1-31)
- `description`: String (Optional)
- `active`: Boolean (Whether bill is currently active)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Payments Table

- `id`: UUID (Primary Key)
- `billId`: UUID (Foreign Key to Bills)
- `amount`: Float
- `status`: Enum (PENDING, PAID, OVERDUE)
- `dueDate`: DateTime
- `paidDate`: DateTime (Optional)
- `notes`: String (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Workflow Example

1. **Add your recurring bills:**

   - Run the app and select "Add Bill"
   - Enter details like Rent ($1500, due on day 1)
   - Add all your utility bills

2. **Generate monthly payments:**

   - Select "Generate Monthly Payments"
   - Choose the month/year
   - The app creates payment entries for all active bills

3. **Track payment status:**

   - Use "Show Monthly Summary" to see all payments
   - Mark payments as paid when you pay them
   - Overdue payments are automatically flagged

4. **Review your finances:**
   - Monthly summary shows total, paid, pending, and overdue amounts
   - Use filters to view specific months or payment statuses

## Development

```bash
# Run in development mode with hot reload
pnpm dev

# Build the project
pnpm build

# Run built version
pnpm start
```

## Tips

- Bills marked as "inactive" won't appear in monthly payment generation
- The app automatically marks pending payments as "overdue" when viewing summaries
- You can customize bill amounts per payment if needed
- Use the monthly summary to track your spending patterns

## Troubleshooting

**Module not found errors:**

- Make sure you've run `pnpm install` first
- The project uses ES Modules - ensure `"type": "module"` is in package.json

**Database connection issues:**

- Ensure Docker is running: `docker ps`
- Check if PostgreSQL container is healthy: `docker-compose ps`
- Verify DATABASE_URL in `.env` file
- Make sure PostgreSQL is accessible: `docker logs house-duties-db`

**Prisma errors:**

- Regenerate Prisma client: `pnpm db:generate`
- Run migrations: `pnpm db:migrate`
- If migration fails, ensure database is running: `pnpm db:start`

**Build errors:**

- Clear dist folder and rebuild: `rm -rf dist && pnpm build`
- Ensure all dependencies are installed: `pnpm install`

## License

MIT

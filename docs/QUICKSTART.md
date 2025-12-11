# Quick Start Guide

Get up and running with House Duties in 5 minutes!

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Start the Database

```bash
pnpm db:start
```

Wait a few seconds for PostgreSQL to start. You can verify it's running with:
```bash
docker ps
```

## Step 3: Setup the Database

```bash
pnpm db:generate
pnpm db:migrate
```

When prompted for a migration name, you can use: `init`

## Step 4: Run the Application

```bash
pnpm dev
```

This will open the interactive menu where you can:
1. Add your first bill (e.g., Rent)
2. Generate monthly payments
3. Track and manage your bills

## Example First-Time Usage

1. **Add a Rent Bill:**
   - Select "Add Bill"
   - Name: "Monthly Rent"
   - Type: RENT
   - Amount: 1500
   - Due Day: 1
   - Description: "Apartment rent"

2. **Add a Utility Bill:**
   - Select "Add Bill"
   - Name: "Electricity"
   - Type: ELECTRICITY
   - Amount: 150
   - Due Day: 15

3. **Generate This Month's Payments:**
   - Select "Generate Monthly Payments"
   - Enter current month (e.g., 2024-12)
   - This creates payment entries for all your active bills

4. **View Monthly Summary:**
   - Select "Show Monthly Summary"
   - See all your bills, payment status, and totals

5. **Mark a Payment as Paid:**
   - Select "Mark Payment as Paid"
   - Choose the bill you paid
   - Enter the date you paid it

## Stopping the Application

- Press `Ctrl+C` or select "Exit" from the menu
- To stop the database: `pnpm db:stop`

## Useful Commands

- `pnpm db:studio` - Open Prisma Studio (visual database editor)
- `pnpm db:reset` - Reset database (WARNING: deletes all data)
- `pnpm build` - Build for production
- `pnpm start` - Run production build

## Next Steps

- Add all your recurring bills
- Generate payments for the next few months
- Set a reminder to check your payments regularly
- Use the monthly summary to track your expenses

Enjoy tracking your bills!

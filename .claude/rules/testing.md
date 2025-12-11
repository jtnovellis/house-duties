---
paths: src/**/*.{test,spec}.ts
---

# Testing Conventions - House Duties

This document defines testing standards and best practices for the House Duties project.

## Testing Framework

Use **Vitest** as the testing framework (recommended for TypeScript ES modules).

### Setup

```bash
pnpm add -D vitest @vitest/ui
```

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## File Organization

### Test File Naming

**Rule**: Use `.test.ts` suffix for all test files.

```
✅ Good
src/services/billService.test.ts
src/utils/formatters.test.ts

❌ Bad
src/services/billService.spec.ts
src/services/__tests__/billService.ts
tests/billService.test.ts
```

### Test File Location

**Rule**: Place test files adjacent to the code they test.

```
src/
├── services/
│   ├── billService.ts
│   ├── billService.test.ts
│   ├── paymentService.ts
│   └── paymentService.test.ts
├── utils/
│   ├── formatters.ts
│   └── formatters.test.ts
```

---

## Test Structure

### Describe Blocks

**Rule**: Use `describe` for grouping related tests. Mirror the structure being tested.

```typescript
// ✅ Good
describe("BillService", () => {
  describe("createBill", () => {
    it("should create a new bill with valid input", () => {});
    it("should throw error when name is empty", () => {});
  });

  describe("getAllBills", () => {
    it("should return all bills when activeOnly is false", () => {});
    it("should return only active bills when activeOnly is true", () => {});
  });
});

// ❌ Bad: Flat structure
describe("BillService", () => {
  it("should create a new bill", () => {});
  it("should get all bills", () => {});
  it("should get active bills", () => {});
});
```

### Test Naming

**Rule**: Use descriptive test names following the pattern: "should [expected behavior] when [condition]"

```typescript
// ✅ Good
it("should format amount as COP currency", () => {});
it("should return null when bill is not found", () => {});
it("should throw error when amount is negative", () => {});

// ❌ Bad
it("works", () => {});
it("test formatCurrency", () => {});
it("should format correctly", () => {});
```

### AAA Pattern (Arrange, Act, Assert)

**Rule**: Structure tests using the Arrange-Act-Assert pattern with blank lines between sections.

```typescript
// ✅ Good
it("should create a new bill with valid input", async () => {
  // Arrange
  const input: CreateBillInput = {
    name: "Rent",
    type: BillType.RENT,
    amount: 1000000,
    dueDay: 5,
  };

  // Act
  const result = await billService.createBill(input);

  // Assert
  expect(result).toBeDefined();
  expect(result.name).toBe("Rent");
  expect(result.amount).toBe(1000000);
});

// ❌ Bad: No clear separation
it("should create a new bill with valid input", async () => {
  const input = {
    name: "Rent",
    type: BillType.RENT,
    amount: 1000000,
    dueDay: 5,
  };
  const result = await billService.createBill(input);
  expect(result).toBeDefined();
  expect(result.name).toBe("Rent");
});
```

---

## Mocking and Setup

### Database Mocking

**Rule**: Mock Prisma client for unit tests. Use test database for integration tests.

```typescript
// ✅ Good: Unit test with mock
import { vi } from "vitest";
import { BillService } from "./billService.js";

vi.mock("./database.js", () => ({
  getPrismaClient: vi.fn(() => ({
    bill: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  })),
}));

describe("BillService", () => {
  let billService: BillService;

  beforeEach(() => {
    billService = new BillService();
    vi.clearAllMocks();
  });

  it("should create a bill", async () => {
    const mockBill = { id: "1", name: "Rent", amount: 1000 };
    vi.mocked(billService["prisma"].bill.create).mockResolvedValue(mockBill);

    const result = await billService.createBill({
      name: "Rent",
      amount: 1000,
    });

    expect(result).toEqual(mockBill);
  });
});
```

### Setup and Teardown

**Rule**: Use `beforeEach` for test setup and `afterEach` for cleanup.

```typescript
// ✅ Good
describe("BillService", () => {
  let billService: BillService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      bill: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };
    billService = new BillService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // tests...
});
```

---

## Assertions

### Specific Assertions

**Rule**: Use specific assertions over generic ones.

```typescript
// ✅ Good
expect(bill.name).toBe("Rent");
expect(bill.amount).toBeGreaterThan(0);
expect(bills).toHaveLength(3);
expect(result).toBeNull();
expect(() => service.create({})).toThrow("Invalid input");

// ❌ Bad
expect(bill.name === "Rent").toBe(true);
expect(bill.amount > 0).toBeTruthy();
expect(bills.length === 3).toBe(true);
```

### Async Testing

**Rule**: Always await async operations and use async matchers.

```typescript
// ✅ Good
it("should create a bill", async () => {
  const result = await billService.createBill(input);
  expect(result).toBeDefined();
});

it("should reject invalid input", async () => {
  await expect(billService.createBill({})).rejects.toThrow();
});

// ❌ Bad: Missing await
it("should create a bill", () => {
  const result = billService.createBill(input);
  expect(result).toBeDefined(); // Won't work - result is a Promise
});
```

---

## Test Coverage

### Coverage Targets

**Rule**: Aim for the following coverage targets:

- **Services**: 80%+ coverage (business logic)
- **Utils**: 90%+ coverage (pure functions)
- **Commands**: 60%+ coverage (integration points)

### What to Test

**Rule**: Prioritize testing:

1. ✅ Business logic (services)
2. ✅ Data transformations (utils)
3. ✅ Edge cases and error handling
4. ✅ Integration points (API, database)
5. ❌ Don't test: Third-party libraries, trivial getters/setters

```typescript
// ✅ Good: Test business logic
describe("formatCurrency", () => {
  it("should format amount with Colombian locale", () => {
    expect(formatCurrency(1000000)).toBe("$1.000.000");
  });

  it("should handle zero amount", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("should handle negative amounts", () => {
    expect(formatCurrency(-500)).toBe("-$500");
  });
});

// ❌ Bad: Testing library behavior
describe("Prisma client", () => {
  it("should connect to database", () => {
    // Don't test Prisma's connection logic
  });
});
```

---

## Best Practices

### Test Independence

**Rule**: Tests should be independent and runnable in any order.

```typescript
// ✅ Good: Each test is independent
describe("BillService", () => {
  it("should create a bill", async () => {
    const bill = await billService.createBill(mockInput);
    expect(bill).toBeDefined();
  });

  it("should get all bills", async () => {
    // Doesn't depend on previous test
    mockPrisma.bill.findMany.mockResolvedValue([mockBill1, mockBill2]);
    const bills = await billService.getAllBills();
    expect(bills).toHaveLength(2);
  });
});

// ❌ Bad: Tests depend on each other
describe("BillService", () => {
  let createdBillId: string;

  it("should create a bill", async () => {
    const bill = await billService.createBill(mockInput);
    createdBillId = bill.id; // State shared between tests
  });

  it("should get bill by id", async () => {
    const bill = await billService.getBillById(createdBillId); // Depends on previous test
    expect(bill).toBeDefined();
  });
});
```

### Test Data Factories

**Rule**: Use factory functions for creating test data.

```typescript
// ✅ Good: Factory functions
const createMockBill = (overrides?: Partial<Bill>): Bill => ({
  id: "test-id",
  name: "Test Bill",
  type: BillType.RENT,
  amount: 1000,
  dueDay: 5,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("BillService", () => {
  it("should update inactive bills", async () => {
    const inactiveBill = createMockBill({ active: false });
    // test...
  });

  it("should handle high amounts", async () => {
    const expensiveBill = createMockBill({ amount: 10000000 });
    // test...
  });
});

// ❌ Bad: Duplicated test data
describe("BillService", () => {
  it("should update inactive bills", async () => {
    const bill = {
      id: "1",
      name: "Test",
      type: BillType.RENT,
      amount: 1000,
      dueDay: 5,
      active: false,
      // ... repeated in every test
    };
  });
});
```

### Error Testing

**Rule**: Test both success and error paths.

```typescript
// ✅ Good: Tests both paths
describe("toggleBillStatus", () => {
  it("should toggle bill status when bill exists", async () => {
    mockPrisma.bill.findUnique.mockResolvedValue(mockBill);
    mockPrisma.bill.update.mockResolvedValue({ ...mockBill, active: false });

    const result = await billService.toggleBillStatus("test-id");
    expect(result.active).toBe(false);
  });

  it("should throw error when bill not found", async () => {
    mockPrisma.bill.findUnique.mockResolvedValue(null);

    await expect(billService.toggleBillStatus("invalid-id")).rejects.toThrow(
      "Bill not found"
    );
  });
});
```

### Don't Test Implementation Details

**Rule**: Test behavior, not implementation.

```typescript
// ✅ Good: Tests behavior
it("should return only active bills", async () => {
  const result = await billService.getAllBills(true);
  expect(result.every((bill) => bill.active)).toBe(true);
});

// ❌ Bad: Tests implementation
it("should call findMany with correct parameters", async () => {
  await billService.getAllBills(true);
  expect(mockPrisma.bill.findMany).toHaveBeenCalledWith({
    where: { active: true },
    orderBy: { dueDay: "asc" },
  });
});
```

---

## Integration Tests

### Database Tests

**Rule**: Use a separate test database for integration tests.

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
});
```

```typescript
// tests/setup.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean database after each test
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
});
```

---

## Summary Checklist

When writing tests, ensure:

- [ ] Test files use `.test.ts` suffix and are co-located with source files
- [ ] Use `describe` blocks to group related tests
- [ ] Test names follow "should [behavior] when [condition]" pattern
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Mock external dependencies (Prisma, file system, etc.)
- [ ] Use `beforeEach`/`afterEach` for setup and cleanup
- [ ] Use specific assertions (`toBe`, `toEqual`, `toThrow`)
- [ ] Always await async operations
- [ ] Tests are independent and can run in any order
- [ ] Test both success and error paths
- [ ] Use factory functions for test data
- [ ] Don't test implementation details
- [ ] Aim for 80%+ coverage on services, 90%+ on utils

---

## Example Test File

```typescript
// src/utils/formatters.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "./formatters.js";

describe("formatters", () => {
  describe("formatCurrency", () => {
    it("should format amount as COP currency with Colombian locale", () => {
      const result = formatCurrency(1000000);
      expect(result).toContain("1.000.000");
    });

    it("should handle zero amount", () => {
      const result = formatCurrency(0);
      expect(result).toContain("0");
    });

    it("should handle decimal amounts", () => {
      const result = formatCurrency(1500.5);
      expect(result).toContain("1.500");
    });
  });

  describe("formatDate", () => {
    it("should format date with Colombian locale", () => {
      const date = new Date("2024-12-11");
      const result = formatDate(date);
      expect(result).toMatch(/\d{1,2}.*\d{4}/);
    });

    it("should handle current date", () => {
      const result = formatDate(new Date());
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
```

---

## References

- **Vitest Documentation**: https://vitest.dev/
- **Testing Best Practices**: https://testingjavascript.com/
- **Prisma Testing**: https://www.prisma.io/docs/guides/testing

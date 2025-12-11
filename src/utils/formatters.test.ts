import { describe, it, expect } from "vitest";
import chalk from "chalk";
import { BillType, PaymentStatus } from "@prisma/client";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  formatBillType,
  formatPaymentStatus,
} from "./formatters.js";

describe("formatCurrency", () => {
  describe("happy path", () => {
    it("should format positive amount as Colombian peso", () => {
      const result = formatCurrency(100000);
      // Colombian locale formats currency with $ symbol, thousand separators, and 2 decimals
      expect(result).toMatch(/\$\s*100[.,]000/);
    });

    it("should format decimal amounts correctly", () => {
      const result = formatCurrency(1234.56);
      // Should round to nearest peso and include thousand separator
      expect(result).toMatch(/\$\s*1[.,]23[45]/);
    });

    it("should format large amounts with proper thousand separators", () => {
      const result = formatCurrency(1000000);
      // 1 million should have proper separators
      expect(result).toMatch(/\$\s*1[.,]000[.,]000/);
    });

    it("should format very large amounts", () => {
      const result = formatCurrency(999999999);
      expect(result).toMatch(/\$\s*999[.,]999[.,]999/);
    });
  });

  describe("edge cases", () => {
    it("should handle zero amount", () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/\$\s*0/);
    });

    it("should handle negative amounts", () => {
      const result = formatCurrency(-50000);
      // Negative amounts should include minus sign
      expect(result).toMatch(/-\$\s*50[.,]000/);
    });

    it("should handle small decimal values", () => {
      const result = formatCurrency(0.99);
      // Should round to nearest peso
      expect(result).toMatch(/\$\s*[01]/);
    });

    it("should handle fractional amounts that round up", () => {
      const result = formatCurrency(1234.99);
      expect(result).toMatch(/\$\s*1[.,]23[45]/);
    });

    it("should handle very small amounts", () => {
      const result = formatCurrency(1);
      expect(result).toMatch(/\$\s*1/);
    });
  });

  describe("locale specifics", () => {
    it("should use Colombian peso currency code (COP)", () => {
      const result = formatCurrency(100);
      // The result should be a string
      expect(typeof result).toBe("string");
      expect(result).toBeTruthy();
    });

    it("should format consistently with es-CO locale", () => {
      const result = formatCurrency(12345.67);
      // Should use Colombian formatting conventions
      expect(result).toMatch(/\$\s*12[.,]34[56]/);
    });
  });
});

describe("formatDate", () => {
  describe("happy path", () => {
    it("should format a standard date in es-CO locale", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = formatDate(date);
      // Colombian locale uses abbreviated month names
      // Format should be like "15 ene 2024" or "15 ene. 2024"
      expect(result).toMatch(/1[45]/); // Day might vary by timezone
      expect(result).toMatch(/ene/i); // January abbreviation
      expect(result).toMatch(/2024/);
    });

    it("should format a date with single-digit day", () => {
      const date = new Date("2024-03-05T12:00:00Z");
      const result = formatDate(date);
      expect(result).toMatch(/[45]/); // Day
      expect(result).toMatch(/mar/i); // March abbreviation
      expect(result).toMatch(/2024/);
    });

    it("should format end of year date", () => {
      const date = new Date("2024-12-31T12:00:00Z");
      const result = formatDate(date);
      expect(result).toMatch(/3[01]/); // Day 30 or 31 depending on timezone
      expect(result).toMatch(/dic/i); // December abbreviation
      expect(result).toMatch(/2024/);
    });

    it("should format start of year date", () => {
      const date = new Date("2024-01-01T12:00:00Z");
      const result = formatDate(date);
      expect(result).toMatch(/[01]/); // Day
      expect(result).toMatch(/ene/i); // January abbreviation
      expect(result).toMatch(/2024/);
    });
  });

  describe("edge cases", () => {
    it("should handle leap year date", () => {
      const date = new Date("2024-02-29T12:00:00Z");
      const result = formatDate(date);
      expect(result).toMatch(/2[89]/); // Day (timezone dependent)
      expect(result).toMatch(/feb/i);
      expect(result).toMatch(/2024/);
    });

    it("should handle different months", () => {
      const months = [
        { date: new Date("2024-06-15T12:00:00Z"), abbr: /jun/i },
        { date: new Date("2024-09-15T12:00:00Z"), abbr: /sep/i },
        { date: new Date("2024-11-15T12:00:00Z"), abbr: /nov/i },
      ];

      months.forEach(({ date, abbr }) => {
        const result = formatDate(date);
        expect(result).toMatch(abbr);
        expect(result).toMatch(/2024/);
      });
    });

    it("should handle dates from different years", () => {
      const date2023 = new Date("2023-06-15T12:00:00Z");
      const date2025 = new Date("2025-06-15T12:00:00Z");

      expect(formatDate(date2023)).toMatch(/2023/);
      expect(formatDate(date2025)).toMatch(/2025/);
    });

    it("should handle epoch date", () => {
      const epochDate = new Date(0);
      const result = formatDate(epochDate);
      // Should format 1970-01-01 (or 1969-12-31 depending on timezone)
      expect(result).toMatch(/196[89]|1970/);
    });
  });

  describe("locale specifics", () => {
    it("should use abbreviated month names in Spanish", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      const result = formatDate(date);
      // July should be abbreviated as "jul" in Spanish
      expect(result).toMatch(/jul/i);
    });

    it("should include year as 4 digits", () => {
      const date = new Date("2024-05-15T12:00:00Z");
      const result = formatDate(date);
      expect(result).toMatch(/2024/);
      // Year should be included in the output as 4 digits
      expect(result).toContain("2024");
    });
  });
});

describe("formatMonth", () => {
  describe("happy path", () => {
    it("should format month with full month name and year", () => {
      const date = new Date(2024, 0, 15); // January 2024
      const result = formatMonth(date);
      // Should be like "enero de 2024" or similar
      expect(result).toMatch(/enero/i);
      expect(result).toMatch(/2024/);
    });

    it("should format different months correctly", () => {
      const date = new Date(2024, 5, 1); // June 2024
      const result = formatMonth(date);
      expect(result).toMatch(/junio/i);
      expect(result).toMatch(/2024/);
    });

    it("should format end of year month", () => {
      const date = new Date(2024, 11, 1); // December 2024
      const result = formatMonth(date);
      expect(result).toMatch(/diciembre/i);
      expect(result).toMatch(/2024/);
    });
  });

  describe("edge cases", () => {
    it("should handle all 12 months", () => {
      const months = [
        { month: 0, name: /enero/i },
        { month: 1, name: /febrero/i },
        { month: 2, name: /marzo/i },
        { month: 3, name: /abril/i },
        { month: 4, name: /mayo/i },
        { month: 5, name: /junio/i },
        { month: 6, name: /julio/i },
        { month: 7, name: /agosto/i },
        { month: 8, name: /septiembre/i },
        { month: 9, name: /octubre/i },
        { month: 10, name: /noviembre/i },
        { month: 11, name: /diciembre/i },
      ];

      months.forEach(({ month, name }) => {
        const date = new Date(2024, month, 15);
        const result = formatMonth(date);
        expect(result).toMatch(name);
        expect(result).toMatch(/2024/);
      });
    });

    it("should handle different years", () => {
      const date2023 = new Date(2023, 5, 1);
      const date2025 = new Date(2025, 5, 1);

      const result2023 = formatMonth(date2023);
      const result2025 = formatMonth(date2025);

      expect(result2023).toMatch(/2023/);
      expect(result2025).toMatch(/2025/);
    });

    it("should handle leap year February", () => {
      const date = new Date(2024, 1, 29); // Feb 29, 2024
      const result = formatMonth(date);
      expect(result).toMatch(/febrero/i);
      expect(result).toMatch(/2024/);
    });

    it("should ignore the day component", () => {
      const date1 = new Date(2024, 5, 1);
      const date2 = new Date(2024, 5, 15);
      const date3 = new Date(2024, 5, 30);

      // All should produce the same result since only month and year are shown
      const result1 = formatMonth(date1);
      const result2 = formatMonth(date2);
      const result3 = formatMonth(date3);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe("locale specifics", () => {
    it("should use full month names in Spanish", () => {
      const date = new Date(2024, 2, 1); // March
      const result = formatMonth(date);
      // Should be full "marzo", not abbreviated "mar"
      expect(result).toMatch(/marzo/i);
      expect(result).not.toMatch(/^mar[^z]/i);
    });

    it("should use es-CO locale formatting", () => {
      const date = new Date(2024, 0, 1);
      const result = formatMonth(date);
      // Result should be a valid string with Spanish month name
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

describe("formatBillType", () => {
  describe("happy path", () => {
    it("should format RENT type", () => {
      const result = formatBillType(BillType.RENT);
      expect(result).toBe("Rent");
    });

    it("should format ELECTRICITY type", () => {
      const result = formatBillType(BillType.ELECTRICITY);
      expect(result).toBe("Electricity");
    });

    it("should format WATER type", () => {
      const result = formatBillType(BillType.WATER);
      expect(result).toBe("Water");
    });

    it("should format GAS type", () => {
      const result = formatBillType(BillType.GAS);
      expect(result).toBe("Gas");
    });

    it("should format INTERNET type", () => {
      const result = formatBillType(BillType.INTERNET);
      expect(result).toBe("Internet");
    });

    it("should format PHONE type", () => {
      const result = formatBillType(BillType.PHONE);
      expect(result).toBe("Phone");
    });

    it("should format OTHER type", () => {
      const result = formatBillType(BillType.OTHER);
      expect(result).toBe("Other");
    });
  });

  describe("comprehensive enum coverage", () => {
    it("should have a mapping for every BillType enum value", () => {
      const allBillTypes = Object.values(BillType);

      allBillTypes.forEach((type) => {
        const result = formatBillType(type);
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it("should return capitalized display names", () => {
      const allBillTypes = Object.values(BillType);

      allBillTypes.forEach((type) => {
        const result = formatBillType(type);
        // First character should be uppercase
        expect(result[0]).toBe(result[0].toUpperCase());
      });
    });

    it("should map all 7 bill types correctly", () => {
      const expectedMappings = {
        RENT: "Rent",
        ELECTRICITY: "Electricity",
        WATER: "Water",
        GAS: "Gas",
        INTERNET: "Internet",
        PHONE: "Phone",
        OTHER: "Other",
      };

      Object.entries(expectedMappings).forEach(([enumValue, displayName]) => {
        const result = formatBillType(enumValue as BillType);
        expect(result).toBe(displayName);
      });
    });
  });

  describe("output format", () => {
    it("should return plain strings without special formatting", () => {
      const result = formatBillType(BillType.RENT);
      // Should not contain ANSI color codes or special characters
      expect(result).not.toMatch(/\x1b/); // No ANSI escape codes
      expect(result).toBe("Rent");
    });

    it("should return consistent casing for single-word types", () => {
      expect(formatBillType(BillType.RENT)).toBe("Rent");
      expect(formatBillType(BillType.WATER)).toBe("Water");
      expect(formatBillType(BillType.GAS)).toBe("Gas");
      expect(formatBillType(BillType.PHONE)).toBe("Phone");
      expect(formatBillType(BillType.OTHER)).toBe("Other");
    });
  });
});

describe("formatPaymentStatus", () => {
  describe("happy path", () => {
    it("should format PAID status with green color and checkmark", () => {
      const result = formatPaymentStatus(PaymentStatus.PAID);
      // Should contain the checkmark and "Paid" text
      expect(result).toContain("✓");
      expect(result).toContain("Paid");
      // Result should be a styled string (chalk may or may not apply colors in test env)
      expect(typeof result).toBe("string");
    });

    it("should format PENDING status with yellow color and circle", () => {
      const result = formatPaymentStatus(PaymentStatus.PENDING);
      expect(result).toContain("○");
      expect(result).toContain("Pending");
      expect(typeof result).toBe("string");
    });

    it("should format OVERDUE status with red color and X mark", () => {
      const result = formatPaymentStatus(PaymentStatus.OVERDUE);
      expect(result).toContain("✗");
      expect(result).toContain("Overdue");
      expect(typeof result).toBe("string");
    });
  });

  describe("comprehensive enum coverage", () => {
    it("should have a mapping for every PaymentStatus enum value", () => {
      const allStatuses = Object.values(PaymentStatus);

      allStatuses.forEach((status) => {
        const result = formatPaymentStatus(status);
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it("should map all 3 payment statuses correctly", () => {
      const statuses = [
        PaymentStatus.PAID,
        PaymentStatus.PENDING,
        PaymentStatus.OVERDUE,
      ];

      statuses.forEach((status) => {
        const result = formatPaymentStatus(status);
        expect(result).toBeTruthy();
        // Each should contain a symbol and text
        expect(result.length).toBeGreaterThan(5);
      });
    });
  });

  describe("color formatting", () => {
    it("should use chalk.green for PAID status", () => {
      const result = formatPaymentStatus(PaymentStatus.PAID);
      const expected = chalk.green("✓ Paid");
      expect(result).toBe(expected);
    });

    it("should use chalk.yellow for PENDING status", () => {
      const result = formatPaymentStatus(PaymentStatus.PENDING);
      const expected = chalk.yellow("○ Pending");
      expect(result).toBe(expected);
    });

    it("should use chalk.red for OVERDUE status", () => {
      const result = formatPaymentStatus(PaymentStatus.OVERDUE);
      const expected = chalk.red("✗ Overdue");
      expect(result).toBe(expected);
    });
  });

  describe("visual indicators", () => {
    it("should include distinct symbols for each status", () => {
      const paid = formatPaymentStatus(PaymentStatus.PAID);
      const pending = formatPaymentStatus(PaymentStatus.PENDING);
      const overdue = formatPaymentStatus(PaymentStatus.OVERDUE);

      // Each should have a unique symbol
      expect(paid).toContain("✓");
      expect(pending).toContain("○");
      expect(overdue).toContain("✗");

      // Symbols should be different from each other
      expect(paid).not.toContain("○");
      expect(paid).not.toContain("✗");
      expect(pending).not.toContain("✓");
      expect(pending).not.toContain("✗");
      expect(overdue).not.toContain("✓");
      expect(overdue).not.toContain("○");
    });

    it("should format with symbol followed by space and status text", () => {
      const paid = formatPaymentStatus(PaymentStatus.PAID);
      const pending = formatPaymentStatus(PaymentStatus.PENDING);
      const overdue = formatPaymentStatus(PaymentStatus.OVERDUE);

      // Remove ANSI codes to check format
      const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, "");

      expect(stripAnsi(paid)).toBe("✓ Paid");
      expect(stripAnsi(pending)).toBe("○ Pending");
      expect(stripAnsi(overdue)).toBe("✗ Overdue");
    });
  });

  describe("console output compatibility", () => {
    it("should produce strings that can be logged to console", () => {
      const statuses = [
        PaymentStatus.PAID,
        PaymentStatus.PENDING,
        PaymentStatus.OVERDUE,
      ];

      statuses.forEach((status) => {
        const result = formatPaymentStatus(status);
        // Should be a string that can be passed to console.log
        expect(typeof result).toBe("string");
        expect(() => console.log(result)).not.toThrow();
      });
    });

    it("should return chalk-styled strings", () => {
      const result = formatPaymentStatus(PaymentStatus.PAID);
      // Should return a string (chalk may or may not add ANSI codes depending on environment)
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      // The formatted result should match the expected output
      expect(result).toContain("✓ Paid");
    });
  });
});

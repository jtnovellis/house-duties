import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getVersion } from "./version.js";
import * as fs from "fs";

// Mock the fs module
vi.mock("fs");

describe("getVersion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("happy path", () => {
    it("should return version from package.json when file exists", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        name: "house-duties",
        version: "1.0.0",
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0");
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining("package.json"),
        "utf-8"
      );
    });

    it("should read package.json from correct path", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "2.3.4" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      getVersion();

      // Assert
      const callPath = vi.mocked(fs.readFileSync).mock.calls[0][0] as string;
      expect(callPath).toContain("package.json");
      // The path is resolved at runtime based on __dirname
      expect(typeof callPath).toBe("string");
    });

    it("should return version as string type", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "1.5.3" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(typeof result).toBe("string");
      expect(result).toBeTruthy();
    });
  });

  describe("edge cases - semantic versioning formats", () => {
    it("should handle semantic version with patch number", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "2.15.8" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("2.15.8");
    });

    it("should handle pre-release version with alpha tag", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "1.0.0-alpha.1" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0-alpha.1");
    });

    it("should handle pre-release version with beta tag", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "3.2.1-beta.5" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("3.2.1-beta.5");
    });

    it("should handle pre-release version with rc tag", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "2.0.0-rc.1" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("2.0.0-rc.1");
    });

    it("should handle version with build metadata", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        version: "1.0.0+20241211.sha.5114f85",
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0+20241211.sha.5114f85");
    });

    it("should handle version with pre-release and build metadata", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        version: "1.0.0-beta.2+build.123",
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0-beta.2+build.123");
    });

    it("should handle major version zero (initial development)", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "0.1.0" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("0.1.0");
    });

    it("should handle very high version numbers", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "999.888.777" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("999.888.777");
    });
  });

  describe("error scenarios - file system errors", () => {
    it("should return fallback version when file is not found", () => {
      // Arrange
      const fileNotFoundError = new Error("ENOENT: no such file or directory");
      (fileNotFoundError as any).code = "ENOENT";
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw fileNotFoundError;
      });

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0");
    });

    it("should return fallback version when file cannot be read", () => {
      // Arrange
      const permissionError = new Error("EACCES: permission denied");
      (permissionError as any).code = "EACCES";
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw permissionError;
      });

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0");
    });

    it("should return fallback version when readFileSync throws generic error", () => {
      // Arrange
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("Unexpected file system error");
      });

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0");
    });
  });

  describe("error scenarios - JSON parsing errors", () => {
    it("should return fallback version when package.json has invalid JSON", () => {
      // Arrange
      const invalidJson = '{ "version": "1.0.0" invalid }';
      vi.mocked(fs.readFileSync).mockReturnValue(invalidJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0");
    });

    it("should return fallback version when package.json is empty", () => {
      // Arrange
      vi.mocked(fs.readFileSync).mockReturnValue("");

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0");
    });

    it("should return fallback version when package.json is not valid JSON", () => {
      // Arrange
      vi.mocked(fs.readFileSync).mockReturnValue("not json at all");

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0");
    });

    it("should return fallback version when package.json has incomplete JSON", () => {
      // Arrange
      const incompleteJson = '{ "version": ';
      vi.mocked(fs.readFileSync).mockReturnValue(incompleteJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0");
    });

    it("should return fallback version when JSON.parse throws", () => {
      // Arrange
      const malformedJson = '{ "name": "test", "version": }';
      vi.mocked(fs.readFileSync).mockReturnValue(malformedJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("1.0.0");
    });
  });

  describe("edge cases - missing or invalid version field", () => {
    it("should return undefined when version field is missing", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        name: "house-duties",
        description: "A console app",
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      // Current implementation returns undefined if version field doesn't exist
      expect(result).toBeUndefined();
    });

    it("should return null when version is null", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        name: "house-duties",
        version: null,
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      // Current implementation returns null as-is
      expect(result).toBeNull();
    });

    it("should return undefined when version is undefined in JSON", () => {
      // Arrange
      // Note: JSON.stringify removes undefined values, so this becomes an empty object
      const mockPackageJson = JSON.stringify({
        name: "house-duties",
        version: undefined,
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      // JSON.stringify({ version: undefined }) removes the version field
      expect(result).toBeUndefined();
    });

    it("should return empty string when version is empty string", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        name: "house-duties",
        version: "",
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      // Current implementation returns empty string as-is
      expect(result).toBe("");
    });

    it("should return undefined when package.json is empty object", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({});
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      // Accessing .version on empty object returns undefined
      expect(result).toBeUndefined();
    });
  });

  describe("edge cases - non-string version values", () => {
    it("should return number when version is a number instead of string", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        version: 1.0,
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      // Current implementation doesn't validate type - returns whatever is in version field
      expect(result).toBe(1);
    });

    it("should return object when version is an object", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        version: { major: 1, minor: 0, patch: 0 },
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      // Current implementation doesn't validate type
      expect(result).toEqual({ major: 1, minor: 0, patch: 0 });
    });

    it("should return array when version is an array", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        version: [1, 0, 0],
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      // Current implementation doesn't validate type
      expect(result).toEqual([1, 0, 0]);
    });
  });

  describe("return type validation", () => {
    it("should return string type when version is valid string", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "3.2.1" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(typeof result).toBe("string");
    });

    it("should return string type when fallback is triggered", () => {
      // Arrange
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("Test error");
      });

      // Act
      const result = getVersion();

      // Assert
      expect(typeof result).toBe("string");
      expect(result).toBe("1.0.0");
    });

    it("should return non-empty string for valid version", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "1.2.3" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return fallback with semantic version format", () => {
      // Arrange
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("Test error");
      });

      // Act
      const result = getVersion();

      // Assert
      expect(result).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe("multiple calls behavior", () => {
    it("should return same version on multiple calls", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({ version: "4.5.6" });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result1 = getVersion();
      const result2 = getVersion();
      const result3 = getVersion();

      // Assert
      expect(result1).toBe("4.5.6");
      expect(result2).toBe("4.5.6");
      expect(result3).toBe("4.5.6");
      expect(fs.readFileSync).toHaveBeenCalledTimes(3);
    });

    it("should return fallback consistently on errors", () => {
      // Arrange
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("Persistent error");
      });

      // Act
      const result1 = getVersion();
      const result2 = getVersion();

      // Assert
      expect(result1).toBe("1.0.0");
      expect(result2).toBe("1.0.0");
    });
  });

  describe("package.json with extra fields", () => {
    it("should extract version from package.json with many fields", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        name: "house-duties",
        version: "2.3.4",
        description: "Console application to track rent and utility bills",
        main: "dist/index.js",
        type: "module",
        scripts: {
          build: "tsc",
          test: "vitest",
        },
        dependencies: {
          chalk: "^4.1.2",
        },
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("2.3.4");
    });

    it("should handle version field in any position", () => {
      // Arrange
      const mockPackageJson = JSON.stringify({
        scripts: { test: "vitest" },
        dependencies: { chalk: "^4.1.2" },
        version: "5.6.7",
        name: "house-duties",
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockPackageJson);

      // Act
      const result = getVersion();

      // Assert
      expect(result).toBe("5.6.7");
    });
  });
});

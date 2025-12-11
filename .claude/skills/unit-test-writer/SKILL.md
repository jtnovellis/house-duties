---
name: unit-test-writer
description: Write comprehensive unit tests for functions, classes, and modules. Use when creating tests, improving coverage, or testing new features.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Unit Test Writer

## Test Writing Process

1. **Analyze the code**: Understand the function/module's purpose, inputs, outputs, and edge cases
2. **Identify test scenarios**:
   - Happy path (expected behavior)
   - Edge cases (boundary conditions)
   - Error cases (invalid inputs, exceptions)
   - Integration points (dependencies, external calls)
3. **Write clear tests**: Each test should verify one specific behavior
4. **Use descriptive names**: Test names should explain what is being tested and expected outcome
5. **Mock dependencies**: Isolate the unit under test from external dependencies

## Test Structure

```typescript
describe('FunctionName', () => {
  describe('when [scenario]', () => {
    it('should [expected behavior]', () => {
      // Arrange: Set up test data
      // Act: Execute the function
      // Assert: Verify the result
    });
  });
});
```

## Best Practices

- Test behavior, not implementation
- One assertion per test (when possible)
- Use meaningful test data that represents real scenarios
- Mock external dependencies (database, APIs, file system)
- Cover edge cases: null, undefined, empty arrays, boundary values
- Test error handling and exceptions
- Follow project testing standards from .claude/rules/testing.md

## Tools Usage

- **Read**: Examine code to understand what needs testing
- **Grep**: Find existing test patterns and conventions
- **Glob**: Locate test files to maintain consistency
- **Write/Edit**: Create or update test files

# Test Directory Structure

This directory contains all unit tests for the Accessible Language Learning Platform.

## Structure

```
__tests__/
└── components/
    └── learning/
        ├── AutismView.test.js    # Autism module tests (45 test cases)
        └── README.md             # Detailed test documentation
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run autism tests only:
```bash
npm test -- --testPathPattern=AutismView
```

### Run with coverage:
```bash
npm test -- --coverage --watchAll=false
```

## Test Utils

Helper functions and mocks are located in `src/test-utils/`.

See individual test files for detailed documentation.

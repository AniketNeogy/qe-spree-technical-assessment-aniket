# Spree Commerce Playwright Test Framework

This repository contains automated tests for the Spree Commerce e-commerce platform using the Playwright test framework with TypeScript.

## Table of Contents

- [Test Automation Strategy](#test-automation-strategy)
- [Framework Structure](#framework-structure)
- [Design Patterns](#design-patterns)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
  - [Basic Commands](#basic-commands)
  - [Parallel Execution](#parallel-execution)
  - [Cross-Browser Testing](#cross-browser-testing)
  - [Running Specific Tests](#running-specific-tests)
  - [Debugging Tests](#debugging-tests)
- [Test Reports](#test-reports)
- [Advanced Features](#advanced-features)
  - [API Mocking](#api-mocking)
  - [API Testing](#api-testing)
  - [Dynamic Test Data](#dynamic-test-data)
  - [Adaptable Element Selection](#adaptable-element-selection)
- [Test Scenarios](#test-scenarios)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## Test Automation Strategy

This framework implements a robust test automation strategy for the Spree Commerce e-commerce application, focusing on critical business paths. The implementation uses Playwright with TypeScript to provide reliable test automation with the following key aspects:

- **Page Object Model** - Encapsulation of UI elements and actions
- **Modular Structure** - Separation of concerns across framework components
- **API Integration** - Direct API calls for test setup and verification
- **Data-Driven Design** - Test data stored separately from test logic
- **Cross-Browser Testing** - Tests run across multiple browsers (Chrome, Firefox, Safari)
- **Dynamic Test Data** - Faker.js integration for realistic, unique test data
- **Advanced Mocking** - Sophisticated request interception for testing payment flows

## Framework Structure

The test framework follows best practices including Page Object Model pattern, API integration, and modular design:

```
playwright-test/
├── api/               # API client and mocks for integration
├── fixtures/          # Test data and shared fixtures
├── page-objects/      # Page object models for UI interactions
├── tests/             # Test specifications
├── utils/             # Utility functions and helpers
├── .github/workflows/ # CI pipeline configuration
├── test-documentation/ # Test strategy and coverage documents
├── playwright.config.ts  # Playwright configuration
└── tsconfig.json      # TypeScript configuration
```

## Design Patterns

The framework implements several design patterns to improve maintainability and readability:

### 1. Page Object Model (POM)

All UI interactions are encapsulated in page object classes, with an inheritance hierarchy:

- `BasePage` - Common functionality for all pages
- Specialized page classes (HomePage, ProductPage, etc.)

This approach:
- Separates test logic from UI interaction details
- Improves maintainability by centralizing locators
- Makes tests more readable and declarative

### 2. Builder Pattern

The framework uses builder patterns for both method chaining and complex operations:

```typescript
// Method chaining
await homePage.goto().searchProduct("shirt").clickProductByIndex(0);

// Complex operations with builder pattern
await productPage.configure().size("Large").color("Blue").quantity(2).addToCart();
```

### 3. Adapter Pattern

API interactions use adapters to abstract communication details:

```typescript
// API client adapter abstracts the details of how API calls are made
const apiClient = new ApiClient();
await apiClient.login(email, password);
await apiClient.addToCart(productId, quantity);
```

### 4. Strategy Pattern

The framework uses different strategies for element selection based on the context:

```typescript
// Adaptable element selection strategies
if (count > 1) {
  // Guest user flow - use second Edit link
  await expect(editLinks.nth(1)).toBeVisible();
} else if (count === 1) {
  // Registered user flow - use the only Edit link
  await expect(editLinks.first()).toBeVisible();
}
```

### 5. Factory Pattern

Test data generation uses factory methods:

```typescript
// Factory method for generating user data
const testUser = TestData.users.testUser;
```

## Prerequisites

- Node.js (v18 or newer)
- npm (v8 or newer)
- Spree Commerce application running locally on port 3000

## Installation

1. Clone the repository
2. Navigate to the `playwright-test` directory
3. Install dependencies:

```bash
npm install
```

4. Install Playwright browsers:

```bash
npx playwright install
```

## Running Tests

### Basic Commands

Run all tests sequentially:

```bash
npx playwright test
```

Run with UI mode for debugging:

```bash
npx playwright test --ui
```

Run tests in headed browsers:

```bash
npx playwright test --headed
```

### Parallel Execution

By default, Playwright runs tests in parallel. You can control this with:

```bash
# Run with 4 parallel workers (default)
npx playwright test

# Run with more workers for faster execution
npx playwright test --workers=2

# Run tests sequentially (one after another)
npx playwright test --workers=1
```

### Cross-Browser Testing

Run tests in specific browsers:

```bash
# Run in Chrome only
npx playwright test --project=chromium

# Run in Firefox only
npx playwright test --project=firefox

# Run in Safari only
npx playwright test --project=webkit

# Run in all browsers
npx playwright test --project=all
```

### Running Specific Tests

Run a single test file:

```bash
npx playwright test tests/guest-user-purchase.spec.ts
```

Run tests matching a specific pattern:

```bash
npx playwright test user-purchase
```

Run tests with a specific tag:

```bash
npx playwright test -g "@smoke"
```

### Debugging Tests

Use UI mode for interactive debugging:

```bash
npx playwright test --ui
```

Debug a specific test with browser debugging tools:

```bash
npx playwright test tests/guest-user-purchase.spec.ts --debug
```

Slow down test execution for visual debugging:

```bash
npx playwright test --headed --slow-mo=1000
```

Retry failed tests:

```bash
npx playwright test --retries=3
```

## Test Reports

Playwright automatically generates HTML reports after test execution:

```bash
# View the last test run report in your browser
npx playwright show-report

# Generate and open HTML report
npm run test:report
```

To save reports with a timestamp for historical tracking:

```bash
# Create a timestamped report
npx playwright test --reporter=html,line --reporter-html-output=reports/report-$(date +%Y%m%d-%H%M%S).html
```

To generate JUnit reports for CI integration:

```bash
npx playwright test --reporter=junit,line
```

## Advanced Features

### API Mocking

The framework includes a robust API mocking system to simulate backend responses, particularly for payment processing:

```typescript
// Example of payment API mocking
await ApiMocks.mockOrderConfirmation(
  page,
  orderToken,
  customerName,
  productName,
  productPrice
);
```

This approach allows:
- Testing checkout flows without real payment processing
- Simulating edge cases and error scenarios
- Reliable and consistent test execution

### API Testing

The framework implements direct API testing for critical backend functionality:

```typescript
// Example of direct API testing
const apiClient = new ApiClient();
const response = await apiClient.processPayment({
  orderToken: token,
  paymentMethod: 'credit_card',
  cardDetails: testCardData
});

expect(response.status).toBe(200);
expect(response.data.success).toBe(true);
```

Benefits of the API testing approach:
- Faster execution than UI-based tests
- Direct validation of backend services
- Testing of error handling and edge cases
- Comprehensive coverage of payment flows
- Verification of API contract compliance

### Dynamic Test Data

The framework uses Faker.js to generate realistic test data dynamically:

```typescript
// Dynamic user generation
const user = generateTestUser();
// -> { email: "john.doe83@example.net", password: "a8dJ2p9cL1", ... }

// Dynamic address generation
const address = generateAddress();
// -> { firstName: "Emily", city: "New York", zipcode: "10001", ... }
```

### Adaptable Element Selection

The page objects use smart element selection strategies that adapt to different page structures:

```typescript
// Example of adaptive selector strategy
const editLinks = this.page.getByRole('link', { name: 'Edit' });
const count = await editLinks.count();

if (count > 1) {
  // Guest user flow - use second Edit link
  await expect(editLinks.nth(1)).toBeVisible();
} else if (count === 1) {
  // Registered user flow - use the only Edit link
  await expect(editLinks.first()).toBeVisible();
}
```

This makes tests resilient to page variations between different user flows.

## Test Scenarios

The framework includes these high-priority test scenarios:

1. **User Registration and Purchase (New User)** - `tests/user-registration-purchase.spec.ts`
   - Tests account creation and purchase flow

2. **Complete Purchase Flow (Guest User)** - `tests/guest-user-purchase.spec.ts`
   - Tests guest checkout with mocked payments

3. **Existing User Purchase** - `tests/existing-user-purchase.spec.ts`
   - Tests purchase flow for registered users

4. **Abandoned Cart Recovery** - `tests/abandoned-cart.spec.ts`
   - Tests cart persistence across browser sessions

5. **Payment Processing Validation (API-based)** - `tests/api-payment-validation.spec.ts`
   - Tests payment processing directly through API
   - Validates API responses for success and failure scenarios
   - Tests multiple payment methods without UI interaction

6. **Product Discovery and Filtering** - `tests/product-search.spec.ts`
   - Tests search, filtering, and sorting

## Troubleshooting

### Common Issues and Solutions

1. **Element Not Found Errors**:
   - Use `--headed` flag to visually inspect the page
   - Check for dynamic elements with `page.waitForSelector()`

2. **Payment Flow Issues**:
   - Verify mocking setup is using the correct order token
   - Check network requests in debug console

3. **Authentication Problems**:
   - Clear cookies between test runs
   - Use unique user credentials

### Debugging Tips

1. **Use UI Mode**:
   ```bash
   npx playwright test --ui
   ```

2. **Add Debug Logging**:
   ```typescript
   console.log(`Current URL: ${page.url()}`);
   ```

3. **Take Screenshots**:
   ```typescript
   await page.screenshot({ path: 'debug-screenshot.png' });
   ```

## Documentation

For comprehensive test documentation, refer to:

- [Test Cases](./test-documentation/spree-commerce-test-cases.md) - Detailed scenarios
- [Test Coverage Summary](./test-documentation/spree-commerce-test-coverage-summary.md) - Risk-based prioritization

## Future Enhancements

Planned enhancements for the test framework include:

1. **Visual Regression Testing** - Comparing screenshots to detect UI changes
2. **Performance Testing** - Measuring and tracking page load times
3. **Accessibility Testing** - Validating WCAG compliance
4. **Mobile Responsive Testing** - Verifying adaptive layouts on different devices
5. **API Contract Testing** - Ensuring API response structures match expectations
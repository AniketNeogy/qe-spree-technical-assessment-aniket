# Spree eCommerce Technical Assessment

This is a technical assessment for Quality Engineering using Spree Commerce platform.

## About Spree Commerce

This project uses [Spree Commerce](https://spreecommerce.org) - the open-source e-commerce platform for Rails. It is a great starting point for any Rails developer to quickly build an e-commerce application.

This starter uses:

* Spree Commerce 5 which includes Admin Dashboard, API and Storefront
* Ruby 3.3 and Ruby on Rails 7.2
* [Devise](https://github.com/heartcombo/devise) for authentication
* [Solid Queue](https://github.com/rails/solid_queue) with Mission Control UI (access only to Spree admins) for background jobs
* [Solid Cache](https://github.com/rails/solid_cache) for excellent caching and performance
* PostgreSQL as a database

## Local Installation (Mac / Linux)

Please follow [Spree Quickstart guide](https://spreecommerce.org/docs/developer/getting-started/quickstart) to setup your Spree application using the Spree starter.

## Local Installation (Windows)

Follow these steps to set up the development environment on Windows:

1. **Setup Windows Subsystem for Linux (WSL)**
   - Enable WSL through Windows features
   - Install Ubuntu (or another Linux distribution) from the Microsoft Store
   - Set up WSL by running it and following the initial setup prompts

2. **Install Required Dependencies**
   - Open a WSL terminal and run:
     ```bash
     sudo apt-get update
     sudo apt-get install -y libvips-dev libpq-dev
     ```

3. **Install Ruby using rbenv**
   - Install the necessary dependencies:
     ```bash
     sudo apt-get install -y build-essential libssl-dev libreadline-dev zlib1g-dev
     ```
   - Install rbenv:
     ```bash
     curl -fsSL https://github.com/rbenv/rbenv-installer/raw/main/bin/rbenv-installer | bash
     ```
   - Add rbenv to your shell:
     ```bash
     echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
     echo 'eval "$(rbenv init -)"' >> ~/.bashrc
     source ~/.bashrc
     ```
   - Install Ruby 3.3.0:
     ```bash
     rbenv install 3.3.0
     rbenv global 3.3.0
     ```

4. **Install Docker Desktop**
   - Download and install Docker Desktop for Windows from the [official website](https://www.docker.com/products/docker-desktop/)
   - Ensure it's configured to work with WSL

5. **Set Up the Project**
   - Navigate to your project directory in WSL:
     ```bash
     cd /path/to/project
     ```
   - Start the PostgreSQL database with Docker Compose:
     ```bash
     docker-compose up -d
     ```
   - Fix line ending issues in scripts (if they exist):
     ```bash
     sed -i 's/\r$//' bin/*
     ```
   - Run the setup script:
     ```bash
     bin/setup
     ```
   - Start the development server:
     ```bash
     bin/dev
     ```

6. **Access the Application**
   - Once the server is running, access the application at http://localhost:3000

## Loading Sample Data (Pre-requisite for testing)

If you need to populate the store with sample products, categories, and other test data, run the following command:

```bash
bin/rails spree_sample:load
```

This will add demo products, variants, option types, and other e-commerce data to your development environment, which is useful for:
- Testing the application functionality
- Developing and testing automated tests
- Exploring the features of the Spree Commerce platform
- Demonstrating the application to stakeholders

Note: Sample data is automatically loaded when you run `bin/setup` as we have made changes to the setup file, but you can use this command if you need to reload it later.

Images will not be shown for above sample data, we can add them via the admin panel: 
```
Username: spree@example.com
Password: spree123
```
I have added a few images and will be committing them in the repo for ease of validation.

## Deployment

Please follow [Deployment guide](https://spreecommerce.org/docs/developer/deployment/render) to quickly deploy your production-ready Spree application.

## Troubleshooting

### libvips error

If you encounter an error like the following:

```bash
LoadError: Could not open library 'vips.so.42'
```

Please check that libvips is installed with `vips -v`, and if it is not installed, follow [installation instructions here](https://www.libvips.org/install.html).

## Testing Framework

This project includes a comprehensive test automation framework built with Playwright and TypeScript. The test framework is designed to validate critical business paths in the Spree Commerce application and provide reliable regression testing.

### Test Framework Architecture

The test automation framework follows best practices including:

- **Page Object Model** - Encapsulation of UI elements and actions
- **API Integration** - Direct API calls for test setup and verification
- **Data-Driven Design** - Test data stored separately from test logic
- **Cross-Browser Testing** - Tests across multiple browsers (Chrome, Firefox, Safari)
- **Advanced Mocking** - Sophisticated API mocking for payment processing and order confirmation

### Key Test Scenarios

The framework includes high-priority test scenarios selected through risk assessment:

1. **User Registration and Purchase (New User)** - Tests account creation and purchase flow
2. **Complete Purchase Flow (Guest User)** - Tests guest checkout experience with payment processing
3. **Abandoned Cart Recovery** - Tests cart persistence across sessions
4. **Payment Processing Validation (API-based)** - Tests payment scenarios with mocked responses
   - Implemented with a robust API client that supports multiple payment methods
   - Features intelligent error handling and fallback to mock mode when needed
   - Validates successful payments, declined cards, and alternative payment methods
5. **Product Discovery and Filtering** - Validates search and filtering functionality

### Running Tests

To run the tests, navigate to the `playwright-test` directory and follow the instructions in the [test framework README](./playwright-test/README.md).

```bash
cd playwright-test
npm install
npx playwright install
npm test
```

To run the API tests specifically:

```bash
cd playwright-test
npx playwright test tests/api-payment-validation.spec.ts
```

### Test Documentation

The test framework includes comprehensive documentation:

- [Test Framework README](./playwright-test/README.md) - Setup instructions and framework overview
- [Test Cases](./playwright-test/test-documentation/spree-commerce-test-cases.md) - Detailed test scenarios
- [Test Coverage Strategy](./playwright-test/test-documentation/spree-commerce-test-coverage-summary.md) - Risk assessment and prioritization

## Continuous Integration

This project includes a CI pipeline built with GitHub Actions that automatically runs tests on code changes

### GitHub Actions Workflows

- **Playwright Tests**: Runs all tests in parallel using sharding across multiple environments:
  - User Registration and Purchase
  - Guest Purchase Flow
  - Abandoned Cart Recovery
  - Payment Processing API Validation
- **Report Generation**: Merges test reports from all shards and publishes them
- **Environment Setup**: Automatically configures the application environment with sample data
- **Cross-Browser Testing**: Tests run on multiple browsers in parallel

### Viewing Test Reports

After tests run in CI, a link to the HTML report will be available in the GitHub Actions workflow summary. 

### CI Benefits

- **Parallel Execution**: Tests are split across multiple workers to reduce execution time
- **Comprehensive Reporting**: HTML reports show test results with screenshots and traces
- **Historical Data**: Reports are preserved for each branch and run
- **Easy Debugging**: Detailed test reports help identify issues quickly

For more information about the CI setup, see the workflow configuration in `.github/workflows/playwright.yml`.
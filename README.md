# A&Z Store — End-to-End Automation Testing Suite

An end-to-end (E2E) automation testing framework for the [A&Z Store](https://az-store961.netlify.app/) web application, built with **Playwright and JavaScript**.

The test suite covers authentication workflows, email verification, role-based access control (RBAC), cross-browser checks, and mobile viewport validation.

## Tech Stack & Tools

- **Automation Framework:** Playwright with JavaScript
- **Application Under Test:** A&Z Store (Vue 3), deployed on Netlify
- **Authentication & Backend:** Supabase Auth
- **Email Testing:** MailSlurp API for test inbox creation and email verification
- **Browser Projects:** Chromium, Firefox, WebKit, and mobile device emulation (Pixel 7)

## Repository Structure

```text
├── tests/
│   ├── admin-access.spec.js
│   ├── cross-browser.spec.js
│   ├── homepage.spec.js
│   ├── login.mobile.spec.js
│   ├── login.spec.js
│   ├── logout.spec.js
│   ├── logout-protection.spec.js
│   ├── mailslurp.spec.js
│   ├── register.spec.js
│   └── registration-flow.spec.js
├── playwright.config.js
├── package.json
├── package-lock.json
├── TEST_DOCUMENTATION.md
└── README.md
```

_Ensure the repository structure matches the actual files committed to GitHub._

## Quick Start & Local Execution

### 1. Prerequisites

- Node.js compatible with the project's dependencies
- npm
- Git

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <YOUR_REPOSITORY_URL>
cd az-store-automation
npm ci
npx playwright install
```

Replace `<YOUR_REPOSITORY_URL>` with the actual GitHub repository URL.

On Windows PowerShell, use `npx.cmd` instead of `npx` if the execution policy prevents running `npx.ps1`.

### 3. Environment Configuration

Create a local `.env` file in the project root containing the required environment variables:

```dotenv
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
ADMIN_EMAIL=
ADMIN_PASSWORD=
MAILSLURP_API_KEY=
```

Populate these variables with valid test credentials and the MailSlurp API key. The admin credentials must belong to an account with the required administrator permissions.

**Security:**

- Never commit `.env` or real credentials to version control.
- Keep API keys, passwords, and verification links private.
- Use dedicated test accounts for automated testing.
- If sharing an `.env.example` file, include placeholder values only.

### 4. Running Tests

Run the complete configured test suite:

```bash
npx playwright test --reporter=list
```

Run individual test files:

**Registration validation**

```bash
npx playwright test tests/register.spec.js --reporter=list
```

**End-to-end registration and email verification**

```bash
npx playwright test tests/registration-flow.spec.js --reporter=list
```

**Authentication scenarios**

```bash
npx playwright test tests/login.spec.js --reporter=list
```

**Logout behavior**

```bash
npx playwright test tests/logout.spec.js --reporter=list
```

**Protected-route checks**

```bash
npx playwright test tests/logout-protection.spec.js --reporter=list
```

**Admin authorization**

```bash
npx playwright test tests/admin-access.spec.js --reporter=list
```

**Guest product interaction**

```bash
npx playwright test tests/homepage.spec.js --reporter=list
```

**MailSlurp integration**

```bash
npx playwright test tests/mailslurp.spec.js --reporter=list
```

**Cross-browser checks**

```bash
npx playwright test tests/cross-browser.spec.js --reporter=list
```

**Mobile viewport checks**

```bash
npx playwright test tests/login.mobile.spec.js --project=mobile-chrome --reporter=list
```

On Windows PowerShell, replace `npx` with `npx.cmd` when necessary.

_Test execution depends on the configured Playwright projects, valid environment variables, browser installations, network connectivity, and external service availability._

### 5. Test Reports

Open the HTML report after a test run, provided it has been generated:

```bash
npx playwright show-report
```

Screenshots and traces on failure depend on the diagnostic settings configured in `playwright.config.js`.

## Test Documentation

For the detailed test specifications, preconditions, execution steps, expected results, test case IDs, and Requirements Traceability Matrix (RTM), see:

[**TEST_DOCUMENTATION.md**](./TEST_DOCUMENTATION.md)

## CI/CD Pipeline Integration — Proposed Architecture

The framework can be integrated into **GitHub Actions** or another CI/CD platform to automate regression testing and provide early feedback on potential defects.

This section describes a proposed integration and does not imply that a CI/CD pipeline is already implemented.

### 1. Proposed Workflow Strategy

- **Pull Requests:** Run selected smoke tests to identify regressions before merging changes into `main`.
- **Push to Main:** Execute the configured test suite after changes are pushed.
- **Scheduled Regression:** Run broader tests across configured browser and mobile projects on a daily schedule.
- **Post-Deployment Verification:** Optionally run smoke tests against a staging environment after deployment.

### 2. Secrets Management

Store sensitive credentials and API keys as GitHub Actions repository or environment secrets. Pass them to the test process through environment variables.

Expected secret names:

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `MAILSLURP_API_KEY`

Never hardcode real secrets into workflow files or commit them to version control.

### 3. Proposed Workflow Configuration

A future workflow could be created at `.github/workflows/playwright.yml`.

The workflow would typically:

1. Check out the repository.
2. Set up a compatible Node.js version.
3. Install dependencies using `npm ci`.
4. Install the required Playwright browsers and system dependencies.
5. Provide test credentials through GitHub Actions secrets.
6. Execute the configured Playwright test suite.
7. Upload the HTML report and relevant failure artifacts.

### 4. Reliability & Quality Gates

Potential improvements include:

- **Headless Execution:** Run browser tests in headless mode on CI runners.
- **Retry Strategy:** Configure a limited retry count for CI where appropriate.
- **Failure Diagnostics:** Collect screenshots and traces for failed tests.
- **Artifact Retention:** Upload reports and diagnostic artifacts for later analysis.
- **Branch Protection:** Require successful test checks before merging into protected branches.

These capabilities should be considered implemented only after the workflow has been configured, executed successfully, and any required repository protection settings have been enabled.

## Project Goal

This project demonstrates practical end-to-end automation skills, structured test case design, authentication workflow validation, authorization testing, and automated test execution using Playwright.

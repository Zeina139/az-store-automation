# End-to-End (E2E) Test Plan & Test Case Documentation

**Application Under Test:** [A&Z Store](https://az-store961.netlify.app/)  
**Testing Framework:** Playwright (JavaScript)  
**Authentication & Backend:** Supabase Auth  
**Email Verification API:** MailSlurp API  
**Browsers & Viewports:** Chromium, Firefox, WebKit, and Mobile Emulation (Pixel 7)

---

## 1. Overview

This document outlines the end-to-end (E2E) test cases implemented for the A&Z Store web platform. The test suite verifies critical user journeys, comprehensive form validations, authentication lifecycle (registration, email verification, login, logout), role-based route authorization (RBAC), and layout stability across browsers and mobile viewports.

### Testing Objectives

- Validate registration form boundary validation and error handling.
- Verify end-to-end user registration, automated email confirmation via MailSlurp, and subsequent authentication.
- Validate authentication scenarios (positive, negative, and input constraints).
- Test authenticated session persistence, logout flow, and protected route guards.
- Verify role-based access control (RBAC) preventing unauthorized access to admin panels.
- Validate cross-browser functionality and mobile viewport responsiveness.

### Custom Test Case ID Convention

| Prefix       | Meaning                                                   |
| :----------- | :-------------------------------------------------------- |
| **TC-REG**   | Registration and email verification flows                 |
| **TC-AUTH**  | Authentication, session persistence, and route protection |
| **TC-SEC**   | Role-based access control and admin authorization         |
| **TC-CROSS** | Cross-browser compatibility checks                        |
| **TC-MOB**   | Mobile layout and viewport checks                         |
| **TC-INT**   | Third-party service integration connectivity              |

---

## 2. Requirements Traceability Matrix (RTM)

| Assessment Requirement          | Test Specification Files                        | Test Case IDs           | Verification Scope                                                                                                                                                                       |
| :------------------------------ | :---------------------------------------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Registration & Validation**   | `register.spec.js`, `registration-flow.spec.js` | TC-REG-01 – TC-REG-08   | Empty submission, password min-length, password mismatch, invalid email (Supabase 400), isolated required fields, visibility toggles, and live inbox verification with first-time login. |
| **Sign-In & Authentication**    | `login.spec.js`, `homepage.spec.js`             | TC-AUTH-01 – TC-AUTH-05 | Empty fields, incorrect password, unregistered user, successful authentication, and guest redirection on action.                                                                         |
| **Sign-Out & Route Protection** | `logout.spec.js`, `logout-protection.spec.js`   | TC-AUTH-06 – TC-AUTH-07 | Logout behavior, UI navigation reset, and redirection from `/myorders` to `/login` after logout or when unauthenticated.                                                                 |
| **Access Control (Admin)**      | `admin-access.spec.js`                          | TC-SEC-01 – TC-SEC-03   | Admin dashboard/products/orders access, regular user route restrictions, and guest route restrictions.                                                                                   |
| **Cross-Browser Verification**  | `cross-browser.spec.js`, `playwright.config.js` | TC-CROSS-01             | Form visibility, input acceptance, empty validation, and horizontal overflow check across engines.                                                                                       |
| **Mobile Emulation**            | `login.mobile.spec.js`, `playwright.config.js`  | TC-MOB-01 – TC-MOB-02   | Mobile login form usability and horizontal scroll overflow verification on mobile viewports.                                                                                             |
| **Service Integration**         | `mailslurp.spec.js`                             | TC-INT-01               | Sanity check verifying connection and retrieval of the configured MailSlurp sandbox inbox.                                                                                               |

---

## 3. Detailed Test Case Specifications

### Module A — Registration & Account Verification

**Specification Files:** `register.spec.js`, `registration-flow.spec.js`

#### TC-REG-01: Empty Registration Form Submission

- **File:** `register.spec.js`
- **Preconditions:** Browser navigated to `/register`.
- **Steps:** Click the "إنشاء حساب" button without filling any fields.
- **Expected Result:** Text `"يرجى تعبئة جميع الحقول"` is visible.

#### TC-REG-02: Password Below Minimum Length (< 6 Characters)

- **File:** `register.spec.js`
- **Preconditions:** Form loaded at `/register`.
- **Steps:**
  1. Fill email with `"qa-test@example.com"`.
  2. Fill password and confirm password with `"12345"`.
  3. Click "إنشاء حساب".
- **Expected Result:** Text `"كلمة المرور يجب أن تكون 6 أحرف على الأقل"` is visible.

#### TC-REG-03: Password Confirmation Mismatch

- **File:** `register.spec.js`
- **Preconditions:** Form loaded at `/register`.
- **Steps:**
  1. Fill email with `"qa-test@example.com"`.
  2. Fill password with `"Secret123"`.
  3. Fill confirm password with `"Different123"`.
  4. Click "إنشاء حساب".
- **Expected Result:** The `.error` element contains text `"كلمتا المرور غير متطابقتين"`.

#### TC-REG-04: Invalid Email Rejected by Auth API (Supabase 400)

- **File:** `register.spec.js`
- **Preconditions:** Browser navigated to `/register`.
- **Steps:**
  1. Fill email with invalid format `"zeinaurwa44@"`.
  2. Fill both password fields with `"1234567"`.
  3. Intercept `POST /auth/v1/signup` and submit form.
- **Expected Result:**
  - Supabase signup API returns HTTP status `400`.
  - The `.error` element displays `"حدث خطأ أثناء إنشاء الحساب"`.
  - The `.success` element remains hidden.
  - User remains on `/register`.

#### TC-REG-05: Missing Individual Required Fields

- **File:** `register.spec.js`
- **Scenarios Executed:**
  - Email empty; password and confirm password filled with `"Secret123"`.
  - Password empty; email filled with `"qa-test@example.com"`, confirm password filled with `"Secret123"`.
  - Confirm password empty; email filled with `"qa-test@example.com"`, password filled with `"Secret123"`.
- **Expected Result (for each):** The `.error` element displays `"يرجى تعبئة جميع الحقول"`, and `.success` is hidden.

#### TC-REG-06: Password Masking Toggle

- **File:** `register.spec.js`
- **Steps:**
  1. Fill password with `"Secret123"`.
  2. Click the visibility toggle in the first `.password-wrapper`.
  3. Click the toggle again.
- **Expected Result:** Input attribute transitions from `type="password"` to `type="text"`, then back to `type="password"`.

#### TC-REG-07: Independent Visibility Toggles

- **File:** `register.spec.js`
- **Steps:**
  1. Fill both password inputs.
  2. Click confirm password toggle and verify confirm input turns to `text` while password remains `password`.
  3. Click confirm password toggle then password toggle.
- **Expected Result:** Password becomes `text` while confirm password remains `password`, verifying isolated state toggles.

#### TC-REG-08: End-to-End Registration, Email Verification, and Login

- **File:** `registration-flow.spec.js`
- **Preconditions:** `MAILSLURP_API_KEY` configured in `.env`.
- **Steps:**
  1. Dynamically create a new inbox via `mailslurp.createInbox()`.
  2. Fill `/register` with the generated email and password `"QaTest2002!"`.
  3. Submit the registration form.
  4. Assert `.success` element appears containing the dynamic email.
  5. Wait for email delivery using `mailslurp.waitForLatestEmail` (60s timeout).
  6. Assert email subject contains `"Confirm Your Signup"`.
  7. Extract verification URL matching `/auth/v1/verify?`.
  8. Navigate directly to the verification URL.
  9. Assert navigation reaches `/login` without errors (`otp_expired`, `access_denied`).
  10. Fill the login form with the verified dynamic email and password `"QaTest2002!"`.
  11. Submit the login form.
- **Expected Result:**
  - The registration confirmation email is received.
  - The verification link opens without the checked expiration or access-denied errors.
  - The browser is redirected to the login page.
  - The newly registered user can log in successfully after verification.

---

### Module B — Authentication & Route Protection

**Specification Files:** `login.spec.js`, `logout.spec.js`, `logout-protection.spec.js`, `homepage.spec.js`

#### TC-AUTH-01: Empty Login Form Submission

- **File:** `login.spec.js`
- **Steps:** Navigate to `/login` and click "تسجيل الدخول" without input.
- **Expected Result:** Element `.error` displays `"يرجى تعبئة جميع الحقول"`, and URL remains on `/login`.

#### TC-AUTH-02: Incorrect Password for Registered User

- **File:** `login.spec.js`
- **Preconditions:** `TEST_USER_EMAIL` configured in `.env`.
- **Steps:** Fill valid email with `"DefinitelyWrongPassword123!"` and submit.
- **Expected Result:** Element `.error` displays `"بيانات تسجيل الدخول غير صحيحة"`.

#### TC-AUTH-03: Login with Unregistered Email

- **File:** `login.spec.js`
- **Steps:** Fill email with dynamic `unregistered-qa-{Date.now()}@example.com` and password `"Password123!"`, then submit.
- **Expected Result:** Login button re-enables after request, and `.error` displays `"بيانات تسجيل الدخول غير صحيحة"`.

#### TC-AUTH-04: Successful Login with Valid Credentials

- **File:** `login.spec.js`
- **Preconditions:** Valid `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in `.env`.
- **Steps:** Fill valid credentials and submit.
- **Expected Result:**
  - URL redirects away from `/login`.
  - Button with role / name `"الحساب"` is visible.
  - Element `.error` is hidden.

#### TC-AUTH-05: Guest Redirected from Product Action

- **File:** `homepage.spec.js`
- **Preconditions:** Unauthenticated guest on root page (`/`).
- **Steps:** Hover over the first `.products-grid .card` and click the "سجل الدخول" button.
- **Expected Result:** Browser redirects to `/login`.

#### TC-AUTH-06: User Logout & Protected Route Behavior

- **File:** `logout.spec.js`
- **Preconditions:** Valid `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in `.env`.
- **Steps:**
  1. Log in with valid credentials.
  2. Verify `"طلباتي"` link is visible and open `"الحساب"` menu.
  3. Verify `.account-dropdown .user-info` displays the user email.
  4. Click `.account-dropdown button.logout`.
  5. Attempt to navigate to protected route `/myorders`.
- **Expected Result:**
  - Redirection to `/login` upon logout.
  - The `"طلباتي"` link becomes hidden.
  - Attempting to access `/myorders` forces redirect back to `/login`.

#### TC-AUTH-07: Unauthenticated Direct Access to Protected Route

- **File:** `logout-protection.spec.js`
- **Steps:** Direct browser navigation to `/myorders` without an active session.
- **Expected Result:** Redirected to `/login`, and login inputs are visible.

---

### Module C — Role-Based Access Control (RBAC)

**Specification File:** `admin-access.spec.js`

#### TC-SEC-01: Privileged Admin Access to Protected Dashboards

- **Preconditions:** `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured in `.env`.
- **Steps:**
  1. Log in using admin credentials.
  2. Click navigation link `"لوحة التحكم"`.
  3. Verify dashboard and navigate to sidebar links: `"Products"` and `"Orders"`.
- **Expected Result:**
  - Access to `/admin`, displaying `"Admin Panel"` and `"Admin Dashboard"`.
  - Access to `/admin/products`, displaying heading `"Products"` and button `"Add Product"`.
  - Access to `/admin/orders`, displaying heading `"Orders Management"`.

#### TC-SEC-02: Regular User Blocked from Admin Routes

- **Preconditions:** `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` configured in `.env`.
- **Steps:** Log in as regular user, then navigate directly to `/admin`, `/admin/products`, and `/admin/orders`.
- **Expected Result:** User is redirected to root (`/`), and text `"Admin Panel"` count is `0`.

#### TC-SEC-03: Guest Blocked from Admin Routes

- **Steps:** Directly attempt URL navigation to `/admin`, `/admin/products`, and `/admin/orders` without logging in.
- **Expected Result:** Redirected to root (`/`), and `"Admin Panel"` count is `0`.

---

### Module D — Cross-Browser & Mobile Viewport Layout

**Specification Files:** `cross-browser.spec.js`, `login.mobile.spec.js`

#### TC-CROSS-01: Cross-Browser Login Usability & Layout

- **File:** `cross-browser.spec.js`
- **Engines:** Chromium, Firefox, WebKit (configured via project-level routing in `playwright.config.js`).
- **Scope Note:** To optimize execution time and resource consumption, cross-browser validation is focused on critical entry authentication points.
- **Steps:**
  1. Load `/login`.
  2. Verify input fields and button visibility.
  3. Fill inputs with sample values and assert values match.
  4. Submit empty form and assert `"يرجى تعبئة جميع الحقول"`.
  5. Evaluate client vs scroll width via `page.evaluate()`.
- **Expected Result:** The login page passes the defined visibility, input, empty-form validation, and horizontal-overflow checks in the configured browser engines.

#### TC-MOB-01: Mobile Login Form Usability

- **File:** `login.mobile.spec.js`
- **Target Profile:** `mobile-chrome` project (Pixel 7 emulation in `playwright.config.js`).
- **Steps:** Open `/login`, enter sample data, test empty form submission under mobile viewport constraints.
- **Expected Result:** The login inputs accept text, and the empty-form validation message is displayed on the configured mobile viewport.

#### TC-MOB-02: Mobile Horizontal Overflow Guard

- **File:** `login.mobile.spec.js`
- **Steps:** Evaluate viewport dimensions on mobile emulation.
- **Expected Result:** `scrollWidth <= clientWidth`, ensuring no horizontal scrollbars exist on mobile.

---

### Module E — Third-Party API Integration

**Specification File:** `mailslurp.spec.js`

#### TC-INT-01: MailSlurp API & Test Inbox Connectivity

- **File:** `mailslurp.spec.js`
- **Preconditions:** `MAILSLURP_API_KEY` defined in `.env`.
- **Steps:** Query MailSlurp inbox with ID `3fab02b5-dab9-4a86-96fd-a22848fe8307`.
- **Expected Result:** Returns email address `3fab02b5-dab9-4a86-96fd-a22848fe8307@sandbox.zazamail.link`.

---

## 4. Test Framework Configuration

Configured in `playwright.config.js` with the following parameters:

- **Execution Engine:** `workers: 1`, global timeout `60,000ms`, assertion timeout `10,000ms`.
- **Diagnostics:** Captures trace and screenshots on failure (`retain-on-failure`, `only-on-failure`).
- **Projects:**
  - `chrome`: Desktop Chrome channel (`headless: false`).
  - `firefox`: Desktop Firefox running `cross-browser.spec.js`.
  - `webkit`: Desktop Safari running `cross-browser.spec.js`.
  - `mobile-chrome`: Pixel 7 emulation running `*.mobile.spec.js`.

---

## 5. Environment Variables & Secrets

| Variable             | Description                                                  |
| :------------------- | :----------------------------------------------------------- |
| `TEST_USER_EMAIL`    | Credentials for standard authenticated user tests.           |
| `TEST_USER_PASSWORD` | Password for standard user tests.                            |
| `ADMIN_EMAIL`        | Credentials for administrator role tests.                    |
| `ADMIN_PASSWORD`     | Password for administrator role tests.                       |
| `MAILSLURP_API_KEY`  | API Key used for dynamic inbox creation and email retrieval. |

---

## 6. Execution Commands

To execute the test suites locally via Windows PowerShell:

```powershell
# Run individual test files
npx.cmd playwright test tests/login.spec.js --reporter=list
npx.cmd playwright test tests/register.spec.js --reporter=list
npx.cmd playwright test tests/registration-flow.spec.js --reporter=list
npx.cmd playwright test tests/logout.spec.js --reporter=list
npx.cmd playwright test tests/logout-protection.spec.js --reporter=list
npx.cmd playwright test tests/admin-access.spec.js --reporter=list
npx.cmd playwright test tests/homepage.spec.js --reporter=list
npx.cmd playwright test tests/mailslurp.spec.js --reporter=list
npx.cmd playwright test tests/cross-browser.spec.js --reporter=list
npx.cmd playwright test tests/login.mobile.spec.js --project=mobile-chrome --reporter=list

# Run entire configured test matrix
npx.cmd playwright test --reporter=list
```

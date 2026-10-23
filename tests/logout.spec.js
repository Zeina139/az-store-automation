require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL = "https://az-store961.netlify.app";

test("User login, verify state, logout, and verify route security", async ({
  page,
}) => {
  test.setTimeout(60000);

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  // Verify that the required test credentials are configured.
  expect(email, "TEST_USER_EMAIL must be set in .env").toBeTruthy();
  expect(password, "TEST_USER_PASSWORD must be set in .env").toBeTruthy();

  // 1. Navigate to the login page.
  await page.goto(`${BASE_URL}/login`, {
    waitUntil: "domcontentloaded",
  });

  // 2. Enter valid credentials and submit the login form.
  await page.getByPlaceholder("البريد الإلكتروني").fill(email);
  await page.getByPlaceholder("كلمة المرور").fill(password);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();

  // 3. Verify that the application redirects away from the login page.
  await expect(page).not.toHaveURL(/\/login(?:[?#].*)?$/, {
    timeout: 30000,
  });

  // 4. Verify successful authentication using elements available to logged-in users.
  // The "My Orders" link should only be visible when a user is authenticated.
  const myOrdersNavLink = page.getByRole("link", {
    name: "طلباتي",
  });

  await expect(myOrdersNavLink).toBeVisible({
    timeout: 15000,
  });

  // Open the account menu to verify the authenticated user's information.
  const accountButton = page.getByRole("button", {
    name: /الحساب/,
  });

  await accountButton.click();

  // Verify that the account menu displays the current user's email address.
  await expect(page.locator(".account-dropdown .user-info")).toHaveText(email);

  // Verify that the logout button is available to the authenticated user.
  const logoutButton = page.locator(".account-dropdown button.logout");

  await expect(logoutButton).toBeVisible();

  console.log("Login successful. User session verified.");

  // 5. Log out using the account menu.
  await logoutButton.click();

  // 6. Verify that logging out redirects the user to the login page.
  await expect(page).toHaveURL(/\/login\/?([?#].*)?$/, {
    timeout: 15000,
  });

  // 7. Verify that authenticated navigation elements are no longer visible.
  await expect(myOrdersNavLink).toBeHidden();

  console.log("Logout successful. Authenticated navigation reset.");

  // 8. Attempt to access a protected page after logging out.
  await page.goto(`${BASE_URL}/myorders`, {
    waitUntil: "domcontentloaded",
  });

  // 9. Verify that unauthenticated users are redirected to the login page.
  await expect(page).toHaveURL(/\/login\/?([?#].*)?$/, {
    timeout: 15000,
  });

  await expect(page.getByPlaceholder("البريد الإلكتروني")).toBeVisible();

  console.log("Protected route access correctly redirected to login.");
});

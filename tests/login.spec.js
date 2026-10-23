require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL = "https://az-store961.netlify.app";

test.describe("Login form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "domcontentloaded",
    });
  });

  test("shows an error when all fields are empty", async ({ page }) => {
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    const error = page.locator(".error");

    await expect(error).toBeVisible();
    await expect(error).toContainText("يرجى تعبئة جميع الحقول");

    await expect(page).toHaveURL(/\/login\/?([?#].*)?$/);
  });

  test("shows an error when a registered user enters the wrong password", async ({
    page,
  }) => {
    const email = process.env.TEST_USER_EMAIL;

    expect(email, "TEST_USER_EMAIL must be set in .env").toBeTruthy();

    await page.getByPlaceholder("البريد الإلكتروني").fill(email);

    await page
      .getByPlaceholder("كلمة المرور")
      .fill("DefinitelyWrongPassword123!");

    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    const error = page.locator(".error");

    await expect(error).toBeVisible({ timeout: 30000 });
    await expect(error).toContainText("بيانات تسجيل الدخول غير صحيحة");

    await expect(page).toHaveURL(/\/login\/?([?#].*)?$/);
  });

  test("shows an error when an unregistered email is used", async ({
    page,
  }) => {
    // Allow additional time for the authentication request on a slow connection.
    test.setTimeout(60000);

    const unregisteredEmail = `unregistered-qa-${Date.now()}@example.com`;

    await page.getByPlaceholder("البريد الإلكتروني").fill(unregisteredEmail);
    await page.getByPlaceholder("كلمة المرور").fill("Password123!");

    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    // Wait until the login request finishes and the button becomes enabled.
    const loginButton = page.getByRole("button", {
      name: /تسجيل الدخول/,
    });

    await expect(loginButton).toBeEnabled({ timeout: 45000 });

    // Verify that the application displays the expected authentication error.
    const error = page.locator(".error");

    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText("بيانات تسجيل الدخول غير صحيحة");

    // Verify that the user remains on the login page.
    await expect(page).toHaveURL(/\/login\/?([?#].*)?$/);
  });

  test("logs in successfully with valid credentials", async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    expect(email, "TEST_USER_EMAIL must be set in .env").toBeTruthy();

    expect(password, "TEST_USER_PASSWORD must be set in .env").toBeTruthy();

    await page.getByPlaceholder("البريد الإلكتروني").fill(email);
    await page.getByPlaceholder("كلمة المرور").fill(password);

    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    // Wait until the application redirects after successful login.
    await expect(page).not.toHaveURL(/\/login/, {
      timeout: 30000,
    });

    // Verify that the authenticated account control is displayed.
    await expect(page.getByRole("button", { name: /الحساب/ })).toBeVisible({
      timeout: 15000,
    });

    // A successful login should not display an error.
    await expect(page.locator(".error")).toBeHidden();
  });
});

const { test, expect } = require("@playwright/test");

const BASE_URL = "https://az-store961.netlify.app";

test.describe("Cross-Browser Login - A&Z Store", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test("1. Login page loads correctly", async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);

    await expect(
      page.getByRole("button", { name: /تسجيل الدخول/ }).first(),
    ).toBeVisible();

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("2. Email and password fields accept input", async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill("browser.test@example.com");
    await passwordInput.fill("TestPassword123!");

    await expect(emailInput).toHaveValue("browser.test@example.com");
    await expect(passwordInput).toHaveValue("TestPassword123!");
  });

  test("3. Empty login form displays a validation message", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: /تسجيل الدخول/ })
      .first()
      .click();

    await expect(page.getByText("يرجى تعبئة جميع الحقول")).toBeVisible();
  });

  test("4. Page content does not overflow horizontally", async ({ page }) => {
    const dimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      pageWidth: document.documentElement.scrollWidth,
    }));

    expect(
      dimensions.pageWidth,
      `Unexpected horizontal overflow: viewport=${dimensions.viewportWidth}px, page=${dimensions.pageWidth}px`,
    ).toBeLessThanOrEqual(dimensions.viewportWidth);
  });
});

const { test, expect } = require("@playwright/test");

const BASE_URL = "https://az-store961.netlify.app";

test.describe("Mobile Login - A&Z Store", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test("1. Login page loads correctly on mobile", async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);

    await expect(
      page.getByRole("button", { name: /تسجيل الدخول/ }).first(),
    ).toBeVisible();

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("2. User can enter email and password on mobile", async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill("mobile.test@example.com");
    await passwordInput.fill("TestPassword123!");

    await expect(emailInput).toHaveValue("mobile.test@example.com");
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

  test("4. Login page has no horizontal overflow on mobile", async ({
    page,
  }) => {
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

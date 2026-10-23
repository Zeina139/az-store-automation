const { test, expect } = require("@playwright/test");

const BASE_URL = "https://az-store961.netlify.app";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

const ADMIN_PATHS = ["/admin", "/admin/products", "/admin/orders"];

test.describe("Admin access control", () => {
  test.setTimeout(90_000);

  async function loginAs(page, email, password) {
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "domcontentloaded",
    });

    const emailInput = page
      .locator(
        'input[type="email"], input[placeholder*="البريد"], input[placeholder*="Email"]',
      )
      .first();

    const passwordInput = page.locator('input[type="password"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill(email);
    await passwordInput.fill(password);

    await page
      .getByRole("button", {
        name: /تسجيل الدخول|log\s*in|sign\s*in/i,
      })
      .click();

    await expect(page).not.toHaveURL(/\/login(?:[/?#]|$)/, {
      timeout: 25_000,
    });
  }

  async function expectRedirectedToHome(page, path) {
    await page.goto(`${BASE_URL}${path}`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page).toHaveURL(`${BASE_URL}/`, {
      timeout: 15_000,
    });

    await expect(page.getByText("Admin Panel", { exact: true })).toHaveCount(0);
  }

  test("admin can access the dashboard, products, and orders pages", async ({
    page,
  }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in the local .env file.",
    );

    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    const adminNavLink = page.getByRole("link", {
      name: "لوحة التحكم",
    });

    // Wait for the admin link to appear
    await expect(adminNavLink).toBeVisible({
      timeout: 20_000,
    });

    // Click the link directly to leverage existing client-side state
    await adminNavLink.click();

    // Verify the admin dashboard
    await expect(page).toHaveURL(`${BASE_URL}/admin`);

    await expect(page.getByText("Admin Panel", { exact: true })).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Admin Dashboard",
        exact: true,
      }),
    ).toBeVisible();

    // Verify the products management page using client-side sidebar link click
    const productsLink = page.getByRole("link", { name: "Products" });
    await expect(productsLink).toBeVisible();
    await productsLink.click();

    await expect(page).toHaveURL(`${BASE_URL}/admin/products`);

    await expect(
      page.getByRole("heading", {
        name: "Products",
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /Add Product/i,
      }),
    ).toBeVisible();

    // Verify the orders management page using client-side sidebar link click
    const ordersLink = page.getByRole("link", { name: "Orders" });
    await expect(ordersLink).toBeVisible();
    await ordersLink.click();

    await expect(page).toHaveURL(`${BASE_URL}/admin/orders`);

    await expect(
      page.getByRole("heading", {
        name: /Orders Management/i,
      }),
    ).toBeVisible();
  });

  test("regular user cannot access any admin route", async ({ page }) => {
    test.skip(
      !TEST_USER_EMAIL || !TEST_USER_PASSWORD,
      "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in the local .env file.",
    );

    await loginAs(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);

    for (const path of ADMIN_PATHS) {
      await expectRedirectedToHome(page, path);
    }

    await expect(page.getByText("Admin Panel", { exact: true })).toHaveCount(0);
  });

  test("guest cannot access any admin route", async ({ page }) => {
    for (const path of ADMIN_PATHS) {
      await expectRedirectedToHome(page, path);
    }

    await expect(page.getByText("Admin Panel", { exact: true })).toHaveCount(0);
  });
});

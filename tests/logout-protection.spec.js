require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL = "https://az-store961.netlify.app";

test("logged-out user is redirected from my orders to login", async ({
  page,
}) => {
  // 1. Open the protected orders page without logging in.
  await page.goto(`${BASE_URL}/myorders`, {
    waitUntil: "domcontentloaded",
  });

  // 2. Verify that unauthenticated users are redirected to login.
  await expect(page).toHaveURL(/\/login\/?([?#].*)?$/, {
    timeout: 15000,
  });

  // 3. Verify that the login form is visible.
  await expect(page.getByPlaceholder("البريد الإلكتروني")).toBeVisible();

  await expect(page.getByPlaceholder("كلمة المرور")).toBeVisible();
});

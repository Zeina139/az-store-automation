const { test, expect } = require("@playwright/test");

test("guest is redirected to login when clicking a product action", async ({
  page,
}) => {
  await page.goto("https://az-store961.netlify.app/");

  const firstProduct = page.locator(".products-grid .card").first();

  await expect(firstProduct).toBeVisible();

  await firstProduct.hover();

  const loginButton = firstProduct
    .getByRole("button", {
      name: /سجل الدخول/,
    })
    .first();

  await expect(loginButton).toBeVisible();

  await loginButton.click();

  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
});

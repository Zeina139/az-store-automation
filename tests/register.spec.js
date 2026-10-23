const { test, expect } = require("@playwright/test");

test.describe("Registration form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://az-store961.netlify.app/register");
  });

  test("shows an error when all fields are empty", async ({ page }) => {
    await page.getByRole("button", { name: "إنشاء حساب" }).click();

    await expect(page.getByText("يرجى تعبئة جميع الحقول")).toBeVisible();
  });

  test("shows an error when the password is shorter than six characters", async ({
    page,
  }) => {
    await page
      .getByPlaceholder("البريد الإلكتروني")
      .fill("qa-test@example.com");
    await page.getByPlaceholder("كلمة المرور", { exact: true }).fill("12345");
    await page.getByPlaceholder("تأكيد كلمة المرور").fill("12345");

    await page.getByRole("button", { name: "إنشاء حساب" }).click();

    await expect(
      page.getByText("كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    ).toBeVisible();
  });

  test("shows an error when passwords do not match", async ({ page }) => {
    await page.goto("https://az-store961.netlify.app/register");

    await page
      .getByPlaceholder("البريد الإلكتروني")
      .fill("qa-test@example.com");
    await page
      .getByPlaceholder("كلمة المرور", { exact: true })
      .fill("Secret123");
    await page.getByPlaceholder("تأكيد كلمة المرور").fill("Different123");

    await page.getByRole("button", { name: "إنشاء حساب" }).click();

    await expect(page.locator(".error")).toContainText(
      "كلمتا المرور غير متطابقتين",
    );
  });

  test("shows an error when Supabase rejects an invalid email", async ({
    page,
  }) => {
    await page.getByPlaceholder("البريد الإلكتروني").fill("zeinaurwa44@");
    await page.getByPlaceholder("كلمة المرور", { exact: true }).fill("1234567");
    await page.getByPlaceholder("تأكيد كلمة المرور").fill("1234567");

    const signupResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/auth/v1/signup") &&
        response.request().method() === "POST",
    );

    await page.getByRole("button", { name: "إنشاء حساب" }).click();

    const response = await signupResponse;

    expect(response.status()).toBe(400);

    await expect(page.locator(".error")).toContainText(
      "حدث خطأ أثناء إنشاء الحساب",
    );

    await expect(page.locator(".success")).toBeHidden();
    await expect(page).toHaveURL(/\/register/);
  });

  test("shows an error when the email is empty", async ({ page }) => {
    await page
      .getByPlaceholder("كلمة المرور", { exact: true })
      .fill("Secret123");
    await page.getByPlaceholder("تأكيد كلمة المرور").fill("Secret123");

    await page.getByRole("button", { name: "إنشاء حساب" }).click();

    await expect(page.locator(".error")).toContainText(
      "يرجى تعبئة جميع الحقول",
    );
    await expect(page.locator(".success")).toBeHidden();
  });

  test("shows an error when the password is empty", async ({ page }) => {
    await page
      .getByPlaceholder("البريد الإلكتروني")
      .fill("qa-test@example.com");
    await page.getByPlaceholder("تأكيد كلمة المرور").fill("Secret123");

    await page.getByRole("button", { name: "إنشاء حساب" }).click();

    await expect(page.locator(".error")).toContainText(
      "يرجى تعبئة جميع الحقول",
    );
    await expect(page.locator(".success")).toBeHidden();
  });

  test("shows an error when the password confirmation is empty", async ({
    page,
  }) => {
    await page
      .getByPlaceholder("البريد الإلكتروني")
      .fill("qa-test@example.com");
    await page
      .getByPlaceholder("كلمة المرور", { exact: true })
      .fill("Secret123");

    await page.getByRole("button", { name: "إنشاء حساب" }).click();

    await expect(page.locator(".error")).toContainText(
      "يرجى تعبئة جميع الحقول",
    );
    await expect(page.locator(".success")).toBeHidden();
  });

  test("toggles password visibility", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("كلمة المرور", { exact: true });
    const toggle = page.locator(".password-wrapper").first().locator(".toggle");

    await passwordInput.fill("Secret123");

    await expect(passwordInput).toHaveAttribute("type", "password");

    await toggle.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await toggle.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("toggles password confirmation visibility independently", async ({
    page,
  }) => {
    const passwordInput = page.getByPlaceholder("كلمة المرور", { exact: true });
    const confirmInput = page.getByPlaceholder("تأكيد كلمة المرور");
    const passwordToggle = page
      .locator(".password-wrapper")
      .nth(0)
      .locator(".toggle");
    const confirmToggle = page
      .locator(".password-wrapper")
      .nth(1)
      .locator(".toggle");

    await passwordInput.fill("Secret123");
    await confirmInput.fill("Secret123");

    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(confirmInput).toHaveAttribute("type", "password");

    await confirmToggle.click();

    await expect(confirmInput).toHaveAttribute("type", "text");
    await expect(passwordInput).toHaveAttribute("type", "password");

    await confirmToggle.click();
    await passwordToggle.click();

    await expect(passwordInput).toHaveAttribute("type", "text");
    await expect(confirmInput).toHaveAttribute("type", "password");
  });
});

require("dotenv").config();

const { test, expect } = require("@playwright/test");
const { MailSlurp } = require("mailslurp-client");

const BASE_URL = "https://az-store961.netlify.app";

test("registers a new user and verifies their email", async ({ page }) => {
  test.setTimeout(120000);

  // 1. Check that MailSlurp API key exists
  const apiKey = process.env.MAILSLURP_API_KEY;

  expect(apiKey, "MAILSLURP_API_KEY must be set in .env").toBeTruthy();

  // 2. Create a fresh test inbox for this registration
  const mailslurp = new MailSlurp({ apiKey });

  const inbox = await mailslurp.createInbox();

  expect(inbox.id).toBeTruthy();
  expect(inbox.emailAddress).toBeTruthy();

  const uniqueEmail = inbox.emailAddress;

  console.log("Created a fresh test inbox:", uniqueEmail);

  // 3. Open the registration page
  await page.goto(`${BASE_URL}/register`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // 4. Fill in the registration form
  await page.getByPlaceholder("البريد الإلكتروني").fill(uniqueEmail);

  await page.locator('input[placeholder="كلمة المرور"]').fill("QaTest2002!");

  await page.getByPlaceholder("تأكيد كلمة المرور").fill("QaTest2002!");

  // 5. Submit the registration form
  await page.getByRole("button", { name: "إنشاء حساب" }).click();

  // 6. Verify that the success message is displayed
  const successMessage = page.locator(".success");

  await expect(successMessage).toBeVisible({
    timeout: 15000,
  });

  await expect(successMessage).toContainText(uniqueEmail);

  await expect(page.locator(".error")).toBeHidden();

  console.log("Registration success message displayed.");

  // 7. Wait for the verification email
  console.log("Waiting for the verification email...");

  const email = await mailslurp.waitForLatestEmail(inbox.id, 60000, true);

  // 8. Verify the email subject
  expect(email.subject).toContain("Confirm Your Signup");

  // 9. Extract the email content
  const content = [
    email.body || "",
    email.bodyExcerpt || "",
    typeof email.html === "string" ? email.html : "",
  ].join("\n");

  // 10. Find the Supabase verification URL
  const urls = content.match(/https?:\/\/[^\s"'<>]+/g) || [];

  const verificationUrl = urls
    .map((url) => url.replace(/&amp;/g, "&").replace(/[),.;]+$/, ""))
    .find((url) => /\/auth\/v1\/verify\?/i.test(url));

  expect(
    verificationUrl,
    "A Supabase verification link should exist in the email",
  ).toBeTruthy();

  console.log("Verification link found.");

  // 11. Open the verification link
  await page.goto(verificationUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // 12. Make sure the verification link has not expired
  const currentUrl = page.url();

  if (
    currentUrl.includes("error_code=otp_expired") ||
    currentUrl.includes("error=access_denied")
  ) {
    throw new Error(`Email verification failed. Current URL: ${currentUrl}`);
  }

  // 13. Verify that the user is redirected to the login page
  await page.waitForURL(
    (url) => url.pathname.replace(/\/+$/, "") === "/login",
    { timeout: 20000 },
  );

  await expect(page).toHaveURL(/\/login\/?([?#].*)?$/);
  // 14. Log in with the newly registered account
await page.getByPlaceholder("البريد الإلكتروني").fill(uniqueEmail);
await page.getByPlaceholder("كلمة المرور").fill("QaTest2002!");

await page.getByRole("button", { name: "تسجيل الدخول" }).click();

// 15. Verify successful login
await expect(page).not.toHaveURL(/\/login\/?([?#].*)?$/, {
  timeout: 30000,
});

console.log("Newly registered user logged in successfully.");

  console.log("Email verification completed successfully.");
  console.log("Registration and email verification flow passed.");
});

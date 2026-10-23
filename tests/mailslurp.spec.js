require("dotenv").config();

const { test, expect } = require("@playwright/test");
const { MailSlurp } = require("mailslurp-client");

test("can connect to MailSlurp and find the test inbox", async () => {
  const apiKey = process.env.MAILSLURP_API_KEY;

  expect(apiKey, "MAILSLURP_API_KEY must be set in .env").toBeTruthy();

  const mailslurp = new MailSlurp({ apiKey });

  const inbox = await mailslurp.getInbox(
    "3fab02b5-dab9-4a86-96fd-a22848fe8307",
  );

  expect(inbox.emailAddress).toBe(
    "3fab02b5-dab9-4a86-96fd-a22848fe8307@sandbox.zazamail.link",
  );
});

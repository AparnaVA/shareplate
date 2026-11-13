import { test, expect } from "@playwright/test";

test("Donor can register, login, create and view a donation", async ({ page }) => {
  // Create a unique email so the test can run multiple times
  const uniqueEmail = `testuser${Date.now()}@example.com`;

  // 1. Open the Register page
  await page.goto("http://localhost:5173/register");

  // 2. Register a new DONOR
  await page.getByLabel("Name").fill("Playwright Test User");

  await page.getByLabel("Email address").fill(uniqueEmail);

  await page.getByLabel("Password").fill("TestPassword123");

  await page.getByLabel("I am registering as").selectOption("DONOR");

  await page.getByRole("button", {
    name: "Create Account",
  }).click();

  // Verify registration was successful
  await expect(
    page.getByText("Registration successful!")
  ).toBeVisible();

  // Wait for redirect to Login
  await page.waitForURL("**/login");

  // 3. Login
  await page.getByLabel("Email address").fill(uniqueEmail);

  await page.getByLabel("Password").fill("TestPassword123");

  await page.getByRole("button", {
    name: "Sign In",
  }).click();

  // Verify DONOR is redirected to My Donations
  await page.waitForURL("**/my-donations");

  // 4. Open Create Donation page
  await page.getByRole("link", {
    name: "Create Donation",
  }).click();

  // Fill donation form
  await page.getByLabel("Food name").fill(
    "Playwright Test Meals"
  );

  await page.getByLabel("Description").fill(
    "Fresh meals created during automated testing"
  );

  await page.getByLabel("Quantity").fill("10");

  await page.getByLabel("Unit").fill("packets");

  await page.getByLabel("Pickup location").fill(
    "Test Location"
  );

  // Set a future expiry date
  await page.getByLabel("Available until").fill(
    "2026-12-31T18:00"
  );

  await page.getByRole("button", {
    name: "Create Donation",
  }).click();

  // Verify redirect to My Donations
  await page.waitForURL("**/my-donations");

  // 5. Verify the donation is displayed
  await expect(
    page.getByText("Playwright Test Meals")
  ).toBeVisible();
});
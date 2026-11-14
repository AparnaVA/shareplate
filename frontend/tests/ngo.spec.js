import { test, expect } from "@playwright/test";

test("NGO can view and claim an available donation", async ({ page }) => {
  const timestamp = Date.now();

  const donorEmail = `donor${timestamp}@example.com`;
  const ngoEmail = `ngo${timestamp}@example.com`;

  const foodName = `Test Food ${timestamp}`;

  // -----------------------------------
  // PART 1: Register and login as DONOR
  // -----------------------------------

  await page.goto("http://localhost:5173/register");

  await page.getByLabel("Name").fill("Test Donor");

  await page.getByLabel("Email address").fill(donorEmail);

  await page.getByLabel("Password").fill("TestPassword123");

  await page
    .getByLabel("I am registering as")
    .selectOption("DONOR");

  await page.getByRole("button", {
    name: "Create Account",
  }).click();

  await page.waitForURL("**/login");

  // Login as donor
  await page.getByLabel("Email address").fill(donorEmail);

  await page.getByLabel("Password").fill("TestPassword123");

  await page.getByRole("button", {
    name: "Sign In",
  }).click();

  await page.waitForURL("**/my-donations");

  // -----------------------------------
  // PART 2: Create a donation
  // -----------------------------------

  await page.getByRole("link", {
    name: "Share Food",
  }).click();

  await page.getByLabel("Food name").fill(foodName);

  await page.getByLabel("Description").fill(
    "Food created for NGO end-to-end testing"
  );

  await page.getByLabel("Quantity").fill("10");

  await page.getByLabel("Unit").fill("packets");

  await page.getByLabel("Pickup location").fill(
    "Test Location"
  );

  // Create a future expiry date
  await page.getByLabel("Available until").fill(
    "2027-12-31T18:00"
  );

  await page.getByRole("button", {
    name: "Create Donation",
  }).click();

  await page.waitForURL("**/my-donations");

  // Verify donation was created
  await expect(
    page.getByText(foodName)
  ).toBeVisible();

  // -----------------------------------
  // PART 3: Logout DONOR
  // -----------------------------------

  await page.getByRole("button", {
    name: "Logout",
  }).click();

  await page.waitForURL("**/login");

  // -----------------------------------
  // PART 4: Register NGO
  // -----------------------------------

  await page.goto("http://localhost:5173/register");

  await page.getByLabel("Name").fill("Test NGO");

  await page.getByLabel("Email address").fill(ngoEmail);

  await page.getByLabel("Password").fill("TestPassword123");

  await page
    .getByLabel("I am registering as")
    .selectOption("NGO");

  await page.getByRole("button", {
    name: "Create Account",
  }).click();

  await page.waitForURL("**/login");

  // -----------------------------------
  // PART 5: Login as NGO
  // -----------------------------------

  await page.getByLabel("Email address").fill(ngoEmail);

  await page.getByLabel("Password").fill("TestPassword123");

  await page.getByRole("button", {
    name: "Sign In",
  }).click();

  await page.waitForURL("**/donations");

  // -----------------------------------
  // PART 6: Find and claim the donation
  // -----------------------------------

  await expect(
    page.getByText(foodName)
  ).toBeVisible();

  // Find the card containing our donation
  const donationCard = page.locator(".available-card").filter({
    hasText: foodName,
  });

  // Enter quantity to claim
  await donationCard
    .getByLabel("Quantity to claim")
    .fill("5");

  await donationCard.getByRole("button", {
    name: "Claim Food",
  }).click();

  // Verify successful claim
  await expect(
    page.getByText(`${foodName} claimed successfully!`)
  ).toBeVisible();

  // Verify the remaining quantity is displayed
  await expect(
    donationCard.getByText("5 packets", { exact: false })
  ).toBeVisible();
});
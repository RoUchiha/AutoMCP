import { expect, test } from "@playwright/test";

test("creates an inspectable MCP package through the Core-to-Advanced flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /build the connector/i })).toBeVisible();
  await page.getByRole("switch", { name: /advanced capabilities/i }).click();
  await expect(page.getByText("Scheduled jobs")).toBeVisible();
  await expect(page.getByText("Generated package")).toBeVisible();
  await expect(page.getByRole("button", { name: /download generated server/i })).toBeVisible();
});

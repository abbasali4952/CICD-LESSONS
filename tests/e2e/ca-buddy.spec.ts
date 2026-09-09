import { expect, test } from "@playwright/test";

import { interceptGemini } from "./intercept-gemini";

test.describe("CA Buddy acceptance journey", () => {
  test("answers an in-scope question and preserves the visible disclaimer", async ({ page }) => {
    const requests = await interceptGemini(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "CA Buddy" })).toBeVisible();
    await expect(page.getByRole("button", { name: /new chat/i })).toBeVisible();
    await expect(page.getByText(/does not replace a Chartered Accountant/i)).toBeVisible();

    await page.getByLabel("Your tax or audit question").fill("What is the GST return deadline?");
    await page.getByRole("button", { name: /send question/i }).click();

    await expect(page.getByText(/GST return deadlines depend/i)).toBeVisible();
    expect(requests).toHaveLength(1);
  });

  test("uses follow-up context and clears it with New chat", async ({ page }) => {
    const requests = await interceptGemini(page);
    await page.goto("/");
    const input = page.getByLabel("Your tax or audit question");

    await input.fill("What is GST?");
    await page.getByRole("button", { name: /send question/i }).click();
    await expect(page.getByText(/GST return deadlines depend/i)).toBeVisible();

    await input.fill("What happens next?");
    await page.getByRole("button", { name: /send question/i }).click();
    await expect(page.getByText(/GST return deadlines depend/i)).toHaveCount(2);
    expect(requests).toHaveLength(2);

    await page.getByRole("button", { name: /new chat/i }).click();
    await expect(page.getByText(/Ask a routine question/i)).toBeVisible();
    await expect(page.getByText("What is GST?")).not.toBeVisible();
  });

  test("shows the consultation fallback for a situation-specific question", async ({ page }) => {
    await interceptGemini(page);
    await page.goto("/");

    await page.getByLabel("Your tax or audit question").fill("Decide my tax liability from my business records");
    await page.getByRole("button", { name: /send question/i }).click();

    await expect(page.getByText(/Please consult a Chartered Accountant/i)).toBeVisible();
  });

  test("shows a retryable failure without inventing an answer", async ({ page }) => {
    await interceptGemini(page);
    await page.goto("/");

    await page.getByLabel("Your tax or audit question").fill("failure");
    await page.getByRole("button", { name: /send question/i }).click();

    await expect(page.getByRole("alert")).toContainText(/could not (complete|reach)/i);
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
  });

  test("does not restore messages after reload", async ({ page }) => {
    await interceptGemini(page);
    await page.goto("/");
    await page.getByLabel("Your tax or audit question").fill("What is GST?");
    await page.getByRole("button", { name: /send question/i }).click();
    await expect(page.getByText(/GST return deadlines depend/i)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/Ask a routine question/i)).toBeVisible();
    await expect(page.getByText("What is GST?")).not.toBeVisible();
  });
});

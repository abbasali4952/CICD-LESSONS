import type { Page } from "@playwright/test";

import {
  CONSULT_CA_REPLY,
  GENERAL_GUIDANCE_REPLY,
  geminiReply,
} from "../fixtures/gemini-responses";

export async function interceptGemini(page: Page) {
  const requests: string[] = [];

  await page.route("**/generativelanguage.googleapis.com/**", async (route) => {
    const body = route.request().postData() ?? "";
    requests.push(body);

    if (/failure/i.test(body)) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "controlled test failure" } }),
      });
      return;
    }

    const text = /business records|tax liability/i.test(body)
      ? CONSULT_CA_REPLY
      : GENERAL_GUIDANCE_REPLY;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(geminiReply(text)),
    });
  });

  return requests;
}

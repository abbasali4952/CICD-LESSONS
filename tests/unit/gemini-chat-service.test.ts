import { beforeEach, describe, expect, it, vi } from "vitest";

import { GeminiChatService, MAX_OUTPUT_TOKENS, MODEL_NAME } from "../../src/services/gemini-chat-service";

describe("GeminiChatService", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the required model and token limit", () => {
    expect(MODEL_NAME).toBe("gemma-4-26b-a4b-it");
    expect(MAX_OUTPUT_TOKENS).toBe(512);
  });

  it("returns a safe configuration error when no demo key is present", async () => {
    vi.stubEnv("VITE_GOOGLE_API_KEY", "");
    const service = new GeminiChatService("test persona");

    await expect(
      service.send(
        {
          requestId: "configuration-request",
          conversationGeneration: 0,
          messages: [{ id: "message-1", role: "user", content: "GST", sequence: 0 }],
        },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({
      kind: "configuration",
      retryable: false,
      requestId: "configuration-request",
    });
  });

  it("rejects before provider work when already aborted", async () => {
    vi.stubEnv("VITE_GOOGLE_API_KEY", "test-key");
    const service = new GeminiChatService("test persona");
    const controller = new AbortController();
    controller.abort();

    await expect(
      service.send(
        {
          requestId: "aborted-request",
          conversationGeneration: 0,
          messages: [{ id: "message-1", role: "user", content: "GST", sequence: 0 }],
        },
        controller.signal,
      ),
    ).rejects.toMatchObject({ kind: "aborted", retryable: false });
  });
});

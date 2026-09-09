import { describe, expect, it } from "vitest";

import { FakeChatService, createFakeFailure } from "../fakes/fake-chat-service";

describe("ChatService contract", () => {
  it("records ordered conversation snapshots and returns one reply", async () => {
    const service = new FakeChatService();
    const controller = new AbortController();
    const request = {
      requestId: "request-1",
      conversationGeneration: 0,
      messages: [
        { id: "message-1", role: "user" as const, content: "What is GST?", sequence: 0 },
      ],
    };

    const reply = await service.send(request, controller.signal);

    expect(reply.content).toContain("GST");
    expect(service.requests).toHaveLength(1);
    expect(service.requests[0]?.messages).toEqual(request.messages);
  });

  it("rejects an aborted request without making a response", async () => {
    const service = new FakeChatService();
    const controller = new AbortController();
    controller.abort();

    await expect(
      service.send(
        {
          requestId: "request-aborted",
          conversationGeneration: 0,
          messages: [{ id: "message-1", role: "user", content: "GST", sequence: 0 }],
        },
        controller.signal,
      ),
    ).rejects.toMatchObject({ kind: "aborted", retryable: false });
  });

  it("returns typed retryable failures", async () => {
    const service = new FakeChatService();
    service.setNextError(createFakeFailure("request-failure"));

    await expect(
      service.send(
        {
          requestId: "request-failure",
          conversationGeneration: 0,
          messages: [{ id: "message-1", role: "user", content: "GST", sequence: 0 }],
        },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ kind: "provider", retryable: true });
  });
});

import type {
  ChatReply,
  ChatRequest,
  ChatServiceError,
} from "../../src/types/chat";
import type { ChatService } from "../../src/services/chat-service";
import {
  createChatServiceError,
} from "../../src/services/chat-service";
import {
  FAILURE_MESSAGE,
  responseForQuestion,
} from "../fixtures/chat-responses";

export class FakeChatService implements ChatService {
  readonly requests: ChatRequest[] = [];
  private nextReply: ChatReply | null = null;
  private nextError: ChatServiceError | null = null;
  private deferred: Promise<ChatReply> | null = null;

  setNextReply(reply: ChatReply): void {
    this.nextReply = reply;
  }

  setNextError(error: ChatServiceError): void {
    this.nextError = error;
  }

  deferNextReply(): { promise: Promise<ChatReply>; resolve: (reply: ChatReply) => void } {
    let resolve!: (reply: ChatReply) => void;
    const promise = new Promise<ChatReply>((promiseResolve) => {
      resolve = promiseResolve;
    });
    this.deferred = promise;
    return { promise, resolve };
  }

  async send(request: ChatRequest, signal: AbortSignal): Promise<ChatReply> {
    this.requests.push({
      ...request,
      messages: request.messages.map((message) => ({ ...message })),
    });

    if (signal.aborted) {
      throw createChatServiceError(request.requestId, "aborted", "Request cancelled.", false);
    }

    if (this.nextError) {
      const error = this.nextError;
      this.nextError = null;
      throw error;
    }

    if (this.deferred) {
      const pending = this.deferred;
      this.deferred = null;
      return pending;
    }

    const question = request.messages.at(-1)?.content ?? "";
    const reply = this.nextReply ?? responseForQuestion(question);
    this.nextReply = null;
    return reply;
  }
}

export function createFakeFailure(requestId = "fake-request"): ChatServiceError {
  return createChatServiceError(requestId, "provider", FAILURE_MESSAGE, true);
}

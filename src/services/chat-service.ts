import type { ChatReply, ChatRequest, ChatServiceError } from "../types/chat";

export interface ChatService {
  send(request: ChatRequest, signal: AbortSignal): Promise<ChatReply>;
}

export function isChatServiceError(error: unknown): error is ChatServiceError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Partial<ChatServiceError>;
  return (
    typeof candidate.kind === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.retryable === "boolean" &&
    typeof candidate.requestId === "string"
  );
}

export function createChatServiceError(
  requestId: string,
  kind: ChatServiceError["kind"],
  message: string,
  retryable: boolean,
): ChatServiceError {
  return { requestId, kind, message, retryable };
}

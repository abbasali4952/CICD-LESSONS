export type MessageRole = "user" | "assistant";
export type ReplyDisposition = "general-guidance" | "consult-ca";
export type RequestState = "idle" | "sending" | "error";
export type ChatErrorKind = "configuration" | "network" | "provider" | "aborted";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sequence: number;
}

export interface ChatRequest {
  messages: ChatMessage[];
  requestId: string;
  conversationGeneration: number;
}

export interface ChatReply {
  content: string;
  disposition: ReplyDisposition;
}

export interface ChatServiceError {
  kind: ChatErrorKind;
  message: string;
  retryable: boolean;
  requestId: string;
}

export interface ConversationState {
  generation: number;
  messages: ChatMessage[];
  requestState: RequestState;
  pendingRequestId: string | null;
  error: ChatServiceError | null;
}

import { useCallback, useRef, useState } from "react";

import {
  createChatServiceError,
  isChatServiceError,
  type ChatService,
} from "../services/chat-service";
import type {
  ChatMessage,
  ChatServiceError,
  ConversationState,
} from "../types/chat";

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const initialState: ConversationState = {
  generation: 0,
  messages: [],
  requestState: "idle",
  pendingRequestId: null,
  error: null,
};

export function useChat(chatService: ChatService) {
  const [state, setState] = useState<ConversationState>(initialState);
  const messagesRef = useRef<ChatMessage[]>([]);
  const generationRef = useRef(0);
  const activeRequestRef = useRef<{
    controller: AbortController;
    generation: number;
    requestId: string;
  } | null>(null);
  const retryMessageRef = useRef<ChatMessage | null>(null);

  const commitMessages = useCallback((messages: ChatMessage[]) => {
    messagesRef.current = messages;
    setState((current) => ({ ...current, messages }));
  }, []);

  const requestReply = useCallback(
    async (messages: ChatMessage[], submittedMessage: ChatMessage) => {
      const generation = generationRef.current;
      const requestId = createId("request");
      const controller = new AbortController();
      activeRequestRef.current = { controller, generation, requestId };
      setState((current) => ({
        ...current,
        requestState: "sending",
        pendingRequestId: requestId,
        error: null,
      }));

      try {
        const reply = await chatService.send(
          {
            messages,
            requestId,
            conversationGeneration: generation,
          },
          controller.signal,
        );

        const isCurrent =
          generationRef.current === generation &&
          activeRequestRef.current?.requestId === requestId;
        if (!isCurrent) {
          return;
        }

        const assistantMessage: ChatMessage = {
          id: createId("assistant"),
          role: "assistant",
          content: reply.content.trim(),
          sequence: messagesRef.current.length,
        };
        commitMessages([...messagesRef.current, assistantMessage]);
        retryMessageRef.current = null;
        activeRequestRef.current = null;
        setState((current) => ({
          ...current,
          requestState: "idle",
          pendingRequestId: null,
          error: null,
        }));
      } catch (caughtError) {
        const isCurrent =
          generationRef.current === generation &&
          activeRequestRef.current?.requestId === requestId;
        if (!isCurrent || controller.signal.aborted) {
          return;
        }

        const error: ChatServiceError = isChatServiceError(caughtError)
          ? caughtError
          : createChatServiceError(
              requestId,
              "provider",
              "CA Buddy could not complete that answer. Please try again.",
              true,
            );
        retryMessageRef.current = submittedMessage;
        activeRequestRef.current = null;
        setState((current) => ({
          ...current,
          requestState: "error",
          pendingRequestId: null,
          error: { ...error, requestId },
        }));
      }
    },
    [chatService, commitMessages],
  );

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || state.requestState === "sending") {
        return;
      }

      const userMessage: ChatMessage = {
        id: createId("user"),
        role: "user",
        content: trimmed,
        sequence: messagesRef.current.length,
      };
      const messages = [...messagesRef.current, userMessage];
      retryMessageRef.current = null;
      commitMessages(messages);
      void requestReply(messages, userMessage);
    },
    [commitMessages, requestReply, state.requestState],
  );

  const retry = useCallback(() => {
    const failedMessage = retryMessageRef.current;
    if (!failedMessage || state.requestState === "sending") {
      return;
    }
    retryMessageRef.current = null;
    void requestReply([...messagesRef.current], failedMessage);
  }, [requestReply, state.requestState]);

  const reset = useCallback(() => {
    activeRequestRef.current?.controller.abort();
    activeRequestRef.current = null;
    generationRef.current += 1;
    retryMessageRef.current = null;
    commitMessages([]);
    setState({
      generation: generationRef.current,
      messages: [],
      requestState: "idle",
      pendingRequestId: null,
      error: null,
    });
  }, [commitMessages]);

  return {
    ...state,
    isSending: state.requestState === "sending",
    sendMessage,
    retry,
    reset,
  };
}

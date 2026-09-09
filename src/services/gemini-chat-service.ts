import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { CA_PERSONA_PROMPT } from "../prompts/ca-persona";
import type { ChatMessage, ChatReply, ChatRequest } from "../types/chat";
import {
  createChatServiceError,
  type ChatService,
} from "./chat-service";

const MODEL_NAME = "gemma-4-26b-a4b-it";
const MAX_OUTPUT_TOKENS = 512;

function toProviderMessage(message: ChatMessage) {
  return message.role === "user"
    ? new HumanMessage(message.content)
    : new AIMessage(message.content);
}

function getResponseText(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (part && typeof part === "object" && "text" in part) {
          return typeof part.text === "string" ? part.text : "";
        }
        return "";
      })
      .join("")
      .trim();
  }

  return "";
}

function classifyProviderError(error: unknown): "network" | "provider" {
  if (error instanceof TypeError || (error instanceof Error && /network|fetch|timeout/i.test(error.message))) {
    return "network";
  }
  return "provider";
}

export class GeminiChatService implements ChatService {
  private readonly model: ChatGoogleGenerativeAI | null;
  private readonly configurationError: string | null;
  private readonly systemPrompt: string;

  constructor(systemPrompt = CA_PERSONA_PROMPT) {
    this.systemPrompt = systemPrompt;
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;

    if (!apiKey || apiKey === "your_demo_key_here") {
      this.model = null;
      this.configurationError = "Gemini is not configured for this demo.";
      return;
    }

    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      model: MODEL_NAME,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      maxRetries: 0,
      temperature: 0.2,
    });
    this.configurationError = null;
  }

  async send(request: ChatRequest, signal: AbortSignal): Promise<ChatReply> {
    if (signal.aborted) {
      throw createChatServiceError(request.requestId, "aborted", "Request cancelled.", false);
    }

    if (this.configurationError || !this.model) {
      throw createChatServiceError(
        request.requestId,
        "configuration",
        this.configurationError ?? "Gemini is not configured for this demo.",
        false,
      );
    }

    try {
      const response = await this.model.invoke(
        [new SystemMessage(this.systemPrompt), ...request.messages.map(toProviderMessage)],
        { signal },
      );
      const content = getResponseText(response.content);

      if (!content) {
        throw createChatServiceError(
          request.requestId,
          "provider",
          "Gemini returned an empty response. Please try again.",
          true,
        );
      }

      return {
        content,
        disposition: /consult a chartered accountant|needs review by a chartered accountant/i.test(content)
          ? "consult-ca"
          : "general-guidance",
      };
    } catch (error) {
      if (error && typeof error === "object" && "kind" in error) {
        throw error;
      }
      if (signal.aborted) {
        throw createChatServiceError(request.requestId, "aborted", "Request cancelled.", false);
      }
      const kind = classifyProviderError(error);
      throw createChatServiceError(
        request.requestId,
        kind,
        kind === "network"
          ? "We could not reach CA Buddy. Check your connection and try again."
          : "CA Buddy could not complete that answer. Please try again.",
        true,
      );
    }
  }
}

export { MAX_OUTPUT_TOKENS, MODEL_NAME };

import type { ChatReply } from "../../src/types/chat";
import { CONSULT_CA_FALLBACK } from "../../src/prompts/ca-persona";

export const IN_SCOPE_REPLY: ChatReply = {
  disposition: "general-guidance",
  content:
    "GST return deadlines depend on your filing frequency and return type. Check the current filing calendar for your registration, and consult a Chartered Accountant if your situation is unusual.",
};

export const CONSULT_CA_REPLY: ChatReply = {
  disposition: "consult-ca",
  content: CONSULT_CA_FALLBACK,
};

export const FAILURE_MESSAGE = "The demo service could not complete that answer. Please try again.";

export function responseForQuestion(question: string): ChatReply {
  return /gst|tds|itr|income tax return|audit/i.test(question)
    ? IN_SCOPE_REPLY
    : CONSULT_CA_REPLY;
}

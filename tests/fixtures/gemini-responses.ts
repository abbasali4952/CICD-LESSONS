export function geminiReply(text: string) {
  return {
    candidates: [
      {
        content: {
          parts: [{ text }],
          role: "model",
        },
        finishReason: "STOP",
        index: 0,
      },
    ],
    usageMetadata: {
      promptTokenCount: 20,
      candidatesTokenCount: Math.max(1, text.length / 4),
      totalTokenCount: 24,
    },
  };
}

export const GENERAL_GUIDANCE_REPLY =
  "GST return deadlines depend on your filing frequency and return type. Check the current filing calendar, and consult a Chartered Accountant if your situation is unusual.";

export const CONSULT_CA_REPLY =
  "Please consult a Chartered Accountant for this situation. CA Buddy can provide only general guidance about GST, TDS, ITR deadlines, and audit basics.";

import { describe, expect, it } from "vitest";

import {
  CA_PERSONA_PROMPT,
  CONSULT_CA_FALLBACK,
  DISCLAIMER_TEXT,
} from "../../src/prompts/ca-persona";

describe("CA Buddy persona", () => {
  it("defines the supported topics and plain-language boundary", () => {
    expect(CA_PERSONA_PROMPT).toContain("GST");
    expect(CA_PERSONA_PROMPT).toContain("TDS");
    expect(CA_PERSONA_PROMPT).toContain("ITR deadlines");
    expect(CA_PERSONA_PROMPT).toContain("Audit basics");
    expect(CA_PERSONA_PROMPT).toContain("plain-language guidance");
  });

  it("defines the professional consultation fallback and disclaimer", () => {
    expect(CONSULT_CA_FALLBACK).toMatch(/consult a Chartered Accountant/i);
    expect(DISCLAIMER_TEXT).toMatch(/does not replace a Chartered Accountant/i);
    expect(CA_PERSONA_PROMPT).toMatch(/guarantee correctness/i);
    expect(CA_PERSONA_PROMPT).toMatch(/file taxes/i);
  });
});

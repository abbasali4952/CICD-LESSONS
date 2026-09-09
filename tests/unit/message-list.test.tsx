import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MessageList } from "../../src/components/message-list";

describe("MessageList", () => {
  it("shows the guided empty state", () => {
    render(<MessageList messages={[]} />);
    expect(screen.getByText(/Ask a routine question/i)).toBeInTheDocument();
  });

  it("renders user and assistant messages in order", () => {
    render(
      <MessageList
        messages={[
          { id: "user-1", role: "user", content: "What is GST?", sequence: 0 },
          { id: "assistant-1", role: "assistant", content: "GST is a tax system.", sequence: 1 },
        ]}
      />,
    );

    const conversation = screen.getByRole("log");
    expect(conversation).toHaveTextContent("You");
    expect(conversation).toHaveTextContent("CA Buddy");
    expect(conversation.textContent?.indexOf("What is GST?")).toBeLessThan(
      conversation.textContent?.indexOf("GST is a tax system.") ?? 0,
    );
  });
});

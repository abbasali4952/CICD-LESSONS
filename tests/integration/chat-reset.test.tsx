import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "../../src/App";
import { FakeChatService } from "../fakes/fake-chat-service";

describe("CA Buddy reset lifecycle", () => {
  it("clears a pending conversation and ignores its late reply", async () => {
    const user = userEvent.setup();
    const service = new FakeChatService();
    const pending = service.deferNextReply();
    render(<App chatService={service} />);

    await user.type(screen.getByLabelText(/tax or audit question/i), "What is GST?");
    await user.click(screen.getByRole("button", { name: /send question/i }));
    await waitFor(() => expect(screen.getByText(/CA Buddy is thinking/i)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /new chat/i }));
    expect(screen.queryByText("What is GST?")).not.toBeInTheDocument();
    expect(screen.getByText(/Ask a routine question/i)).toBeInTheDocument();

    pending.resolve({ disposition: "general-guidance", content: "Stale answer" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByText("Stale answer")).not.toBeInTheDocument();
  });
});

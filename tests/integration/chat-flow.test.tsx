import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "../../src/App";
import { FakeChatService } from "../fakes/fake-chat-service";

describe("CA Buddy chat flow", () => {
  it("shows the required surface and returns one ordered answer", async () => {
    const user = userEvent.setup();
    const service = new FakeChatService();
    render(<App chatService={service} />);

    expect(screen.getByRole("heading", { name: "CA Buddy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new chat/i })).toBeInTheDocument();
    expect(screen.getByText(/does not replace a Chartered Accountant/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/tax or audit question/i), "What is the GST return deadline?");
    await user.click(screen.getByRole("button", { name: /send question/i }));

    await waitFor(() => expect(screen.getByText(/GST return deadlines depend/i)).toBeInTheDocument());
    expect(service.requests).toHaveLength(1);
    expect(screen.getByRole("log").textContent?.indexOf("What is the GST return deadline?")).toBeLessThan(
      screen.getByRole("log").textContent?.indexOf("GST return deadlines depend") ?? 0,
    );
  });

  it("passes active conversation context to a follow-up", async () => {
    const user = userEvent.setup();
    const service = new FakeChatService();
    render(<App chatService={service} />);

    const input = screen.getByLabelText(/tax or audit question/i);
    await user.type(input, "What is GST?");
    await user.click(screen.getByRole("button", { name: /send question/i }));
    await waitFor(() => expect(service.requests).toHaveLength(1));

    await user.type(input, "What happens next?");
    await user.click(screen.getByRole("button", { name: /send question/i }));
    await waitFor(() => expect(service.requests).toHaveLength(2));

    expect(service.requests[1]?.messages.map((message) => message.content)).toEqual([
      "What is GST?",
      expect.stringContaining("GST return deadlines"),
      "What happens next?",
    ]);
  });

  it("retries a failed request without duplicating its user message", async () => {
    const user = userEvent.setup();
    const service = new FakeChatService();
    service.setNextError({
      kind: "provider",
      message: "Temporary failure. Try again.",
      retryable: true,
      requestId: "failure",
    });
    render(<App chatService={service} />);

    const input = screen.getByLabelText(/tax or audit question/i);
    await user.type(input, "What is TDS?");
    await user.click(screen.getByRole("button", { name: /send question/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/Temporary failure/i));

    await user.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(screen.getByText(/GST return deadlines depend/i)).toBeInTheDocument());
    expect(screen.getAllByText("What is TDS?")).toHaveLength(1);
    expect(service.requests).toHaveLength(2);
  });
});

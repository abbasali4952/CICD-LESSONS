import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatComposer } from "../../src/components/chat-composer";

describe("ChatComposer", () => {
  it("submits trimmed non-empty text and clears the input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChatComposer disabled={false} onSubmit={onSubmit} />);

    const input = screen.getByLabelText(/tax or audit question/i);
    await user.type(input, "  What is GST?  ");
    await user.click(screen.getByRole("button", { name: /send question/i }));

    expect(onSubmit).toHaveBeenCalledWith("What is GST?");
    expect(input).toHaveValue("");
  });

  it("does not submit whitespace-only input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChatComposer disabled={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/tax or audit question/i), "   ");
    expect(screen.getByRole("button", { name: /send question/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables controls while a response is pending", () => {
    render(<ChatComposer disabled onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/tax or audit question/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /send question/i })).toBeDisabled();
  });
});

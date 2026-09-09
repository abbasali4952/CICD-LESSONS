import { FormEvent, useState } from "react";

interface ChatComposerProps {
  disabled: boolean;
  onSubmit: (content: string) => void;
}

export function ChatComposer({ disabled, onSubmit }: ChatComposerProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="question-input">
        Your tax or audit question
      </label>
      <input
        id="question-input"
        name="question"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask a question about GST, TDS, ITR deadlines..."
        autoComplete="off"
        disabled={disabled}
      />
      <button type="submit" className="send-button" disabled={disabled || !value.trim()} aria-label="Send question">
        <span aria-hidden="true">↑</span>
      </button>
    </form>
  );
}

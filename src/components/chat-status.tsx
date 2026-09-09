import type { ChatServiceError } from "../types/chat";

interface ChatStatusProps {
  isSending: boolean;
  error: ChatServiceError | null;
  onRetry: () => void;
}

export function ChatStatus({ isSending, error, onRetry }: ChatStatusProps) {
  if (isSending) {
    return (
      <div className="chat-status chat-status--pending" role="status">
        <span className="loading-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>CA Buddy is thinking</span>
      </div>
    );
  }

  if (!error) {
    return null;
  }

  return (
    <div className="chat-status chat-status--error" role="alert">
      <span>{error.message}</span>
      {error.retryable && (
        <button type="button" className="text-button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

import type { ChatMessage } from "../types/chat";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="empty-state" aria-live="polite">
        <span className="empty-state__mark">CA</span>
        <p>Ask a routine question about GST, TDS, ITR deadlines, or audit basics.</p>
      </div>
    );
  }

  return (
    <div className="message-list" role="log" aria-live="polite" aria-label="Conversation">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}

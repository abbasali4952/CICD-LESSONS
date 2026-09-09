import type { ChatMessage } from "../types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  return (
    <article className={`message-row ${isUser ? "message-row--user" : "message-row--assistant"}`}>
      <div className="message-meta">{isUser ? "You" : "CA Buddy"}</div>
      <div className="message-bubble">{message.content}</div>
    </article>
  );
}

import { useMemo } from "react";

import { ChatComposer } from "./components/chat-composer";
import { ChatShell } from "./components/chat-shell";
import { ChatStatus } from "./components/chat-status";
import { MessageList } from "./components/message-list";
import { useChat } from "./hooks/use-chat";
import { GeminiChatService } from "./services/gemini-chat-service";
import type { ChatService } from "./services/chat-service";

interface AppProps {
  chatService?: ChatService;
}

export default function App({ chatService }: AppProps) {
  const productionService = useMemo(() => new GeminiChatService(), []);
  const chat = useChat(chatService ?? productionService);

  return (
    <ChatShell onNewChat={chat.reset} canReset={chat.messages.length > 0 || chat.isSending || Boolean(chat.error)}>
      <MessageList messages={chat.messages} />
      <ChatStatus isSending={chat.isSending} error={chat.error} onRetry={chat.retry} />
      <ChatComposer disabled={chat.isSending} onSubmit={chat.sendMessage} />
    </ChatShell>
  );
}

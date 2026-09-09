import type { ReactNode } from "react";

import { DISCLAIMER_TEXT } from "../prompts/ca-persona";

interface ChatShellProps {
  children: ReactNode;
  onNewChat: () => void;
  canReset: boolean;
}

export function ChatShell({ children, onNewChat, canReset }: ChatShellProps) {
  return (
    <main className="app-shell">
      <div className="paper-texture" aria-hidden="true" />
      <header className="site-header">
        <div className="brand-lockup">
          <span className="brand-mark">CA</span>
          <div>
            <p className="eyebrow">Everyday tax clarity</p>
            <h1>CA Buddy</h1>
          </div>
        </div>
        <button type="button" className="new-chat-button" onClick={onNewChat} disabled={!canReset}>
          <span aria-hidden="true">＋</span>
          New chat
        </button>
      </header>
      <section className="chat-panel" aria-label="CA Buddy chat">
        <div className="panel-intro">
          <div>
            <span className="status-dot" aria-hidden="true" />
            <span>Available for general guidance</span>
          </div>
          <span className="topic-note">GST · TDS · ITR · Audit basics</span>
        </div>
        {children}
      </section>
      <p className="disclaimer">
        <span aria-hidden="true">ⓘ</span>
        {DISCLAIMER_TEXT}
      </p>
    </main>
  );
}

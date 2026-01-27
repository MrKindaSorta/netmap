import React from 'react';
import { Icon } from './MenuBarButton';

const AiChatButton = ({ aiChatOpen, setAiChatOpen, theme }) => {
  return (
    <button
      onClick={() => setAiChatOpen(!aiChatOpen)}
      className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
      style={aiChatOpen
        ? { background: '#2563eb', color: 'white' }
        : { background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }
      }
      onMouseEnter={(e) => !aiChatOpen && (e.currentTarget.style.background = theme.hover)}
      onMouseLeave={(e) => !aiChatOpen && (e.currentTarget.style.background = theme.bg)}
      title="AI Assistant (Ctrl+I)"
    >
      <Icon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" s={14} />
      <span>AI Chat</span>
    </button>
  );
};

export default AiChatButton;

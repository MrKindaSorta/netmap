import React, { useEffect, useRef } from 'react';
import { Icon } from '../common';
import DeviceSuggestionCard from '../ai/DeviceSuggestionCard';
import PendingChangeApproval from '../ai/PendingChangeApproval';

const AiChatPanel = ({
  isOpen,
  onClose,
  theme,
  messages,
  streamingMessage,
  inputValue,
  setInputValue,
  isLoading,
  onSendMessage,
  onClearChat,
  includeNetworkContext,
  onToggleContext,
  error,
  devices,
  deviceTypes,
  getDevColor,
  pendingChange,
  onApproveChange,
  onDismissChange,
  onAddDevice,
  onDeclineSuggestion
}) => {
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [inputValue]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputValue.trim()) {
        onSendMessage();
      }
    }
  };

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy:', err));
  };

  return (
    <div
      className="absolute top-0 right-0 bottom-0 flex flex-col border-l shadow-2xl"
      style={{
        width: '450px',
        background: theme.surface,
        borderColor: theme.border,
        zIndex: 50
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#3b82f6' + '20', color: '#3b82f6' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Assistant</h3>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Network Topology Helper
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-1.5 rounded transition-colors"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.background = theme.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              title="Clear chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-colors"
            style={{ color: theme.text }}
            onMouseEnter={(e) => (e.currentTarget.style.background = theme.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon d="M18 6L6 18M6 6l12 12" s={18} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: '#3b82f6' + '10' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm mb-2" style={{ color: theme.text }}>
              Ask me anything about your network
            </p>
            <p className="text-xs max-w-xs" style={{ color: theme.textMuted }}>
              I can help analyze your topology, suggest optimizations, explain configurations, and answer networking questions.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          // Device suggestion message
          if (msg.type === 'device_suggestion') {
            return (
              <div key={idx} className="flex justify-start">
                <div
                  className="max-w-[95%] rounded-lg rounded-tl-none px-3 py-2"
                  style={{ background: theme.bg, color: theme.text }}
                >
                  <div className="text-sm whitespace-pre-wrap mb-3">
                    {msg.content}
                  </div>
                  <DeviceSuggestionCard
                    suggestionData={msg.data}
                    onAddDevice={() => onAddDevice(msg.data)}
                    onDecline={onDeclineSuggestion}
                    theme={theme}
                    deviceTypes={deviceTypes}
                    getDevColor={getDevColor}
                  />
                  <div className="text-xs mt-2" style={{ color: theme.textMuted }}>
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          }

          // System message
          if (msg.role === 'system') {
            return (
              <div key={idx} className="flex justify-center">
                <div
                  className="px-3 py-1.5 rounded-full text-xs"
                  style={{
                    background: theme.bg,
                    color: theme.textMuted,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          }

          // Regular message
          return (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'
                }`}
                style={{
                  background: msg.role === 'user' ? '#3b82f6' : theme.bg,
                  color: msg.role === 'user' ? '#ffffff' : theme.text
                }}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <div
                    className="text-xs"
                    style={{
                      color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : theme.textMuted
                    }}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </div>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className="p-0.5 rounded opacity-0 hover:opacity-100 transition-opacity"
                      style={{ color: theme.textMuted }}
                      title="Copy to clipboard"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Streaming Message */}
        {streamingMessage && (
          <div className="flex justify-start">
            <div
              className="max-w-[85%] rounded-lg rounded-tl-none px-3 py-2"
              style={{ background: theme.bg, color: theme.text }}
            >
              <div className="text-sm whitespace-pre-wrap break-words">
                {streamingMessage}
                <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Pending Change Approval */}
        {pendingChange && (
          <div className="flex justify-start">
            <div className="w-full max-w-[95%]">
              <PendingChangeApproval
                pendingChange={pendingChange}
                onApprove={onApproveChange}
                onDismiss={onDismissChange}
                theme={theme}
                devices={devices}
              />
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && !streamingMessage && (
          <div className="flex justify-start">
            <div
              className="rounded-lg rounded-tl-none px-3 py-2"
              style={{ background: theme.bg }}
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="border-t p-3"
        style={{ borderColor: theme.border }}
      >
        {/* Error Display */}
        {error && (
          <div
            className="mb-2 px-3 py-2 rounded text-xs"
            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
          >
            {error}
          </div>
        )}

        {/* Network Context Toggle */}
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNetworkContext}
              onChange={(e) => onToggleContext(e.target.checked)}
              className="w-4 h-4 rounded"
              disabled={isLoading}
            />
            <span className="text-xs" style={{ color: theme.textMuted }}>
              Include network context
            </span>
          </label>
          <span className="text-xs" style={{ color: theme.textMuted }}>
            {inputValue.length}/2000
          </span>
        </div>

        {/* Textarea and Send Button */}
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your network topology..."
            disabled={isLoading}
            maxLength={2000}
            rows={1}
            className="flex-1 px-3 py-2 rounded-lg text-sm resize-none outline-none"
            style={{
              background: theme.bg,
              color: theme.text,
              border: `1px solid ${error ? '#ef4444' : theme.border}`
            }}
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isLoading || !inputValue.trim() ? theme.bg : '#3b82f6',
              color: isLoading || !inputValue.trim() ? theme.textMuted : '#ffffff'
            }}
          >
            {isLoading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        {/* Keyboard Hint */}
        <div className="mt-2 text-xs" style={{ color: theme.textMuted }}>
          Press <kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 rounded" style={{ background: theme.bg }}>Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};

export default React.memo(AiChatPanel);

/**
 * Strategy Dialogue Component
 * 5.5 戦略対話UI
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type {
  DialogueSession,
  DialogueMessage,
  DialogueContext,
  UserPreferences,
  MessageMetadata,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface StrategyDialogueProps {
  session?: DialogueSession;
  onSendMessage?: (content: string, context?: DialogueContext) => Promise<DialogueMessage>;
  onUpdatePreferences?: (preferences: UserPreferences) => void;
  onStartNewSession?: () => void;
  onExportSession?: () => void;
  className?: string;
}

// ========================================
// Sub-Components
// ========================================

const MessageBubble: React.FC<{
  message: DialogueMessage;
  isLatest: boolean;
}> = ({ message, isLatest }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] ${
          isUser
            ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl'
            : 'bg-gray-100 text-gray-800 rounded-r-2xl rounded-tl-2xl'
        } px-4 py-3`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Metadata */}
        {message.metadata && (
          <MessageMetadataDisplay metadata={message.metadata} isUser={isUser} />
        )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-2 ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
          {isLatest && !isUser && (
            <span className="ml-2 animate-pulse">●</span>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageMetadataDisplay: React.FC<{
  metadata: MessageMetadata;
  isUser: boolean;
}> = ({ metadata, isUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!metadata.sources?.length && !metadata.relatedInsights?.length && !metadata.suggestedActions?.length) {
    return null;
  }

  return (
    <div className={`mt-3 pt-3 border-t ${isUser ? 'border-blue-500' : 'border-gray-200'}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`text-xs ${isUser ? 'text-blue-200' : 'text-gray-500'} hover:underline`}
      >
        {isExpanded ? 'Hide details' : 'Show details'}
        {metadata.confidence && (
          <span className="ml-2">
            (Confidence: {(metadata.confidence * 100).toFixed(0)}%)
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 text-sm">
          {metadata.sources && metadata.sources.length > 0 && (
            <div>
              <p className={`text-xs font-medium ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                Sources:
              </p>
              <ul className="list-disc list-inside">
                {metadata.sources.map((source, idx) => (
                  <li key={idx} className={isUser ? 'text-blue-100' : 'text-gray-600'}>
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {metadata.relatedInsights && metadata.relatedInsights.length > 0 && (
            <div>
              <p className={`text-xs font-medium ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                Related Insights:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {metadata.relatedInsights.map((insight, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-xs ${
                      isUser ? 'bg-blue-500 text-blue-100' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {insight}
                  </span>
                ))}
              </div>
            </div>
          )}

          {metadata.suggestedActions && metadata.suggestedActions.length > 0 && (
            <div>
              <p className={`text-xs font-medium ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                Suggested Actions:
              </p>
              <ul className="list-disc list-inside">
                {metadata.suggestedActions.map((action, idx) => (
                  <li key={idx} className={isUser ? 'text-blue-100' : 'text-gray-600'}>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QuickPrompts: React.FC<{
  onSelect: (prompt: string) => void;
}> = ({ onSelect }) => {
  const prompts = [
    { label: 'Strategy Review', prompt: 'What are our key strategic priorities for this quarter?' },
    { label: 'Risk Analysis', prompt: 'What are the main risks to our current strategy?' },
    { label: 'KPI Check', prompt: 'How are we performing against our key metrics?' },
    { label: 'Recommendations', prompt: 'What actions should we prioritize based on current data?' },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-3 border-t bg-gray-50">
      <span className="text-xs text-gray-500 w-full mb-1">Quick prompts:</span>
      {prompts.map((prompt) => (
        <button
          key={prompt.label}
          onClick={() => onSelect(prompt.prompt)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
        >
          {prompt.label}
        </button>
      ))}
    </div>
  );
};

const PreferencesPanel: React.FC<{
  preferences: UserPreferences;
  onUpdate: (preferences: UserPreferences) => void;
  onClose: () => void;
}> = ({ preferences, onUpdate, onClose }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = () => {
    onUpdate(localPrefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Dialogue Preferences</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Length
            </label>
            <select
              value={localPrefs.responseLength}
              onChange={(e) =>
                setLocalPrefs({ ...localPrefs, responseLength: e.target.value as UserPreferences['responseLength'] })
              }
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="brief">Brief - Quick answers</option>
              <option value="detailed">Detailed - Thorough explanations</option>
              <option value="comprehensive">Comprehensive - In-depth analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visualization Preference
            </label>
            <select
              value={localPrefs.visualizationPreference}
              onChange={(e) =>
                setLocalPrefs({
                  ...localPrefs,
                  visualizationPreference: e.target.value as UserPreferences['visualizationPreference'],
                })
              }
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="charts">Charts - Visual graphs</option>
              <option value="tables">Tables - Structured data</option>
              <option value="mixed">Mixed - Both types</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Level
            </label>
            <select
              value={localPrefs.notificationLevel}
              onChange={(e) =>
                setLocalPrefs({
                  ...localPrefs,
                  notificationLevel: e.target.value as UserPreferences['notificationLevel'],
                })
              }
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All - Every update</option>
              <option value="important">Important - Key updates only</option>
              <option value="critical">Critical - Urgent only</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-gray-100 rounded-2xl px-4 py-3">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// ========================================
// Main Component
// ========================================

export const StrategyDialogue: React.FC<StrategyDialogueProps> = ({
  session,
  onSendMessage,
  onUpdatePreferences,
  onStartNewSession,
  onExportSession,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [localMessages, setLocalMessages] = useState<DialogueMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync local messages with session
  useEffect(() => {
    if (session?.messages) {
      setLocalMessages(session.messages);
    }
  }, [session?.messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, isTyping]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !onSendMessage) return;

    const userMessage: DialogueMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setLocalMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await onSendMessage(inputValue.trim(), session?.context);
      setLocalMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: DialogueMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date(),
      };
      setLocalMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, onSendMessage, session?.context]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const defaultPreferences: UserPreferences = {
    responseLength: 'detailed',
    visualizationPreference: 'mixed',
    notificationLevel: 'important',
  };

  return (
    <div className={`flex flex-col h-[600px] bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div>
          <h2 className="font-semibold">Strategy Dialogue</h2>
          <p className="text-sm text-blue-100">
            {session?.context?.currentTopic || 'Ask about strategy, performance, or recommendations'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreferences(true)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            title="Preferences"
          >
            ⚙️
          </button>
          {onExportSession && (
            <button
              onClick={onExportSession}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
              title="Export session"
            >
              📥
            </button>
          )}
          {onStartNewSession && (
            <button
              onClick={onStartNewSession}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
              title="New session"
            >
              ➕
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {localMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <span className="text-4xl mb-4">💬</span>
            <p className="text-center">
              Start a conversation about strategy,<br />
              performance, or get recommendations.
            </p>
          </div>
        ) : (
          <>
            {localMessages.map((message, idx) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={idx === localMessages.length - 1 && message.role === 'assistant'}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Prompts */}
      {localMessages.length === 0 && (
        <QuickPrompts onSelect={handleQuickPrompt} />
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end space-x-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about strategy, metrics, or recommendations..."
            className="flex-1 px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={1}
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`p-3 rounded-xl transition-colors ${
              inputValue.trim() && !isTyping
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <PreferencesPanel
          preferences={session?.context?.userPreferences || defaultPreferences}
          onUpdate={(prefs) => onUpdatePreferences?.(prefs)}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </div>
  );
};

export default StrategyDialogue;

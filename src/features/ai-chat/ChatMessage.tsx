/**
 * ChatMessage Component
 * Renders a single chat message with role-based styling
 */

import { ChatMessage as ChatMessageType } from './types';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`} data-testid="chat-message">
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'glass text-slate-200 rounded-bl-md'
                    }`}
                data-testid={isUser ? 'user-message' : 'assistant-message'}
            >
                {/* Message content */}
                <div className="whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" data-testid="streaming-indicator" />
                    )}
                </div>

                {/* Actions for assistant messages */}
                {!isUser && !message.isStreaming && message.content && (
                    <div className="flex justify-end mt-2 pt-2 border-t border-white/10">
                        <button
                            onClick={handleCopy}
                            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            data-testid="copy-button"
                        >
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                            Copy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * AI Chat Types
 * Types for the AI chat feature with streaming support
 */

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

export interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    streamingMessageId: string | null;
}

export interface SendMessagePayload {
    messages: Array<{ role: string; content: string }>;
}

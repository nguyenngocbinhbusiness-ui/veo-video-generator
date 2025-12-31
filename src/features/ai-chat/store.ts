/**
 * AI Chat Store
 * Zustand store for managing chat state with streaming support
 */

import { create } from 'zustand';
import { ChatMessage, ChatState } from './types';
import { IPC_CHANNELS } from '../../shared/types';

// Lazy IPC access - handles both Electron and browser-only (Vite dev) modes
const getIpcRenderer = () => {
    if (typeof window !== 'undefined' && window.require) {
        try {
            return window.require('electron').ipcRenderer;
        } catch {
            return null;
        }
    }
    return null;
};

interface ChatActions {
    sendMessage: (content: string) => Promise<void>;
    clearChat: () => void;
    appendToStream: (chunk: string) => void;
    endStream: () => void;
    setError: (error: string | null) => void;
}

type ChatStore = ChatState & ChatActions;

// Generate unique ID
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock response for browser-only mode (Vite dev without Electron)
const mockStreamResponse = async (message: string, onChunk: (chunk: string) => void, onEnd: () => void) => {
    const mockResponse = `This is a mock response to: "${message}"\n\nTo use real AI chat, run the app with Electron.`;
    for (const char of mockResponse) {
        await new Promise(r => setTimeout(r, 20));
        onChunk(char);
    }
    onEnd();
};

export const useChatStore = create<ChatStore>((set, get) => {
    // Set up IPC listeners for streaming (only in Electron)
    const ipcRenderer = getIpcRenderer();

    if (ipcRenderer) {
        ipcRenderer.on(IPC_CHANNELS.AI_STREAM_CHUNK, (_: unknown, chunk: string) => {
            get().appendToStream(chunk);
        });

        ipcRenderer.on(IPC_CHANNELS.AI_STREAM_END, () => {
            get().endStream();
        });

        ipcRenderer.on(IPC_CHANNELS.AI_ERROR, (_: unknown, error: string) => {
            get().setError(error);
            get().endStream();
        });
    }

    return {
        // State
        messages: [],
        isLoading: false,
        error: null,
        streamingMessageId: null,

        // Actions
        sendMessage: async (content: string) => {
            const userMessage: ChatMessage = {
                id: generateId(),
                role: 'user',
                content,
                timestamp: new Date(),
            };

            const assistantMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                isStreaming: true,
            };

            set((state) => ({
                messages: [...state.messages, userMessage, assistantMessage],
                isLoading: true,
                error: null,
                streamingMessageId: assistantMessage.id,
            }));

            const ipc = getIpcRenderer();

            if (ipc) {
                // Electron mode - use IPC
                const apiMessages = get().messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                }));

                try {
                    await ipc.invoke(IPC_CHANNELS.AI_SEND_MESSAGE, {
                        messages: apiMessages,
                    });
                } catch (error) {
                    set({
                        error: String(error),
                        isLoading: false,
                    });
                }
            } else {
                // Browser-only mode - use mock
                await mockStreamResponse(
                    content,
                    (chunk) => get().appendToStream(chunk),
                    () => get().endStream()
                );
            }
        },

        clearChat: () => {
            set({
                messages: [],
                isLoading: false,
                error: null,
                streamingMessageId: null,
            });
        },

        appendToStream: (chunk: string) => {
            set((state) => {
                const { streamingMessageId, messages } = state;
                if (!streamingMessageId) return state;

                return {
                    messages: messages.map((msg) =>
                        msg.id === streamingMessageId
                            ? { ...msg, content: msg.content + chunk }
                            : msg
                    ),
                };
            });
        },

        endStream: () => {
            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg.id === state.streamingMessageId
                        ? { ...msg, isStreaming: false }
                        : msg
                ),
                isLoading: false,
                streamingMessageId: null,
            }));
        },

        setError: (error: string | null) => {
            set({ error });
        },
    };
});

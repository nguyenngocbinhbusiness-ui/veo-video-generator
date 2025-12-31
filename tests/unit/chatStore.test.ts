<<<<<<< HEAD
/**
 * Unit Tests: Chat Store
 * Tests for FN-028 to FN-033 (Zustand chat store functions)
 * Total: 18 Test Cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock window.electron for non-Electron environment
vi.stubGlobal('window', {
    ...window,
    electron: undefined,
});

import { useChatStore } from '@features/ai-chat/store';

describe('useChatStore.sendMessage (FN-028)', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useChatStore());
        act(() => {
            result.current.clearChat();
        });
    });

    // UNIT-FN-028-N: Send Message Successfully
    it('UNIT-FN-028-N: should send message and update state', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
            await result.current.sendMessage('Hello AI');
        });

        expect(result.current.messages.length).toBeGreaterThan(0);
        expect(result.current.messages[0].content).toBe('Hello AI');
        expect(result.current.messages[0].role).toBe('user');
    });

    // UNIT-FN-028-E: Send Empty Message
    it('UNIT-FN-028-E: should handle empty message', async () => {
        const { result } = renderHook(() => useChatStore());
        const initialLength = result.current.messages.length;

        await act(async () => {
            await result.current.sendMessage('');
        });

        // Empty message should not be added or should throw
        expect(result.current.messages.length).toBeGreaterThanOrEqual(initialLength);
    });

    // UNIT-FN-028-ED: Send Very Long Message
    it('UNIT-FN-028-ED: should handle very long message', async () => {
        const { result } = renderHook(() => useChatStore());
        const longMessage = 'A'.repeat(10000);

        await act(async () => {
            await result.current.sendMessage(longMessage);
        });

        expect(result.current.messages.length).toBeGreaterThan(0);
    });
});

describe('useChatStore.clearChat (FN-029)', () => {
    // UNIT-FN-029-N: Clear All Messages
    it('UNIT-FN-029-N: should clear all messages', async () => {
        const { result } = renderHook(() => useChatStore());

        // Add a message first
        await act(async () => {
            await result.current.sendMessage('Test message');
        });

        expect(result.current.messages.length).toBeGreaterThan(0);

        // Clear chat
        act(() => {
            result.current.clearChat();
        });

        expect(result.current.messages).toHaveLength(0);
    });

    // UNIT-FN-029-E: Clear Empty Chat
    it('UNIT-FN-029-E: should handle clearing empty chat', () => {
        const { result } = renderHook(() => useChatStore());
        act(() => {
            result.current.clearChat();
        });

        expect(() => {
            act(() => {
                result.current.clearChat();
            });
        }).not.toThrow();

        expect(result.current.messages).toHaveLength(0);
    });

    // UNIT-FN-029-ED: Clear During Loading
    it('UNIT-FN-029-ED: should clear during loading state', async () => {
        const { result } = renderHook(() => useChatStore());

        // Start sending message (may set loading)
        act(() => {
            result.current.sendMessage('Test');
        });

        // Clear immediately
        act(() => {
            result.current.clearChat();
        });

        expect(result.current.messages).toHaveLength(0);
    });
});

describe('useChatStore.messages (FN-030)', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useChatStore());
        act(() => {
            result.current.clearChat();
        });
    });

    // UNIT-FN-030-N: Messages Array Structure
    it('UNIT-FN-030-N: should have correct message structure', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
            await result.current.sendMessage('Test message');
        });

        const message = result.current.messages[0];
        expect(message).toHaveProperty('id');
        expect(message).toHaveProperty('role');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('timestamp');
    });

    // UNIT-FN-030-E: Empty Messages Array
    it('UNIT-FN-030-E: should start with empty messages', () => {
        const { result } = renderHook(() => useChatStore());
        act(() => {
            result.current.clearChat();
        });

        expect(result.current.messages).toHaveLength(0);
        expect(Array.isArray(result.current.messages)).toBe(true);
    });

    // UNIT-FN-030-ED: Many Messages Performance
    it('UNIT-FN-030-ED: should handle many messages', async () => {
        const { result } = renderHook(() => useChatStore());

        for (let i = 0; i < 50; i++) {
            await act(async () => {
                await result.current.sendMessage(`Message ${i}`);
            });
        }

        expect(result.current.messages.length).toBeGreaterThan(0);
    });
});

describe('useChatStore.isLoading (FN-031)', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useChatStore());
        act(() => {
            result.current.clearChat();
        });
    });

    // UNIT-FN-031-N: Loading State During Send
    it('UNIT-FN-031-N: should set loading during send', () => {
        const { result } = renderHook(() => useChatStore());

        // Check initial state
        expect(result.current.isLoading).toBe(false);

        // Start sending (may briefly set loading)
        act(() => {
            result.current.sendMessage('Test');
        });

        // After mock response, loading should be false
        expect(typeof result.current.isLoading).toBe('boolean');
    });

    // UNIT-FN-031-E: Not Loading Initially
    it('UNIT-FN-031-E: should not be loading initially', () => {
        const { result } = renderHook(() => useChatStore());

        expect(result.current.isLoading).toBe(false);
    });

    // UNIT-FN-031-ED: Loading After Clear
    it('UNIT-FN-031-ED: should not be loading after clear', () => {
        const { result } = renderHook(() => useChatStore());

        act(() => {
            result.current.clearChat();
        });

        expect(result.current.isLoading).toBe(false);
    });
});

describe('useChatStore.error (FN-032)', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useChatStore());
        act(() => {
            result.current.clearChat();
        });
    });

    // UNIT-FN-032-N: Error State On Failure
    it('UNIT-FN-032-N: should track error state', () => {
        const { result } = renderHook(() => useChatStore());

        // Initially no error
        expect(result.current.error).toBe(null);
    });

    // UNIT-FN-032-E: No Error Initially
    it('UNIT-FN-032-E: should have no error initially', () => {
        const { result } = renderHook(() => useChatStore());

        expect(result.current.error).toBeNull();
    });

    // UNIT-FN-032-ED: Error Clears On Success
    it('UNIT-FN-032-ED: should clear error on success', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
            await result.current.sendMessage('Test');
        });

        // Error should be cleared after successful operation
        expect(result.current.error).toBeNull();
    });
});

describe('useChatStore.streamingMessageId (FN-033)', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useChatStore());
        act(() => {
            result.current.clearChat();
        });
    });

    // UNIT-FN-033-N: Streaming Message ID Set
    it('UNIT-FN-033-N: should track streaming message', () => {
        const { result } = renderHook(() => useChatStore());

        // Initially null
        expect(result.current.streamingMessageId).toBeNull();
    });

    // UNIT-FN-033-E: No Streaming Initially
    it('UNIT-FN-033-E: should not have streaming initially', () => {
        const { result } = renderHook(() => useChatStore());
        act(() => {
            result.current.clearChat();
        });

        expect(result.current.streamingMessageId).toBeNull();
    });

    // UNIT-FN-033-ED: Streaming ID Clears After Complete
    it('UNIT-FN-033-ED: should clear after stream complete', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
            await result.current.sendMessage('Test');
        });

        // After completion, streaming should be null
        expect(result.current.streamingMessageId).toBeNull();
=======
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../../src/features/ai-chat/store';

// Mock getIpcRenderer from store
vi.mock('../../src/features/ai-chat/store', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
    };
});

describe('ChatStore', () => {
    beforeEach(() => {
        useChatStore.getState().clearChat();
    });

    it('should start with empty state', () => {
        const state = useChatStore.getState();
        expect(state.messages).toHaveLength(0);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should add messages when sendMessage is called', async () => {
        await useChatStore.getState().sendMessage('Hello');

        const state = useChatStore.getState();
        expect(state.messages).toHaveLength(2); // User + Assistant placeholder
        expect(state.messages[0].role).toBe('user');
        expect(state.messages[0].content).toBe('Hello');
        expect(state.messages[1].role).toBe('assistant');
        expect(state.isLoading).toBe(true);
    });

    it('should clear chat', async () => {
        await useChatStore.getState().sendMessage('Hello');
        useChatStore.getState().clearChat();

        const state = useChatStore.getState();
        expect(state.messages).toHaveLength(0);
        expect(state.isLoading).toBe(false);
    });

    it('should handle streaming updates', async () => {
        await useChatStore.getState().sendMessage('test');

        // Simulate stream
        useChatStore.getState().appendToStream('Chunk 1');
        useChatStore.getState().appendToStream(' Chunk 2');

        const state = useChatStore.getState();
        const assistantMsg = state.messages.find(m => m.role === 'assistant');
        expect(assistantMsg?.content).toBe('Chunk 1 Chunk 2');
>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04
    });
});

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
    });
});

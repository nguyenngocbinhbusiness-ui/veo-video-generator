import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../../src/features/ai-chat/store';

vi.stubGlobal('window', { ...window, electron: undefined });

describe('ChatStore', () => {
    beforeEach(() => { useChatStore.getState().clearChat(); });

    it('should start with empty state', () => {
        const state = useChatStore.getState();
        expect(state.messages).toHaveLength(0);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should add messages when sendMessage is called', async () => {
        await useChatStore.getState().sendMessage('Hello');
        const state = useChatStore.getState();
        expect(state.messages.length).toBeGreaterThan(0);
        expect(state.messages[0].role).toBe('user');
    });

    it('should clear chat', async () => {
        await useChatStore.getState().sendMessage('Hello');
        useChatStore.getState().clearChat();
        expect(useChatStore.getState().messages).toHaveLength(0);
    });

    it('should handle streaming updates', async () => {
        await useChatStore.getState().sendMessage('test');
        useChatStore.getState().appendToStream('Chunk');
        const msg = useChatStore.getState().messages.find(m => m.role === 'assistant');
        expect(msg?.content).toContain('Chunk');
    });
});

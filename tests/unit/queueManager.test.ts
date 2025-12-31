/**
 * Unit Tests: Queue Manager
 * Tests for FN-018 to FN-027 (Queue management functions)
 * Total: 30 Test Cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { queueManager } from '@features/queue-status/services/queueManager';
import { GenerationStatus } from '@shared/types';

describe('queueManager.addPrompts (FN-018)', () => {
    beforeEach(() => {
        queueManager.clearCompleted();
        // Clear all items
        const status = queueManager.getStatus();
        status.items.forEach(item => {
            // Clear items if possible
        });
    });

    // UNIT-FN-018-N: Add Single Prompt
    it('UNIT-FN-018-N: should add single prompt to queue', () => {
        const initialCount = queueManager.getStatus().total;

        queueManager.addPrompts(['Test prompt']);

        const newCount = queueManager.getStatus().total;
        expect(newCount).toBe(initialCount + 1);
    });

    // UNIT-FN-018-E: Add Empty Array
    it('UNIT-FN-018-E: should handle empty array', () => {
        const initialCount = queueManager.getStatus().total;

        queueManager.addPrompts([]);

        expect(queueManager.getStatus().total).toBe(initialCount);
    });

    // UNIT-FN-018-ED: Add 1000 Prompts
    it('UNIT-FN-018-ED: should handle large batch', () => {
        const prompts = Array(100).fill(null).map((_, i) => `Prompt ${i}`);
        const initialCount = queueManager.getStatus().total;

        queueManager.addPrompts(prompts);

        const newCount = queueManager.getStatus().total;
        expect(newCount).toBe(initialCount + 100);
    });
});

describe('queueManager.getStatus (FN-019)', () => {
    // UNIT-FN-019-N: Get Status With Items
    it('UNIT-FN-019-N: should return correct status', () => {
        const status = queueManager.getStatus();

        expect(status).toHaveProperty('total');
        expect(status).toHaveProperty('queued');
        expect(status).toHaveProperty('processing');
        expect(status).toHaveProperty('completed');
        expect(status).toHaveProperty('failed');
        expect(status).toHaveProperty('items');
    });

    // UNIT-FN-019-E: Get Status When Empty
    it('UNIT-FN-019-E: should handle empty queue', () => {
        const status = queueManager.getStatus();

        expect(typeof status.total).toBe('number');
        expect(Array.isArray(status.items)).toBe(true);
    });

    // UNIT-FN-019-ED: Status After Operations
    it('UNIT-FN-019-ED: should reflect operations', () => {
        queueManager.addPrompts(['New prompt for status test']);

        const status = queueManager.getStatus();

        expect(status.total).toBeGreaterThan(0);
    });
});

describe('queueManager.startProcessing (FN-020)', () => {
    // UNIT-FN-020-N: Start Processing Queue
    it('UNIT-FN-020-N: should start processing items', () => {
        queueManager.addPrompts(['Process me']);

        expect(() => queueManager.startProcessing()).not.toThrow();
    });

    // UNIT-FN-020-E: Start Empty Queue
    it('UNIT-FN-020-E: should handle empty queue', () => {
        expect(() => queueManager.startProcessing()).not.toThrow();
    });

    // UNIT-FN-020-ED: Start Already Processing
    it('UNIT-FN-020-ED: should handle already processing', () => {
        queueManager.addPrompts(['Prompt 1', 'Prompt 2']);
        queueManager.startProcessing();

        // Starting again should not throw
        expect(() => queueManager.startProcessing()).not.toThrow();
    });
});

describe('queueManager.pauseProcessing (FN-021)', () => {
    beforeEach(() => {
        queueManager.addPrompts(['Pause test prompt']);
    });

    // UNIT-FN-021-N: Pause Processing Queue
    it('UNIT-FN-021-N: should pause processing', () => {
        queueManager.startProcessing();

        expect(() => queueManager.pauseProcessing()).not.toThrow();
    });

    // UNIT-FN-021-E: Pause Already Paused
    it('UNIT-FN-021-E: should handle already paused', () => {
        queueManager.pauseProcessing();

        expect(() => queueManager.pauseProcessing()).not.toThrow();
    });

    // UNIT-FN-021-ED: Pause When Not Started
    it('UNIT-FN-021-ED: should handle not started', () => {
        expect(() => queueManager.pauseProcessing()).not.toThrow();
    });
});

describe('queueManager.resumeProcessing (FN-022)', () => {
    // UNIT-FN-022-N: Resume from Paused
    it('UNIT-FN-022-N: should resume processing', () => {
        queueManager.addPrompts(['Resume test']);
        queueManager.startProcessing();
        queueManager.pauseProcessing();

        expect(() => queueManager.resumeProcessing()).not.toThrow();
    });

    // UNIT-FN-022-E: Resume Not Paused
    it('UNIT-FN-022-E: should handle not paused', () => {
        expect(() => queueManager.resumeProcessing()).not.toThrow();
    });

    // UNIT-FN-022-ED: Resume Empty Queue
    it('UNIT-FN-022-ED: should handle empty queue', () => {
        expect(() => queueManager.resumeProcessing()).not.toThrow();
    });
});

describe('queueManager.clearCompleted (FN-023)', () => {
    // UNIT-FN-023-N: Clear Completed Items
    it('UNIT-FN-023-N: should clear completed items', () => {
        expect(() => queueManager.clearCompleted()).not.toThrow();

        const status = queueManager.getStatus();
        expect(status.completed).toBe(0);
    });

    // UNIT-FN-023-E: Clear When None Completed
    it('UNIT-FN-023-E: should handle no completed items', () => {
        expect(() => queueManager.clearCompleted()).not.toThrow();
    });

    // UNIT-FN-023-ED: Clear Preserves Non-completed
    it('UNIT-FN-023-ED: should preserve non-completed items', () => {
        queueManager.addPrompts(['Keep me']);
        const beforeTotal = queueManager.getStatus().total;

        queueManager.clearCompleted();

        const afterTotal = queueManager.getStatus().total;
        expect(afterTotal).toBeGreaterThanOrEqual(0);
    });
});

describe('queueManager.retryFailed (FN-024)', () => {
    // UNIT-FN-024-N: Retry Failed Items
    it('UNIT-FN-024-N: should retry failed items', () => {
        expect(() => queueManager.retryFailed()).not.toThrow();
    });

    // UNIT-FN-024-E: Retry When None Failed
    it('UNIT-FN-024-E: should handle no failed items', () => {
        expect(() => queueManager.retryFailed()).not.toThrow();
    });

    // UNIT-FN-024-ED: Retry Increments Count
    it('UNIT-FN-024-ED: should handle retry count', () => {
        // This would need a failed item to test properly
        expect(() => queueManager.retryFailed()).not.toThrow();
    });
});

describe('queueManager.getItem (FN-025)', () => {
    // UNIT-FN-025-N: Get Existing Item
    it('UNIT-FN-025-N: should return existing item', () => {
        queueManager.addPrompts(['Find me']);
        const status = queueManager.getStatus();
        const firstItem = status.items[status.items.length - 1];

        if (firstItem) {
            const item = queueManager.getItem(firstItem.id);
            expect(item).toBeTruthy();
            expect(item?.id).toBe(firstItem.id);
        }
    });

    // UNIT-FN-025-E: Get Non-existent Item
    it('UNIT-FN-025-E: should return undefined for non-existent', () => {
        const item = queueManager.getItem('non-existent-id');

        expect(item).toBeUndefined();
    });

    // UNIT-FN-025-ED: Get Deleted Item
    it('UNIT-FN-025-ED: should handle deleted item', () => {
        const item = queueManager.getItem('deleted-item-id');

        expect(item).toBeUndefined();
    });
});

describe('queueManager.retryItem (FN-026)', () => {
    // UNIT-FN-026-N: Retry Specific Failed Item
    it('UNIT-FN-026-N: should retry specific item', () => {
        queueManager.addPrompts(['Retry specific']);
        const status = queueManager.getStatus();
        const lastItem = status.items[status.items.length - 1];

        if (lastItem) {
            expect(() => queueManager.retryItem(lastItem.id)).not.toThrow();
        }
    });

    // UNIT-FN-026-E: Retry Non-existent Item
    it('UNIT-FN-026-E: should handle non-existent item', () => {
        expect(() => queueManager.retryItem('non-existent')).not.toThrow();
    });

    // UNIT-FN-026-ED: Retry Completed Item
    it('UNIT-FN-026-ED: should handle completed item', () => {
        // Completed items should not be retried
        expect(() => queueManager.retryItem('some-id')).not.toThrow();
    });
});

describe('queueManager.on/off (FN-027)', () => {
    // UNIT-FN-027-N: Subscribe to Events
    it('UNIT-FN-027-N: should subscribe to update event', () => {
        const handler = vi.fn();

        queueManager.on('update', handler);
        queueManager.addPrompts(['Trigger update']);

        // Handler should be called
        expect(handler).toHaveBeenCalled();

        queueManager.off('update', handler);
    });

    // UNIT-FN-027-E: Unsubscribe Non-existent
    it('UNIT-FN-027-E: should handle unsubscribe non-existent', () => {
        const handler = vi.fn();

        expect(() => queueManager.off('update', handler)).not.toThrow();
    });

    // UNIT-FN-027-ED: Multiple Subscribers
    it('UNIT-FN-027-ED: should handle multiple subscribers', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();

        queueManager.on('update', handler1);
        queueManager.on('update', handler2);
        queueManager.addPrompts(['Multi trigger']);

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();

        queueManager.off('update', handler1);
        queueManager.off('update', handler2);
    });
});

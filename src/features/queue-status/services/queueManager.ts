/**
 * Queue Manager Service
 * Handles batch processing of video generation prompts
 */

import { GenerationItem, QueueStatus } from '@shared/types';
import { createGenerationItem, getStatusSummary } from '@shared/utils';

type QueueEventCallback = (status: QueueStatus) => void;
type ItemEventCallback = (item: GenerationItem) => void;
type ErrorEventCallback = (item: GenerationItem, error: string) => void;

class QueueManager {
    private items: GenerationItem[] = [];
    private isPaused: boolean = true;
    private isProcessing: boolean = false;
    private currentItemId: string | null = null;

    // Event callbacks
    private onUpdateCallbacks: QueueEventCallback[] = [];
    private onItemStartCallbacks: ItemEventCallback[] = [];
    private onItemCompleteCallbacks: ItemEventCallback[] = [];
    private onItemFailCallbacks: ErrorEventCallback[] = [];

    /**
     * Add prompts to the queue
     */
    addPrompts(prompts: string[]): GenerationItem[] {
        const newItems = prompts.map(prompt => createGenerationItem(prompt));
        this.items.push(...newItems);
        this.emitUpdate();
        return newItems;
    }

    /**
     * Start processing the queue
     */
    start(): void {
        this.isPaused = false;
        this.emitUpdate();
        this.processNext();
    }

    /**
     * Pause the queue (current item will complete)
     */
    pause(): void {
        this.isPaused = true;
        this.emitUpdate();
    }

    /**
     * Resume processing
     */
    resume(): void {
        this.isPaused = false;
        this.emitUpdate();
        if (!this.isProcessing) {
            this.processNext();
        }
    }

    /**
     * Clear completed and failed items
     */
    clearCompleted(): void {
        this.items = this.items.filter(
            item => item.status === 'queued' || item.status === 'processing'
        );
        this.emitUpdate();
    }

    /**
     * Clear all items
     */
    clearAll(): void {
        // Cancel current if processing
        if (this.currentItemId) {
            const current = this.items.find(i => i.id === this.currentItemId);
            if (current) {
                current.status = 'cancelled';
            }
        }
        this.items = [];
        this.isProcessing = false;
        this.currentItemId = null;
        this.emitUpdate();
    }

    /**
     * Retry failed items
     */
    retryFailed(): void {
        for (const item of this.items) {
            if (item.status === 'failed') {
                item.status = 'queued';
                item.error = undefined;
                item.retryCount++;
            }
        }
        this.emitUpdate();
        if (!this.isPaused && !this.isProcessing) {
            this.processNext();
        }
    }

    /**
     * Get current queue status
     */
    getStatus(): QueueStatus {
        const summary = getStatusSummary(this.items);
        return {
            total: this.items.length,
            ...summary,
            items: [...this.items],
            isPaused: this.isPaused,
        };
    }

    /**
     * Process next item in queue
     */
    private async processNext(): Promise<void> {
        if (this.isPaused || this.isProcessing) {
            return;
        }

        const nextItem = this.items.find(item => item.status === 'queued');
        if (!nextItem) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        this.currentItemId = nextItem.id;
        nextItem.status = 'processing';
        nextItem.startedAt = new Date();

        this.emitUpdate();
        this.emitItemStart(nextItem);

        // Actual processing will be handled by FlowAutomation
        // This is just the queue management logic
    }

    /**
     * Mark current item as complete
     */
    markComplete(itemId: string, videoPath: string): void {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.status = 'completed';
            item.completedAt = new Date();
            item.videoPath = videoPath;
            this.emitItemComplete(item);
        }

        this.isProcessing = false;
        this.currentItemId = null;
        this.emitUpdate();

        // Process next
        if (!this.isPaused) {
            this.processNext();
        }
    }

    /**
     * Mark current item as failed
     */
    markFailed(itemId: string, error: string): void {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.status = 'failed';
            item.completedAt = new Date();
            item.error = error;
            this.emitItemFail(item, error);
        }

        this.isProcessing = false;
        this.currentItemId = null;
        this.emitUpdate();

        // Process next
        if (!this.isPaused) {
            this.processNext();
        }
    }

    /**
     * Get next queued item for processing
     */
    getNextItem(): GenerationItem | null {
        return this.items.find(item => item.status === 'queued') || null;
    }

    /**
     * Event subscription methods
     */
    onUpdate(callback: QueueEventCallback): () => void {
        this.onUpdateCallbacks.push(callback);
        return () => {
            this.onUpdateCallbacks = this.onUpdateCallbacks.filter(cb => cb !== callback);
        };
    }

    onItemStart(callback: ItemEventCallback): () => void {
        this.onItemStartCallbacks.push(callback);
        return () => {
            this.onItemStartCallbacks = this.onItemStartCallbacks.filter(cb => cb !== callback);
        };
    }

    onItemComplete(callback: ItemEventCallback): () => void {
        this.onItemCompleteCallbacks.push(callback);
        return () => {
            this.onItemCompleteCallbacks = this.onItemCompleteCallbacks.filter(cb => cb !== callback);
        };
    }

    onItemFail(callback: ErrorEventCallback): () => void {
        this.onItemFailCallbacks.push(callback);
        return () => {
            this.onItemFailCallbacks = this.onItemFailCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Emit events
     */
    private emitUpdate(): void {
        const status = this.getStatus();
        this.onUpdateCallbacks.forEach(cb => cb(status));
    }

    private emitItemStart(item: GenerationItem): void {
        this.onItemStartCallbacks.forEach(cb => cb(item));
    }

    private emitItemComplete(item: GenerationItem): void {
        this.onItemCompleteCallbacks.forEach(cb => cb(item));
    }

    private emitItemFail(item: GenerationItem, error: string): void {
        this.onItemFailCallbacks.forEach(cb => cb(item, error));
    }
}

// Export singleton instance
export const queueManager = new QueueManager();
export default queueManager;

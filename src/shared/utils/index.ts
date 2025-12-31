/**
 * Utility functions for the application
 */

import { GenerationItem, GenerationStatus } from '../types';

/**
 * Generate a unique ID for queue items
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse prompts from text (one per line)
 */
export function parsePrompts(text: string): string[] {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

/**
 * Parse prompts from CSV content
 */
export function parsePromptsFromCsv(csvContent: string): string[] {
    const lines = csvContent.split('\n');
    const prompts: string[] = [];

    for (const line of lines) {
        // Skip header row if it contains "prompt" (case insensitive)
        if (lines.indexOf(line) === 0 && line.toLowerCase().includes('prompt')) {
            continue;
        }

        // Extract first column (or entire line if no commas)
        const firstColumn = line.split(',')[0]?.trim().replace(/^["']|["']$/g, '');
        if (firstColumn && firstColumn.length > 0) {
            prompts.push(firstColumn);
        }
    }

    return prompts;
}

/**
 * Create a new GenerationItem from a prompt
 */
export function createGenerationItem(prompt: string): GenerationItem {
    return {
        id: generateId(),
        prompt,
        status: 'queued',
        createdAt: new Date(),
        retryCount: 0,
    };
}

/**
 * Format duration in human readable format
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
        return `${seconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format date relative to now
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
        return 'just now';
    }
    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }
    return date.toLocaleDateString();
}

/**
 * Validate cookie structure
 */
export function isValidCookieArray(data: unknown): boolean {
    if (!Array.isArray(data)) {
        return false;
    }

    return data.every(cookie =>
        typeof cookie === 'object' &&
        cookie !== null &&
        typeof cookie.name === 'string' &&
        typeof cookie.value === 'string' &&
        typeof cookie.domain === 'string'
    );
}

/**
 * Filter Google-related cookies
 */
export function filterGoogleCookies(cookies: unknown[]): unknown[] {
    return cookies.filter((cookie: any) => {
        const domain = cookie.domain || '';
        return domain.includes('google') ||
            domain.includes('youtube') ||
            domain.includes('.labs.google');
    });
}

/**
 * Get status summary from items
 */
export function getStatusSummary(items: GenerationItem[]): Record<GenerationStatus, number> {
    const summary: Record<GenerationStatus, number> = {
        queued: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
    };

    for (const item of items) {
        summary[item.status]++;
    }

    return summary;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}

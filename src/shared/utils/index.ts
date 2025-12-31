/**
<<<<<<< HEAD
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
=======
 * Shared Utilities
 */

import { Cookie, GenerationItem, QueueStatus } from '../types';

export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
};

export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
};

export const isValidCookieArray = (cookies: any): boolean => {
    return Array.isArray(cookies) && cookies.length > 0 && cookies.every(c => c.name && c.value);
};

export const filterGoogleCookies = (cookies: any[]): any[] => {
    if (!Array.isArray(cookies)) return [];
    return cookies.filter(c => 
        (c.domain && (c.domain.includes('google.com') || c.domain.includes('youtube.com')))
    );
};

export const parsePrompts = (text: string): string[] => {
    return text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
};

export const parsePromptsFromCsv = (text: string): string[] => {
    // Simple CSV parser - splits by newline and takes first column if comma exists
    return text.split('\n').map(line => {
        const parts = line.split(',');
        return parts[0].trim();
    }).filter(p => p.length > 0);
};

export const createGenerationItem = (prompt: string): GenerationItem => {
>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04
    return {
        id: generateId(),
        prompt,
        status: 'queued',
        createdAt: new Date(),
        retryCount: 0,
    };
<<<<<<< HEAD
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
=======
};

export const getStatusSummary = (items: GenerationItem[]): Omit<QueueStatus, 'items' | 'total' | 'isPaused'> => {
    return {
        queued: items.filter(i => i.status === 'queued').length,
        processing: items.filter(i => i.status === 'processing').length,
        completed: items.filter(i => i.status === 'completed').length,
        failed: items.filter(i => i.status === 'failed').length,
    };
};
>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04

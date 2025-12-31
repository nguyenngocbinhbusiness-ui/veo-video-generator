/**
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
    return {
        id: generateId(),
        prompt,
        status: 'queued',
        createdAt: new Date(),
        retryCount: 0,
    };
};

export const getStatusSummary = (items: GenerationItem[]): Omit<QueueStatus, 'items' | 'total' | 'isPaused'> => {
    return {
        queued: items.filter(i => i.status === 'queued').length,
        processing: items.filter(i => i.status === 'processing').length,
        completed: items.filter(i => i.status === 'completed').length,
        failed: items.filter(i => i.status === 'failed').length,
    };
};

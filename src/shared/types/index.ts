/**
 * Shared Type Definitions
 */

export interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite?: string;
}

export type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface GenerationItem {
    id: string;
    prompt: string;
    status: GenerationStatus;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    videoPath?: string;
    error?: string;
    retryCount: number;
    settings?: GenerationOptions;
}

export interface GenerationOptions {
    width?: number;
    height?: number;
    duration?: number;
}

export interface QueueStatus {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    items: GenerationItem[];
    isPaused: boolean;
}

export interface AppSettings {
    downloadFolder: string;
    maxConcurrent: number;
    retryAttempts: number;
    flowUrl: string;
}

export const IPC_CHANNELS = {
    // AI Chat
    AI_SEND_MESSAGE: 'ai:sendMessage',
    AI_STREAM_CHUNK: 'ai:stream-chunk',
    AI_STREAM_END: 'ai:stream-end',
    AI_ERROR: 'ai:error',

    // Youtube
    YOUTUBE_DOWNLOAD: 'youtube:download',
    YOUTUBE_PROGRESS: 'youtube:progress',
    YOUTUBE_COMPLETE: 'youtube:complete',
    YOUTUBE_ERROR: 'youtube:error',
    YOUTUBE_CANCEL: 'youtube:cancel',

    // System
    OPEN_FOLDER: 'video:download',
};

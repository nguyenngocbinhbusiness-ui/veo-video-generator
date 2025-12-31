/**
<<<<<<< HEAD
 * Shared TypeScript types for Veo Video Generator
 */

// Cookie structure from browser export
=======
 * Shared Type Definitions
 */

>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04
export interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
<<<<<<< HEAD
    sameSite?: 'Strict' | 'Lax' | 'None';
}

// Generation status enum
export type GenerationStatus =
    | 'queued'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';

// Single video generation item
=======
    sameSite?: string;
}

export type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04
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
<<<<<<< HEAD
}

// Queue status summary
=======
    settings?: GenerationOptions;
}

export interface GenerationOptions {
    width?: number;
    height?: number;
    duration?: number;
}

>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04
export interface QueueStatus {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    items: GenerationItem[];
    isPaused: boolean;
}

<<<<<<< HEAD
// Video generation options
export interface GenerationOptions {
    aspectRatio?: '16:9' | '9:16' | '1:1';
    duration?: '5s' | '8s';
    quality?: '720p' | '1080p';
}

// App settings
=======
>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04
export interface AppSettings {
    downloadFolder: string;
    maxConcurrent: number;
    retryAttempts: number;
<<<<<<< HEAD
    generationTimeout: number;
    showBrowser: boolean;
}

// IPC channel names
export const IPC_CHANNELS = {
    // Cookie management
    COOKIE_IMPORT: 'cookie:import',
    COOKIE_VALIDATE: 'cookie:validate',
    COOKIE_STATUS: 'cookie:status',

    // Queue management
    QUEUE_ADD: 'queue:add',
    QUEUE_START: 'queue:start',
    QUEUE_PAUSE: 'queue:pause',
    QUEUE_RESUME: 'queue:resume',
    QUEUE_CLEAR: 'queue:clear',
    QUEUE_RETRY: 'queue:retry',
    QUEUE_STATUS: 'queue:status',
    QUEUE_UPDATE: 'queue:update',

    // Video management
    VIDEO_DOWNLOAD: 'video:download',
    VIDEO_OPEN_FOLDER: 'video:openFolder',

    // YouTube download
    YOUTUBE_DOWNLOAD: 'youtube:download',
    YOUTUBE_CANCEL: 'youtube:cancel',
    YOUTUBE_PROGRESS: 'youtube:progress',
    YOUTUBE_COMPLETE: 'youtube:complete',
    YOUTUBE_ERROR: 'youtube:error',

    // Settings
    SETTINGS_GET: 'settings:get',
    SETTINGS_SET: 'settings:set',

    // AI Chat (Streaming)
    AI_SEND_MESSAGE: 'ai:send-message',
    AI_STREAM_CHUNK: 'ai:stream-chunk',
    AI_STREAM_END: 'ai:stream-end',
    AI_ERROR: 'ai:error',
} as const;

// Event emitter types
export interface QueueEvents {
    update: (status: QueueStatus) => void;
    itemStart: (item: GenerationItem) => void;
    itemComplete: (item: GenerationItem) => void;
    itemFail: (item: GenerationItem, error: string) => void;
}
=======
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
>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04

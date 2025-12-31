/**
<<<<<<< HEAD
 * Application-wide constants
 * Following coding.md - no hardcoding, all configurable values here
 */

// Google Flow URLs
export const FLOW_URLS = {
    BASE: 'https://labs.google/fx/flow',
    LOGIN: 'https://accounts.google.com/signin',
    VIDEO_STUDIO: 'https://labs.google/fx/flow/studio',
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
    downloadFolder: './downloads',
    maxConcurrent: 1,
    retryAttempts: 3,
    generationTimeout: 300000, // 5 minutes
    showBrowser: false,
} as const;

// CSS selectors for Flow automation (will need updating based on actual DOM)
export const FLOW_SELECTORS = {
    // Main UI elements
    promptInput: '[data-testid="prompt-input"], textarea[placeholder*="prompt"]',
    generateButton: '[data-testid="generate-btn"], button:has-text("Generate")',
    videoPreview: '[data-testid="video-preview"], video',
    downloadButton: '[data-testid="download-btn"], button:has-text("Download")',

    // Status indicators
    loadingSpinner: '[data-testid="loading"], .loading-spinner',
    progressBar: '[data-testid="progress"], progress',
    errorMessage: '[data-testid="error"], .error-message',

    // Auth indicators
    userAvatar: '[data-testid="user-avatar"], img[alt*="profile"]',
    signInButton: 'button:has-text("Sign in")',
} as const;

// Timeouts (ms)
export const TIMEOUTS = {
    pageLoad: 30000,
    elementVisible: 10000,
    cookieValidation: 15000,
    videoGeneration: 300000,
    downloadComplete: 60000,
} as const;

// File extensions
export const SUPPORTED_FORMATS = {
    cookieImport: ['.json', '.txt'],
    csvImport: ['.csv', '.txt'],
    videoExport: ['.mp4', '.webm'],
} as const;

// Status colors for UI
export const STATUS_COLORS = {
    queued: 'text-slate-400',
    processing: 'text-blue-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
    cancelled: 'text-orange-400',
} as const;

// Status icons
export const STATUS_ICONS = {
    queued: '⏸️',
    processing: '⏳',
    completed: '✅',
    failed: '❌',
    cancelled: '🚫',
} as const;
=======
 * Application Constants
 */

export const FLOW_URLS = {
    BASE: 'https://labs.google/fx/flow',
    LOGIN: 'https://accounts.google.com',
};

export const FLOW_SELECTORS = {
    signInButton: 'button[data-label="Sign in"]',
    userAvatar: 'img.gb_Ac',
    promptInput: 'textarea[aria-label="Prompt"]',
    generateButton: 'button[aria-label="Generate"]',
    errorMessage: '.error-message',
    videoPreview: 'video',
    loadingSpinner: '.spinner',
    downloadButton: 'button[aria-label="Download"]',
};

export const TIMEOUTS = {
    pageLoad: 30000,
    elementVisible: 10000,
    videoGeneration: 300000, // 5 mins
    downloadComplete: 60000,
};

export const DEFAULT_SETTINGS = {
    maxConcurrent: 2,
    retryAttempts: 3,
    downloadFolder: 'downloads',
};
>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04

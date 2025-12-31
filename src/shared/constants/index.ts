/**
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
    videoGeneration: 300000,
    downloadComplete: 60000,
};

export const DEFAULT_SETTINGS = {
    maxConcurrent: 2,
    retryAttempts: 3,
    downloadFolder: 'downloads',
};

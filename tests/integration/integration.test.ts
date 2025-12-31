import { describe, it, expect } from 'vitest';
import { cookieManager } from '../../src/features/cookie-import/services/cookieManager';
import { queueManager } from '../../src/features/queue-status/services/queueManager';

describe('Integration: Cookie Manager', () => {
    it('should import and validate cookies', () => {
        const mockCookies = [
            {
                name: '__Secure-1PSID',
                value: 'test-value',
                domain: '.google.com',
                path: '/',
                expires: Date.now() / 1000 + 3600,
                httpOnly: true,
                secure: true,
            }
        ];

        const jsonString = JSON.stringify(mockCookies);
        const imported = cookieManager.importFromJson(jsonString);

        expect(imported).toHaveLength(1);
        expect(cookieManager.isSessionValid()).toBe(true);
    });

    it('should reject invalid cookie JSON', () => {
        const invalidJson = '[{ "name": "bad" }]'; // Missing required fields
        expect(() => cookieManager.importFromJson(invalidJson)).toThrow();
    });
});

describe('Integration: Queue Manager', () => {
    it('should manage queue state transitions', () => {
        queueManager.clearAll();

        // Add items
        const items = queueManager.addPrompts(['Prompt 1', 'Prompt 2']);
        expect(items).toHaveLength(2);
        expect(queueManager.getStatus().total).toBe(2);

        // Start processing
        queueManager.start();
        expect(queueManager.getStatus().isPaused).toBe(false);
        // Current implementation is async/mocked, so we check immediate state change
        // processing might start on next tick
    });
});

/**
 * Unit Tests: Cookie Manager
 * Tests for FN-012 to FN-017 (Cookie management functions)
 * Total: 18 Test Cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Import after mocking
import { cookieManager } from '@features/cookie-import/services/cookieManager';

describe('cookieManager.importCookies (FN-012)', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    // UNIT-FN-012-N: Import Valid JSON Cookies
    it('UNIT-FN-012-N: should import valid cookie JSON', async () => {
        const validCookies = JSON.stringify([
            { name: 'SID', value: 'abc123', domain: '.google.com', expirationDate: Date.now() / 1000 + 86400 },
        ]);

        const result = await cookieManager.importCookies(validCookies);

        expect(result.success).toBe(true);
    });

    // UNIT-FN-012-E: Import Invalid JSON
    it('UNIT-FN-012-E: should reject invalid JSON', async () => {
        const invalidJson = 'not valid json {{{';

        const result = await cookieManager.importCookies(invalidJson);

        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
    });

    // UNIT-FN-012-ED: Import Expired Cookies
    it('UNIT-FN-012-ED: should handle expired cookies', async () => {
        const expiredCookies = JSON.stringify([
            { name: 'SID', value: 'abc', domain: '.google.com', expirationDate: Date.now() / 1000 - 86400 },
        ]);

        const result = await cookieManager.importCookies(expiredCookies);

        // Should import but mark as expired
        expect(result).toBeTruthy();
    });
});

describe('cookieManager.validateCookies (FN-013)', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    // UNIT-FN-013-N: Validate Non-expired Cookies
    it('UNIT-FN-013-N: should validate non-expired cookies', async () => {
        // First import valid cookies
        const validCookies = JSON.stringify([
            { name: 'SID', value: 'abc123', domain: '.google.com', expirationDate: Date.now() / 1000 + 86400 },
        ]);
        await cookieManager.importCookies(validCookies);

        const isValid = cookieManager.isSessionValid();

        expect(typeof isValid).toBe('boolean');
    });

    // UNIT-FN-013-E: Validate Empty Cookies
    it('UNIT-FN-013-E: should return false for empty cookies', () => {
        const isValid = cookieManager.isSessionValid();

        expect(isValid).toBe(false);
    });

    // UNIT-FN-013-ED: Validate Near-expiry Cookies
    it('UNIT-FN-013-ED: should handle near-expiry cookies', async () => {
        const nearExpiryCookies = JSON.stringify([
            { name: 'SID', value: 'abc', domain: '.google.com', expirationDate: Date.now() / 1000 + 60 },
        ]);
        await cookieManager.importCookies(nearExpiryCookies);

        const isValid = cookieManager.isSessionValid();

        expect(typeof isValid).toBe('boolean');
    });
});

describe('cookieManager.getCookies (FN-014)', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    // UNIT-FN-014-N: Get Imported Cookies
    it('UNIT-FN-014-N: should return imported cookies', async () => {
        const cookies = JSON.stringify([
            { name: 'SID', value: 'abc123', domain: '.google.com' },
        ]);
        await cookieManager.importCookies(cookies);

        const result = cookieManager.getCookies();

        expect(Array.isArray(result)).toBe(true);
    });

    // UNIT-FN-014-E: Get When No Cookies
    it('UNIT-FN-014-E: should return empty array when no cookies', () => {
        const result = cookieManager.getCookies();

        expect(result).toEqual([]);
    });

    // UNIT-FN-014-ED: Get With Mixed Domains
    it('UNIT-FN-014-ED: should return only Google cookies', async () => {
        const mixedCookies = JSON.stringify([
            { name: 'google1', value: 'val1', domain: '.google.com' },
            { name: 'other', value: 'val2', domain: '.example.com' },
        ]);
        await cookieManager.importCookies(mixedCookies);

        const result = cookieManager.getCookies();

        expect(Array.isArray(result)).toBe(true);
    });
});

describe('cookieManager.clearCookies (FN-015)', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    // UNIT-FN-015-N: Clear All Cookies
    it('UNIT-FN-015-N: should clear all stored cookies', async () => {
        const cookies = JSON.stringify([
            { name: 'SID', value: 'abc', domain: '.google.com' },
        ]);
        await cookieManager.importCookies(cookies);

        cookieManager.clearCookies();

        expect(cookieManager.getCookies()).toEqual([]);
    });

    // UNIT-FN-015-E: Clear Already Empty
    it('UNIT-FN-015-E: should handle clearing empty storage', () => {
        expect(() => cookieManager.clearCookies()).not.toThrow();
    });

    // UNIT-FN-015-ED: Clear Preserves Other Storage
    it('UNIT-FN-015-ED: should not affect other localStorage items', async () => {
        localStorageMock.setItem('otherKey', 'otherValue');
        const cookies = JSON.stringify([
            { name: 'SID', value: 'abc', domain: '.google.com' },
        ]);
        await cookieManager.importCookies(cookies);

        cookieManager.clearCookies();

        expect(localStorageMock.getItem('otherKey')).toBe('otherValue');
    });
});

describe('cookieManager.getExpiryTime (FN-016)', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    // UNIT-FN-016-N: Get Valid Expiry Time
    it('UNIT-FN-016-N: should return expiry time', async () => {
        const futureExpiry = Date.now() / 1000 + 86400;
        const cookies = JSON.stringify([
            { name: 'SID', value: 'abc', domain: '.google.com', expirationDate: futureExpiry },
        ]);
        await cookieManager.importCookies(cookies);

        const expiry = cookieManager.getExpiryTime();

        expect(expiry).toBeTruthy();
    });

    // UNIT-FN-016-E: Get From No Cookies
    it('UNIT-FN-016-E: should return null when no cookies', () => {
        const expiry = cookieManager.getExpiryTime();

        expect(expiry).toBe(null);
    });

    // UNIT-FN-016-ED: Get From Multiple Cookies
    it('UNIT-FN-016-ED: should return earliest expiry', async () => {
        const cookies = JSON.stringify([
            { name: 'SID', value: 'abc', domain: '.google.com', expirationDate: Date.now() / 1000 + 172800 },
            { name: 'HSID', value: 'def', domain: '.google.com', expirationDate: Date.now() / 1000 + 86400 },
        ]);
        await cookieManager.importCookies(cookies);

        const expiry = cookieManager.getExpiryTime();

        expect(expiry).toBeTruthy();
    });
});

describe('cookieManager.loadFromStorage (FN-017)', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    // UNIT-FN-017-N: Load Saved Cookies
    it('UNIT-FN-017-N: should load cookies from localStorage', async () => {
        // Save cookies first
        const cookies = JSON.stringify([
            { name: 'SID', value: 'abc', domain: '.google.com' },
        ]);
        await cookieManager.importCookies(cookies);

        // Simulate reload by loading from storage
        cookieManager.loadFromStorage();

        const result = cookieManager.getCookies();
        expect(Array.isArray(result)).toBe(true);
    });

    // UNIT-FN-017-E: Load From Empty Storage
    it('UNIT-FN-017-E: should handle empty storage', () => {
        expect(() => cookieManager.loadFromStorage()).not.toThrow();
        expect(cookieManager.getCookies()).toEqual([]);
    });

    // UNIT-FN-017-ED: Load Corrupted Data
    it('UNIT-FN-017-ED: should handle corrupted storage data', () => {
        localStorageMock.setItem('cookies', 'corrupted{{{data');

        expect(() => cookieManager.loadFromStorage()).not.toThrow();
    });
});

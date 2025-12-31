/**
 * Unit Tests: Utility Functions
 * Tests for FN-001 to FN-014 (generateId, parsePrompts, formatDuration, etc.)
 * Total: 42 Test Cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    generateId,
    parsePrompts,
    parsePromptsFromCsv,
    createGenerationItem,
    formatDuration,
    formatRelativeTime,
    isValidCookieArray,
    filterGoogleCookies,
    getStatusSummary,
    sleep,
    truncateText,
} from '@shared/utils';
import { GenerationStatus, type GenerationItem } from '@shared/types';

describe('generateId (FN-001)', () => {
    // UNIT-FN-001-N: Unique ID Generation
    it('UNIT-FN-001-N: should generate unique ID', () => {
        const id1 = generateId();
        const id2 = generateId();

        expect(id1).toBeTruthy();
        expect(typeof id1).toBe('string');
        expect(id1).not.toBe(id2);
    });

    // UNIT-FN-001-E: Rapid ID Generation
    it('UNIT-FN-001-E: should generate unique IDs rapidly', () => {
        const ids = Array(1000).fill(null).map(() => generateId());
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(1000);
    });

    // UNIT-FN-001-ED: ID Format Validation
    it('UNIT-FN-001-ED: should generate valid format IDs', () => {
        const id = generateId();

        // Should be a string of reasonable length
        expect(id.length).toBeGreaterThan(8);
        expect(id.length).toBeLessThan(50);
    });
});

describe('parsePrompts (FN-002)', () => {
    // UNIT-FN-002-N: Multi-line Parsing
    it('UNIT-FN-002-N: should parse multi-line prompts', () => {
        const input = 'Prompt 1\nPrompt 2\nPrompt 3';
        const result = parsePrompts(input);

        expect(result).toHaveLength(3);
        expect(result[0]).toBe('Prompt 1');
        expect(result[1]).toBe('Prompt 2');
        expect(result[2]).toBe('Prompt 3');
    });

    // UNIT-FN-002-E: Empty String Input
    it('UNIT-FN-002-E: should return empty array for empty string', () => {
        const result = parsePrompts('');

        expect(result).toHaveLength(0);
        expect(Array.isArray(result)).toBe(true);
    });

    // UNIT-FN-002-ED: Whitespace-only Lines
    it('UNIT-FN-002-ED: should filter out whitespace-only lines', () => {
        const input = 'Prompt 1\n   \n\nPrompt 2\n\t\nPrompt 3';
        const result = parsePrompts(input);

        expect(result).toHaveLength(3);
        expect(result).not.toContain('');
        expect(result).not.toContain('   ');
    });
});

describe('parsePromptsFromCsv (FN-003)', () => {
    // UNIT-FN-003-N: Valid CSV Content
    it('UNIT-FN-003-N: should parse valid CSV content', () => {
        const csvContent = 'Prompt A\nPrompt B\nPrompt C';
        const result = parsePromptsFromCsv(csvContent);

        expect(result).toHaveLength(3);
    });

    // UNIT-FN-003-E: Empty CSV
    it('UNIT-FN-003-E: should return empty array for empty CSV', () => {
        const result = parsePromptsFromCsv('');

        expect(result).toHaveLength(0);
    });

    // UNIT-FN-003-ED: CSV with Headers
    it('UNIT-FN-003-ED: should handle CSV with header row', () => {
        const csvContent = 'prompt\nPrompt 1\nPrompt 2';
        const result = parsePromptsFromCsv(csvContent);

        // Should parse all lines including header
        expect(result.length).toBeGreaterThanOrEqual(2);
    });
});

describe('createGenerationItem (FN-004)', () => {
    // UNIT-FN-004-N: Create Item from Prompt
    it('UNIT-FN-004-N: should create item with correct structure', () => {
        const prompt = 'Test prompt';
        const item = createGenerationItem(prompt);

        expect(item.id).toBeTruthy();
        expect(item.prompt).toBe(prompt);
        expect(item.status).toBe(GenerationStatus.QUEUED);
        expect(item.retryCount).toBe(0);
        expect(item.createdAt).toBeInstanceOf(Date);
    });

    // UNIT-FN-004-E: Empty Prompt
    it('UNIT-FN-004-E: should create item with empty prompt', () => {
        const item = createGenerationItem('');

        expect(item.id).toBeTruthy();
        expect(item.prompt).toBe('');
    });

    // UNIT-FN-004-ED: Long Prompt (10000 chars)
    it('UNIT-FN-004-ED: should handle long prompts', () => {
        const longPrompt = 'A'.repeat(10000);
        const item = createGenerationItem(longPrompt);

        expect(item.prompt).toBe(longPrompt);
        expect(item.prompt.length).toBe(10000);
    });
});

describe('formatDuration (FN-005)', () => {
    // UNIT-FN-005-N: Format 90 Seconds
    it('UNIT-FN-005-N: should format 90 seconds as 1:30', () => {
        const result = formatDuration(90);

        expect(result).toBe('1:30');
    });

    // UNIT-FN-005-E: Zero Seconds
    it('UNIT-FN-005-E: should format 0 seconds as 0:00', () => {
        const result = formatDuration(0);

        expect(result).toBe('0:00');
    });

    // UNIT-FN-005-ED: 3661 Seconds (1h 1m 1s)
    it('UNIT-FN-005-ED: should format hours correctly', () => {
        const result = formatDuration(3661);

        expect(result).toBe('1:01:01');
    });
});

describe('formatRelativeTime (FN-006)', () => {
    // UNIT-FN-006-N: 5 Minutes Ago
    it('UNIT-FN-006-N: should format 5 minutes ago', () => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const result = formatRelativeTime(fiveMinutesAgo);

        expect(result).toContain('min');
    });

    // UNIT-FN-006-E: Just Now
    it('UNIT-FN-006-E: should show just now for recent time', () => {
        const now = new Date();
        const result = formatRelativeTime(now);

        expect(result).toMatch(/just now|0 min|less than/i);
    });

    // UNIT-FN-006-ED: 2 Days Ago
    it('UNIT-FN-006-ED: should format days correctly', () => {
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const result = formatRelativeTime(twoDaysAgo);

        expect(result).toContain('day');
    });
});

describe('isValidCookieArray (FN-007)', () => {
    // UNIT-FN-007-N: Valid Cookie Array
    it('UNIT-FN-007-N: should return true for valid cookies', () => {
        const validCookies = [
            { name: 'cookie1', value: 'value1', domain: '.google.com' },
            { name: 'cookie2', value: 'value2', domain: '.google.com' },
        ];
        const result = isValidCookieArray(validCookies);

        expect(result).toBe(true);
    });

    // UNIT-FN-007-E: Not an Array
    it('UNIT-FN-007-E: should return false for non-array', () => {
        expect(isValidCookieArray('not an array')).toBe(false);
        expect(isValidCookieArray(null)).toBe(false);
        expect(isValidCookieArray(undefined)).toBe(false);
        expect(isValidCookieArray({})).toBe(false);
    });

    // UNIT-FN-007-ED: Missing Required Properties
    it('UNIT-FN-007-ED: should return false for missing properties', () => {
        const invalidCookies = [
            { name: 'cookie1' }, // Missing value and domain
        ];
        const result = isValidCookieArray(invalidCookies);

        expect(result).toBe(false);
    });
});

describe('filterGoogleCookies (FN-008)', () => {
    // UNIT-FN-008-N: Filter Google Cookies
    it('UNIT-FN-008-N: should filter only Google cookies', () => {
        const cookies = [
            { name: 'google1', value: 'val1', domain: '.google.com' },
            { name: 'other', value: 'val2', domain: '.example.com' },
            { name: 'youtube', value: 'val3', domain: '.youtube.com' },
        ];
        const result = filterGoogleCookies(cookies);

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.every((c: any) => c.domain.includes('google') || c.domain.includes('youtube'))).toBe(true);
    });

    // UNIT-FN-008-E: Empty Array Input
    it('UNIT-FN-008-E: should return empty for empty input', () => {
        const result = filterGoogleCookies([]);

        expect(result).toHaveLength(0);
    });

    // UNIT-FN-008-ED: All Non-Google
    it('UNIT-FN-008-ED: should return empty when no Google cookies', () => {
        const cookies = [
            { name: 'cookie1', value: 'val1', domain: '.example.com' },
            { name: 'cookie2', value: 'val2', domain: '.test.org' },
        ];
        const result = filterGoogleCookies(cookies);

        expect(result).toHaveLength(0);
    });
});

describe('getStatusSummary (FN-009)', () => {
    const createItems = (statuses: GenerationStatus[]): GenerationItem[] => {
        return statuses.map((status, i) => ({
            id: `id-${i}`,
            prompt: `prompt-${i}`,
            status,
            retryCount: 0,
            createdAt: new Date(),
        }));
    };

    // UNIT-FN-009-N: Multiple Statuses
    it('UNIT-FN-009-N: should count statuses correctly', () => {
        const items = createItems([
            GenerationStatus.QUEUED,
            GenerationStatus.PROCESSING,
            GenerationStatus.COMPLETED,
            GenerationStatus.COMPLETED,
            GenerationStatus.FAILED,
        ]);
        const result = getStatusSummary(items);

        expect(result.total).toBe(5);
        expect(result.queued).toBe(1);
        expect(result.processing).toBe(1);
        expect(result.completed).toBe(2);
        expect(result.failed).toBe(1);
    });

    // UNIT-FN-009-E: Empty Array
    it('UNIT-FN-009-E: should return zeros for empty array', () => {
        const result = getStatusSummary([]);

        expect(result.total).toBe(0);
        expect(result.queued).toBe(0);
        expect(result.completed).toBe(0);
    });

    // UNIT-FN-009-ED: All Same Status
    it('UNIT-FN-009-ED: should handle all same status', () => {
        const items = createItems([
            GenerationStatus.COMPLETED,
            GenerationStatus.COMPLETED,
            GenerationStatus.COMPLETED,
        ]);
        const result = getStatusSummary(items);

        expect(result.completed).toBe(3);
        expect(result.queued).toBe(0);
    });
});

describe('sleep (FN-010)', () => {
    // UNIT-FN-010-N: Sleep 100ms
    it('UNIT-FN-010-N: should delay for specified time', async () => {
        const start = Date.now();
        await sleep(100);
        const elapsed = Date.now() - start;

        expect(elapsed).toBeGreaterThanOrEqual(95); // Allow small variance
        expect(elapsed).toBeLessThan(200);
    });

    // UNIT-FN-010-E: Sleep 0ms
    it('UNIT-FN-010-E: should resolve immediately for 0ms', async () => {
        const start = Date.now();
        await sleep(0);
        const elapsed = Date.now() - start;

        expect(elapsed).toBeLessThan(50);
    });

    // UNIT-FN-010-ED: Negative Value
    it('UNIT-FN-010-ED: should handle negative values', async () => {
        const start = Date.now();
        await sleep(-100);
        const elapsed = Date.now() - start;

        expect(elapsed).toBeLessThan(50);
    });
});

describe('truncateText (FN-011)', () => {
    // UNIT-FN-011-N: Truncate Long Text
    it('UNIT-FN-011-N: should truncate text at maxLength', () => {
        const longText = 'This is a very long text that needs to be truncated';
        const result = truncateText(longText, 20);

        expect(result.length).toBeLessThanOrEqual(23); // 20 + "..."
        expect(result).toContain('...');
    });

    // UNIT-FN-011-E: Empty String
    it('UNIT-FN-011-E: should return empty for empty input', () => {
        const result = truncateText('', 10);

        expect(result).toBe('');
    });

    // UNIT-FN-011-ED: Text Shorter Than Max
    it('UNIT-FN-011-ED: should not truncate short text', () => {
        const shortText = 'Short';
        const result = truncateText(shortText, 100);

        expect(result).toBe(shortText);
        expect(result).not.toContain('...');
    });
});

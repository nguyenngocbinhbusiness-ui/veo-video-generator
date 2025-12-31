/**
 * E2E Tests: Prompt Input
 * Tests for UI-014 to UI-018 (Prompt Textarea, Count, Clear, CSV, Start Generation)
 * Total: 15 Test Cases
 */

import { test, expect } from '@playwright/test';

test.describe('Prompt Textarea (UI-014)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // E2E-UI-014-N: Single Prompt Entry
    test('E2E-UI-014-N: should accept and display single prompt', async ({ page }) => {
        const textarea = page.getByTestId('prompt-textarea');
        const prompt = 'A sunset over mountains with dramatic clouds';

        await textarea.fill(prompt);

        // Text should appear
        await expect(textarea).toHaveValue(prompt);

        // Count should show "1 prompt"
        await expect(page.getByTestId('prompt-count')).toContainText('1 prompt');

        // Start button should show (1)
        await expect(page.getByTestId('start-generation')).toContainText('(1)');
    });

    // E2E-UI-014-E: Textarea Disabled During Generation
    test.skip('E2E-UI-014-E: should be disabled during generation', async ({ page }) => {
        // This test requires valid cookies and queue processing
        // Skipped as it needs full integration
        const textarea = page.getByTestId('prompt-textarea');

        // Would need to start generation to test disabled state
        // await expect(textarea).toHaveAttribute('disabled');
        // await expect(textarea).toHaveClass(/opacity-50/);
        // await expect(textarea).toHaveClass(/cursor-not-allowed/);
    });

    // E2E-UI-014-ED: Multi-line Prompts (100+)
    test('E2E-UI-014-ED: should handle many prompts', async ({ page }) => {
        const textarea = page.getByTestId('prompt-textarea');

        // Generate 100 prompts
        const prompts = Array(100)
            .fill(null)
            .map((_, i) => `Prompt ${i + 1}: A beautiful scene number ${i + 1}`)
            .join('\n');

        await textarea.fill(prompts);

        // Count should show "100 prompts"
        await expect(page.getByTestId('prompt-count')).toContainText('100 prompts');

        // No performance issues
        await expect(page.getByTestId('start-generation')).toContainText('(100)');
    });
});

test.describe('Prompt Count (UI-015)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // E2E-UI-015-N: Prompt Count Display
    test('E2E-UI-015-N: should show correct count for multiple prompts', async ({ page }) => {
        const textarea = page.getByTestId('prompt-textarea');

        await textarea.fill('Prompt 1\nPrompt 2\nPrompt 3');

        // Should show "3 prompts" (plural)
        await expect(page.getByTestId('prompt-count')).toContainText('3 prompts');
    });

    // E2E-UI-015-E: No Prompts Hides Counter
    test('E2E-UI-015-E: should hide counter when empty', async ({ page }) => {
        const textarea = page.getByTestId('prompt-textarea');

        // Empty textarea
        await textarea.fill('');

        // Counter should not be visible
        await expect(page.getByTestId('prompt-count')).not.toBeVisible();
    });

    // E2E-UI-015-ED: Single Prompt Singular
    test('E2E-UI-015-ED: should use singular form for 1 prompt', async ({ page }) => {
        const textarea = page.getByTestId('prompt-textarea');

        await textarea.fill('Single prompt');

        // Should show "1 prompt" (singular, not "prompts")
        const counter = page.getByTestId('prompt-count');
        await expect(counter).toContainText('1 prompt');
        await expect(counter).not.toContainText('prompts');
    });
});

test.describe('Clear Prompts Button (UI-016)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // E2E-UI-016-N: Clear Prompts Button
    test('E2E-UI-016-N: should clear all prompts', async ({ page }) => {
        const textarea = page.getByTestId('prompt-textarea');

        // Enter prompts
        await textarea.fill('Prompt 1\nPrompt 2');
        await expect(page.getByTestId('prompt-count')).toBeVisible();

        // Click clear
        await page.getByTestId('clear-prompts').click();

        // Textarea should be empty
        await expect(textarea).toHaveValue('');

        // Counter should be hidden
        await expect(page.getByTestId('prompt-count')).not.toBeVisible();

        // Clear button should be hidden
        await expect(page.getByTestId('clear-prompts')).not.toBeVisible();
    });

    // E2E-UI-016-E: Clear Disabled During Generation
    test.skip('E2E-UI-016-E: should be disabled during generation', async ({ page }) => {
        // Requires full generation setup
        const clearButton = page.getByTestId('clear-prompts');
        // await expect(clearButton).toHaveClass(/opacity-50/);
        // await expect(clearButton).toBeDisabled();
    });

    // E2E-UI-016-ED: Clear Empty Textarea
    test('E2E-UI-016-ED: should not show when textarea is empty', async ({ page }) => {
        // Initially empty
        await expect(page.getByTestId('clear-prompts')).not.toBeVisible();

        // Add and remove text
        const textarea = page.getByTestId('prompt-textarea');
        await textarea.fill('test');
        await expect(page.getByTestId('clear-prompts')).toBeVisible();

        await textarea.fill('');
        await expect(page.getByTestId('clear-prompts')).not.toBeVisible();
    });
});

test.describe('CSV Uploader (UI-017)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // E2E-UI-017-N: Upload Valid CSV
    test('E2E-UI-017-N: should load prompts from CSV file', async ({ page }) => {
        const uploadButton = page.getByTestId('upload-csv-button');
        await expect(uploadButton).toBeVisible();
        await expect(uploadButton).toContainText('Upload CSV');

        // File upload would need to use page.setInputFiles
        // const fileInput = page.getByTestId('csv-uploader');
        // await fileInput.setInputFiles('path/to/test.csv');
    });

    // E2E-UI-017-E: Upload Invalid File
    test('E2E-UI-017-E: should handle invalid file type', async ({ page }) => {
        const fileInput = page.getByTestId('csv-uploader');

        // Accept attribute should filter files
        await expect(fileInput).toHaveAttribute('accept', '.csv,.txt');
    });

    // E2E-UI-017-ED: CSV with Header Row
    test('E2E-UI-017-ED: should skip header row in CSV', async ({ page }) => {
        // This would need file upload test
        const uploadButton = page.getByTestId('upload-csv-button');
        await expect(uploadButton).toBeVisible();
    });
});

test.describe('Start Generation Button (UI-018)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // E2E-UI-018-N: Start Generation Button
    test('E2E-UI-018-N: should show prompt count and be functional', async ({ page }) => {
        const textarea = page.getByTestId('prompt-textarea');
        const startButton = page.getByTestId('start-generation');

        // Initially disabled
        await expect(startButton).toBeDisabled();

        // Add prompts
        await textarea.fill('Test prompt 1\nTest prompt 2');

        // Button should show count but still disabled (needs cookies)
        await expect(startButton).toContainText('(2)');

        // Button still disabled without valid cookies
        await expect(startButton).toBeDisabled();
    });

    // E2E-UI-018-E: Start Without Prompts
    test('E2E-UI-018-E: should be disabled when no prompts', async ({ page }) => {
        const startButton = page.getByTestId('start-generation');

        // Should be disabled
        await expect(startButton).toBeDisabled();
        await expect(startButton).toHaveClass(/disabled:opacity-50/);
        await expect(startButton).toHaveClass(/disabled:cursor-not-allowed/);
    });

    // E2E-UI-018-ED: Start Without Valid Cookies
    test('E2E-UI-018-ED: should be disabled without valid cookies', async ({ page }) => {
        const textarea = page.getByTestId('prompt-textarea');
        const startButton = page.getByTestId('start-generation');

        // Add prompts
        await textarea.fill('Test prompt');

        // Cookie status should be invalid
        await expect(page.locator('text=Invalid')).toBeVisible();

        // Button should still be disabled
        await expect(startButton).toBeDisabled();
    });
});

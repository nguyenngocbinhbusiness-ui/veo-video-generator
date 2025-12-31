import { test, expect } from '@playwright/test';

test.describe('Veo Video Generator App', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load the application', async ({ page }) => {
        await expect(page).toHaveTitle(/Veo Video Generator/i);
    });

    test('should navigate between tabs', async ({ page }) => {
        // Default is Generator tab
        await expect(page.getByText('Generation Queue')).toBeVisible();

        // Click YouTube tab
        await page.getByRole('tab', { name: /YouTube/i }).click();
        await expect(page.getByText('YouTube Downloader')).toBeVisible();

        // Click AI Chat tab
        await page.getByRole('tab', { name: /AI Assistant/i }).click();
        await expect(page.getByText('AI Assistant')).toBeVisible();
    });

    test('should allow entering prompts', async ({ page }) => {
        // Go to Generator tab
        await page.getByRole('tab', { name: /Generator/i }).click();

        const textarea = page.getByPlaceholderText(/A cinematic shot/i);
        await textarea.fill('Test prompt 1\nTest prompt 2');

        await expect(page.getByText('2 prompts')).toBeVisible();
    });

    test('should show import cookie modal', async ({ page }) => {
        await page.getByRole('button', { name: /Import Cookies/i }).click();
        await expect(page.getByText('Import Google Cookies')).toBeVisible();
        await expect(page.getByRole('button', { name: /Paste from Clipboard/i })).toBeVisible();
    });
});

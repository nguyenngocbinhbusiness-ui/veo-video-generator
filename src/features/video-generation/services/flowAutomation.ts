/**
 * Flow Automation Service
 * Playwright-based browser automation for Google Flow video generation
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { Cookie, GenerationItem, GenerationOptions } from '@shared/types';
import { FLOW_URLS, FLOW_SELECTORS, TIMEOUTS, DEFAULT_SETTINGS } from '@shared/constants';
import { sleep } from '@shared/utils';

export interface VideoResult {
    success: boolean;
    videoPath?: string;
    error?: string;
}

class FlowAutomation {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;
    private isInitialized: boolean = false;

    /**
     * Initialize browser with cookies
     */
    async initialize(cookies: Cookie[], headless: boolean = true): Promise<void> {
        if (this.isInitialized) {
            await this.close();
        }

        try {
            // Launch browser
            this.browser = await chromium.launch({
                headless,
                args: [
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                ],
            });

            // Create context with cookies
            this.context = await this.browser.newContext({
                viewport: { width: 1920, height: 1080 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            });

            // Inject cookies
            await this.injectCookies(cookies);

            // Create page
            this.page = await this.context.newPage();
            this.isInitialized = true;

            console.log('[FlowAutomation] Browser initialized successfully');
        } catch (error) {
            console.error('[FlowAutomation] Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Inject cookies into browser context
     */
    private async injectCookies(cookies: Cookie[]): Promise<void> {
        if (!this.context) {
            throw new Error('Browser context not initialized');
        }

        // Convert cookies to Playwright format
        const playwrightCookies = cookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain.startsWith('.') ? cookie.domain : `.${cookie.domain}`,
            path: cookie.path || '/',
            expires: cookie.expires || -1,
            httpOnly: cookie.httpOnly || false,
            secure: cookie.secure || true,
            sameSite: (cookie.sameSite || 'Lax') as 'Strict' | 'Lax' | 'None',
        }));

        await this.context.addCookies(playwrightCookies);
        console.log(`[FlowAutomation] Injected ${playwrightCookies.length} cookies`);
    }

    /**
     * Navigate to Google Flow and verify authentication
     */
    async navigateToFlow(): Promise<boolean> {
        if (!this.page) {
            throw new Error('Page not initialized');
        }

        try {
            console.log('[FlowAutomation] Navigating to Google Flow...');
            await this.page.goto(FLOW_URLS.BASE, {
                waitUntil: 'networkidle',
                timeout: TIMEOUTS.pageLoad,
            });

            // Wait a moment for dynamic content
            await sleep(2000);

            // Check if logged in by looking for user avatar or specific logged-in elements
            const isLoggedIn = await this.checkAuthentication();

            if (!isLoggedIn) {
                console.warn('[FlowAutomation] Not logged in - cookies may be invalid');
                return false;
            }

            console.log('[FlowAutomation] Successfully authenticated with Google Flow');
            return true;
        } catch (error) {
            console.error('[FlowAutomation] Navigation failed:', error);
            return false;
        }
    }

    /**
     * Check if user is authenticated
     */
    private async checkAuthentication(): Promise<boolean> {
        if (!this.page) return false;

        try {
            // Try multiple indicators of being logged in
            const selectors = [
                FLOW_SELECTORS.userAvatar,
                'img[alt*="profile"]',
                '[data-testid="user-menu"]',
                'button[aria-label*="Account"]',
            ];

            for (const selector of selectors) {
                try {
                    const element = await this.page.$(selector);
                    if (element) {
                        return true;
                    }
                } catch {
                    continue;
                }
            }

            // Check if sign-in button is visible (means NOT logged in)
            const signInButton = await this.page.$(FLOW_SELECTORS.signInButton);
            if (signInButton) {
                return false;
            }

            // Default to true if we can't determine
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Generate a video from a prompt
     */
    async generateVideo(
        prompt: string,
        options: GenerationOptions = {}
    ): Promise<VideoResult> {
        if (!this.page) {
            return { success: false, error: 'Browser not initialized' };
        }

        try {
            console.log(`[FlowAutomation] Starting generation for: "${prompt.substring(0, 50)}..."`);

            // Find and fill the prompt input
            const promptInput = await this.page.waitForSelector(
                FLOW_SELECTORS.promptInput,
                { timeout: TIMEOUTS.elementVisible }
            );

            if (!promptInput) {
                return { success: false, error: 'Could not find prompt input field' };
            }

            // Clear existing text and type new prompt
            await promptInput.click({ clickCount: 3 });
            await promptInput.fill(prompt);
            await sleep(500);

            // Click generate button
            const generateButton = await this.page.waitForSelector(
                FLOW_SELECTORS.generateButton,
                { timeout: TIMEOUTS.elementVisible }
            );

            if (!generateButton) {
                return { success: false, error: 'Could not find generate button' };
            }

            await generateButton.click();
            console.log('[FlowAutomation] Generate button clicked, waiting for video...');

            // Wait for video generation to complete
            const result = await this.waitForGeneration();

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[FlowAutomation] Generation failed:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Wait for video generation to complete
     */
    private async waitForGeneration(): Promise<VideoResult> {
        if (!this.page) {
            return { success: false, error: 'Page not available' };
        }

        const startTime = Date.now();
        const timeout = TIMEOUTS.videoGeneration;

        while (Date.now() - startTime < timeout) {
            // Check for error
            const errorElement = await this.page.$(FLOW_SELECTORS.errorMessage);
            if (errorElement) {
                const errorText = await errorElement.textContent();
                return { success: false, error: errorText || 'Generation failed' };
            }

            // Check for video preview (indicates completion)
            const videoElement = await this.page.$(FLOW_SELECTORS.videoPreview);
            if (videoElement) {
                console.log('[FlowAutomation] Video generation complete!');
                return { success: true };
            }

            // Check for loading/progress indicators
            const isLoading = await this.page.$(FLOW_SELECTORS.loadingSpinner);
            if (isLoading) {
                // Still generating, wait and check again
                await sleep(5000);
                continue;
            }

            // If no loading indicator and no video, something might be wrong
            await sleep(3000);
        }

        return { success: false, error: 'Generation timed out' };
    }

    /**
     * Download the generated video
     */
    async downloadVideo(outputPath: string): Promise<string> {
        if (!this.page) {
            throw new Error('Page not initialized');
        }

        // Set up download handler
        const downloadPromise = this.page.waitForEvent('download', {
            timeout: TIMEOUTS.downloadComplete,
        });

        // Click download button
        const downloadButton = await this.page.waitForSelector(
            FLOW_SELECTORS.downloadButton,
            { timeout: TIMEOUTS.elementVisible }
        );

        if (!downloadButton) {
            throw new Error('Download button not found');
        }

        await downloadButton.click();

        // Wait for download to start
        const download = await downloadPromise;

        // Save to specified path
        await download.saveAs(outputPath);
        console.log(`[FlowAutomation] Video downloaded to: ${outputPath}`);

        return outputPath;
    }

    /**
     * Take a screenshot for debugging
     */
    async screenshot(path: string): Promise<void> {
        if (this.page) {
            await this.page.screenshot({ path, fullPage: true });
        }
    }

    /**
     * Get current page URL
     */
    getCurrentUrl(): string {
        return this.page?.url() || '';
    }

    /**
     * Check if browser is ready
     */
    isReady(): boolean {
        return this.isInitialized && this.page !== null;
    }

    /**
     * Close browser and cleanup
     */
    async close(): Promise<void> {
        try {
            if (this.page) {
                await this.page.close();
                this.page = null;
            }
            if (this.context) {
                await this.context.close();
                this.context = null;
            }
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            this.isInitialized = false;
            console.log('[FlowAutomation] Browser closed');
        } catch (error) {
            console.error('[FlowAutomation] Error closing browser:', error);
        }
    }
}

// Export singleton instance
export const flowAutomation = new FlowAutomation();
export default flowAutomation;

/**
 * Cookie Manager Service
 * Handles importing, validating, and managing browser cookies for Google Flow authentication
 */

import { Cookie } from '@shared/types';
import { isValidCookieArray, filterGoogleCookies } from '@shared/utils';

export interface CookieManagerState {
    cookies: Cookie[];
    isValid: boolean;
    expiresAt: Date | null;
    lastValidated: Date | null;
}

class CookieManager {
    private state: CookieManagerState = {
        cookies: [],
        isValid: false,
        expiresAt: null,
        lastValidated: null,
    };

    /**
     * Import cookies from JSON string (clipboard or file content)
     */
    importFromJson(jsonString: string): Cookie[] {
        try {
            const parsed = JSON.parse(jsonString);

            if (!isValidCookieArray(parsed)) {
                throw new Error('Invalid cookie format. Expected array of cookie objects.');
            }

            // Filter to only Google-related cookies
            const googleCookies = filterGoogleCookies(parsed) as Cookie[];

            if (googleCookies.length === 0) {
                throw new Error('No Google cookies found in the imported data.');
            }

            this.state.cookies = googleCookies;
            this.state.lastValidated = new Date();
            this.updateExpiryInfo();

            return googleCookies;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error('Invalid JSON format. Please paste valid cookie JSON.');
            }
            throw error;
        }
    }

    /**
     * Import cookies from file path
     */
    async importFromFile(filePath: string): Promise<Cookie[]> {
        // This will be implemented in the Electron main process
        // For renderer, we'll use IPC to call this
        throw new Error('Use IPC to import from file in renderer process');
    }

    /**
     * Update expiry information based on cookies
     */
    private updateExpiryInfo(): void {
        const now = Date.now();
        let earliestExpiry: number | null = null;

        for (const cookie of this.state.cookies) {
            // cookie.expires is in Unix seconds, convert to milliseconds for comparison
            const expiryMs = cookie.expires * 1000;
            if (cookie.expires && expiryMs > now) {
                if (earliestExpiry === null || cookie.expires < earliestExpiry) {
                    earliestExpiry = cookie.expires;
                }
            }
        }

        this.state.expiresAt = earliestExpiry ? new Date(earliestExpiry * 1000) : null;
        this.state.isValid = earliestExpiry !== null && (earliestExpiry * 1000) > now;
    }

    /**
     * Get current cookie state
     */
    getState(): CookieManagerState {
        return { ...this.state };
    }

    /**
     * Get cookies for Playwright injection
     */
    getCookiesForBrowser(): Cookie[] {
        return this.state.cookies;
    }

    /**
     * Check if cookies are still valid
     */
    isSessionValid(): boolean {
        this.updateExpiryInfo();
        return this.state.isValid;
    }

    /**
     * Get time until session expires
     */
    getTimeUntilExpiry(): number | null {
        if (!this.state.expiresAt) {
            return null;
        }
        return Math.max(0, this.state.expiresAt.getTime() - Date.now());
    }

    /**
     * Format expiry time for display
     */
    getExpiryDisplay(): string {
        const timeUntil = this.getTimeUntilExpiry();

        if (timeUntil === null) {
            return 'Unknown';
        }

        if (timeUntil <= 0) {
            return 'Expired';
        }

        const hours = Math.floor(timeUntil / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    /**
     * Clear all cookies
     */
    clear(): void {
        this.state = {
            cookies: [],
            isValid: false,
            expiresAt: null,
            lastValidated: null,
        };
    }
}

// Export singleton instance
export const cookieManager = new CookieManager();
export default cookieManager;

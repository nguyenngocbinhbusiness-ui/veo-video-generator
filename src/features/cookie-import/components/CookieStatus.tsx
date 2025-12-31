import React from 'react';
import { cookieManager } from '../services/cookieManager';

interface CookieStatusProps {
    onRefresh: () => void;
    onOpenImport: () => void;
}

export function CookieStatus({ onRefresh, onOpenImport }: CookieStatusProps) {
    const state = cookieManager.getState();
    const expiryDisplay = cookieManager.getExpiryDisplay();

    return (
        <div className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Status indicator */}
                <div className={`w-3 h-3 rounded-full ${state.isValid ? 'bg-green-400' : 'bg-red-400'}`} data-testid="cookie-status-indicator">
                    {state.isValid && (
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-ping" />
                    )}
                </div>

                <div>
                    <span className="text-sm font-medium text-white">
                        Cookie Status:{' '}
                        <span className={state.isValid ? 'text-green-400' : 'text-red-400'}>
                            {state.isValid ? 'Valid' : 'Invalid'}
                        </span>
                    </span>
                    {state.isValid && (
                        <span className="text-sm text-slate-400 ml-2">
                            (expires in {expiryDisplay})
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {state.isValid ? (
                    <button onClick={onRefresh} className="btn-ghost text-sm" data-testid="refresh-button">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                ) : (
                    <button onClick={onOpenImport} className="btn-primary text-sm" data-testid="import-button">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Import Cookies
                    </button>
                )}
            </div>
        </div>
    );
}

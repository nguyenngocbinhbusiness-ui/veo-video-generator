import React, { useState } from 'react';
import { cookieManager } from '../services/cookieManager';

interface CookieImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CookieImportModal({ isOpen, onClose, onSuccess }: CookieImportModalProps) {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setJsonInput(text);
            setError(null);
        } catch (err) {
            setError('Failed to read clipboard. Please paste manually.');
        }
    };

    const handleImport = async () => {
        if (!jsonInput.trim()) {
            setError('Please paste or enter cookie JSON');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const cookies = cookieManager.importFromJson(jsonInput);
            console.log(`Imported ${cookies.length} cookies`);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import cookies');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonInput(content);
            setError(null);
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-testid="import-modal">
            <div className="w-full max-w-lg glass rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white">Import Google Cookies</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        data-testid="close-modal"
                    >
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Error message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm" data-testid="modal-error">
                            {error}
                        </div>
                    )}

                    {/* JSON input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Paste Cookie JSON
                        </label>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='[{"name": "SSID", "value": "...", "domain": ".google.com", ...}]'
                            className="textarea h-32 font-mono text-sm"
                            data-testid="cookie-textarea"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handlePaste}
                            className="btn-secondary flex-1"
                            data-testid="paste-clipboard-button"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Paste from Clipboard
                        </button>
                        <label className="btn-secondary flex-1 cursor-pointer">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload File
                            <input
                                type="file"
                                accept=".json,.txt"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">How to export cookies:</h4>
                        <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                            <li>Install "Cookie Editor" extension in your browser</li>
                            <li>Go to <a href="https://labs.google/fx/flow" target="_blank" rel="noopener" className="text-primary-400 hover:underline">labs.google/fx/flow</a> and sign in</li>
                            <li>Click the Cookie Editor icon and export as JSON</li>
                        </ol>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-white/10">
                    <button onClick={onClose} className="btn-ghost flex-1">
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isLoading || !jsonInput.trim()}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="submit-import"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Importing...
                            </>
                        ) : (
                            'Import Cookies'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

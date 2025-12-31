import React, { useState } from 'react';

interface UrlInputProps {
    onDownload: (url: string) => void;
    disabled?: boolean;
}

export function UrlInput({ onDownload, disabled }: UrlInputProps) {
    const [url, setUrl] = useState('');

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUrl(text);
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const handleSubmit = () => {
        if (url.trim() && isValidYoutubeUrl(url)) {
            onDownload(url.trim());
            setUrl('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && url.trim()) {
            handleSubmit();
        }
    };

    const isValidYoutubeUrl = (inputUrl: string): boolean => {
        const patterns = [
            /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^https?:\/\/youtu\.be\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
        ];
        return patterns.some(pattern => pattern.test(inputUrl));
    };

    const isValid = url.trim() === '' || isValidYoutubeUrl(url);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
                YouTube URL
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {/* YouTube icon */}
                        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="https://youtube.com/watch?v=..."
                        disabled={disabled}
                        className={`input pl-10 ${!isValid ? 'border-red-500 focus:ring-red-500' : ''}`}
                        data-testid="youtube-url-input"
                    />
                </div>

                {/* Paste button */}
                <button
                    onClick={handlePaste}
                    disabled={disabled}
                    className="btn-secondary"
                    title="Paste from clipboard"
                    data-testid="paste-button"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </button>

                {/* Download button */}
                <button
                    onClick={handleSubmit}
                    disabled={disabled || !url.trim() || !isValid}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="download-button"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </button>
            </div>

            {!isValid && (
                <p className="text-xs text-red-400" data-testid="url-error-message">
                    Please enter a valid YouTube URL
                </p>
            )}
        </div>
    );
}

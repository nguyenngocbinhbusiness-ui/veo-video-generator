import React from 'react';
import { YoutubeDownloadItem } from '../types';

interface DownloadItemProps {
    item: YoutubeDownloadItem;
    onOpenFolder: (item: YoutubeDownloadItem) => void;
    onRetry: (item: YoutubeDownloadItem) => void;
    onCancel: (item: YoutubeDownloadItem) => void;
}

export function DownloadItem({ item, onOpenFolder, onRetry, onCancel }: DownloadItemProps) {
    const getStatusBadge = () => {
        switch (item.status) {
            case 'queued':
                return (
                    <span className="status-queued">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Queued
                    </span>
                );
            case 'downloading':
                return (
                    <span className="status-processing">
                        <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        Downloading
                    </span>
                );
            case 'completed':
                return (
                    <span className="status-completed">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Completed
                    </span>
                );
            case 'failed':
                return (
                    <span className="status-failed">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Failed
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`
            p-4 rounded-lg border transition-all duration-200
            ${item.status === 'downloading' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/50 border-slate-700/50'}
            ${item.status === 'failed' ? 'bg-red-500/5 border-red-500/20' : ''}
            ${item.status === 'completed' ? 'bg-green-500/5 border-green-500/20' : ''}
        `} data-testid="download-item">
            <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {item.thumbnail && (
                    <div className="flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-slate-700">
                        <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                        {item.title || 'Loading...'}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        {getStatusBadge()}
                        {item.duration && (
                            <span className="text-xs text-slate-500">{item.duration}</span>
                        )}
                    </div>

                    {/* Progress bar */}
                    {item.status === 'downloading' && (
                        <div className="mt-3" data-testid="progress-bar">
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                                    style={{ width: `${item.progress}%` }}
                                    data-progress={item.progress}
                                />
                            </div>
                            <span className="text-xs text-slate-400 mt-1">{item.progress}%</span>
                        </div>
                    )}

                    {item.error && (
                        <p className="text-xs text-red-400 mt-2">{item.error}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {item.status === 'downloading' && (
                        <button
                            onClick={() => onCancel(item)}
                            className="btn-ghost text-sm text-slate-400 hover:text-red-400"
                            title="Cancel download"
                            data-testid="cancel-button"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    {item.status === 'completed' && (
                        <button
                            onClick={() => onOpenFolder(item)}
                            className="btn-ghost text-sm text-green-400 hover:text-green-300"
                            data-testid="open-folder-button"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            Open Folder
                        </button>
                    )}
                    {item.status === 'failed' && (
                        <button
                            onClick={() => onRetry(item)}
                            className="btn-ghost text-sm text-orange-400 hover:text-orange-300"
                            data-testid="retry-button"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

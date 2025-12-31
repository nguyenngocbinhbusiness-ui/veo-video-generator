import React from 'react';
import { GenerationItem } from '@shared/types';
import { truncateText, formatRelativeTime } from '@shared/utils';

interface QueueItemProps {
    item: GenerationItem;
    onDownload?: (item: GenerationItem) => void;
    onRetry?: (item: GenerationItem) => void;
}

export function QueueItem({ item, onDownload, onRetry }: QueueItemProps) {
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
            case 'processing':
                return (
                    <span className="status-processing">
                        <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        Processing
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
      ${item.status === 'processing' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/50 border-slate-700/50'}
      ${item.status === 'failed' ? 'bg-red-500/5 border-red-500/20' : ''}
      ${item.status === 'completed' ? 'bg-green-500/5 border-green-500/20' : ''}
    `} data-testid="queue-item">
            <div className="flex items-start justify-between gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                        {truncateText(item.prompt, 100)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        {getStatusBadge()}
                        <span className="text-xs text-slate-500">
                            {formatRelativeTime(item.createdAt)}
                        </span>
                        {item.retryCount > 0 && (
                            <span className="text-xs text-orange-400">
                                Retry #{item.retryCount}
                            </span>
                        )}
                    </div>
                    {item.error && (
                        <p className="text-xs text-red-400 mt-2">
                            {item.error}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {item.status === 'completed' && onDownload && (
                        <button
                            onClick={() => onDownload(item)}
                            className="btn-ghost text-sm text-green-400 hover:text-green-300"
                            data-testid="item-download-button"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                        </button>
                    )}
                    {item.status === 'failed' && onRetry && (
                        <button
                            onClick={() => onRetry(item)}
                            className="btn-ghost text-sm text-orange-400 hover:text-orange-300"
                            data-testid="item-retry-button"
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

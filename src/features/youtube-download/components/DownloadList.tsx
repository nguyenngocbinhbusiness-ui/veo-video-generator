import React from 'react';
import { YoutubeDownloadItem } from '../types';
import { DownloadItem } from './DownloadItem';

interface DownloadListProps {
    items: YoutubeDownloadItem[];
    onOpenFolder: (item: YoutubeDownloadItem) => void;
    onRetry: (item: YoutubeDownloadItem) => void;
    onCancel: (item: YoutubeDownloadItem) => void;
    onClearCompleted: () => void;
}

export function DownloadList({
    items,
    onOpenFolder,
    onRetry,
    onCancel,
    onClearCompleted,
}: DownloadListProps) {
    const hasItems = items.length > 0;
    const completedCount = items.filter(i => i.status === 'completed').length;
    const downloadingCount = items.filter(i => i.status === 'downloading').length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-white">Downloads</h3>
                    {hasItems && (
                        <div className="flex items-center gap-2 text-sm">
                            {downloadingCount > 0 && (
                                <span className="text-blue-400">{downloadingCount} downloading</span>
                            )}
                            {completedCount > 0 && (
                                <>
                                    {downloadingCount > 0 && <span className="text-slate-500">•</span>}
                                    <span className="text-green-400">{completedCount} completed</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {completedCount > 0 && (
                    <button onClick={onClearCompleted} className="btn-ghost text-sm" data-testid="clear-completed-button">
                        Clear Completed
                    </button>
                )}
            </div>

            {/* List */}
            {hasItems ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2" data-testid="download-list">
                    {items.map(item => (
                        <DownloadItem
                            key={item.id}
                            item={item}
                            onOpenFolder={onOpenFolder}
                            onRetry={onRetry}
                            onCancel={onCancel}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-slate-500" data-testid="empty-downloads-message">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <p>No downloads yet</p>
                    <p className="text-sm mt-1">Paste a YouTube URL above to start</p>
                </div>
            )}
        </div>
    );
}

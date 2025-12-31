import React from 'react';
import { QueueStatus, GenerationItem } from '@shared/types';
import { QueueItem } from './QueueItem';

interface QueueDashboardProps {
    status: QueueStatus;
    onPause: () => void;
    onResume: () => void;
    onClearCompleted: () => void;
    onRetryFailed: () => void;
    onDownload: (item: GenerationItem) => void;
    onRetryItem: (item: GenerationItem) => void;
}

export function QueueDashboard({
    status,
    onPause,
    onResume,
    onClearCompleted,
    onRetryFailed,
    onDownload,
    onRetryItem,
}: QueueDashboardProps) {
    const hasItems = status.items.length > 0;
    const hasCompleted = status.completed > 0;
    const hasFailed = status.failed > 0;

    return (
        <div className="space-y-4">
            {/* Progress header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-white">Generation Queue</h3>
                    {hasItems && (
                        <div className="flex items-center gap-2 text-sm" data-testid="queue-counter">
                            <span className="text-green-400">{status.completed}</span>
                            <span className="text-slate-500">/</span>
                            <span className="text-white">{status.total}</span>
                            <span className="text-slate-500">completed</span>
                        </div>
                    )}
                </div>

                {/* Control buttons */}
                <div className="flex items-center gap-2">
                    {status.processing > 0 || status.queued > 0 ? (
                        status.isPaused ? (
                            <button onClick={onResume} className="btn-primary text-sm" data-testid="resume-button">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Resume
                            </button>
                        ) : (
                            <button onClick={onPause} className="btn-secondary text-sm" data-testid="pause-button">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pause
                            </button>
                        )
                    ) : null}

                    {hasCompleted && (
                        <button onClick={onClearCompleted} className="btn-ghost text-sm" data-testid="clear-completed-queue">
                            Clear Completed
                        </button>
                    )}

                    {hasFailed && (
                        <button onClick={onRetryFailed} className="btn-ghost text-sm text-orange-400" data-testid="retry-failed-button">
                            Retry All Failed
                        </button>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {hasItems && (
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden" data-testid="queue-progress-bar">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                        style={{ width: `${(status.completed / status.total) * 100}%` }}
                    />
                </div>
            )}

            {/* Queue items */}
            {hasItems ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {status.items.map((item) => (
                        <QueueItem
                            key={item.id}
                            item={item}
                            onDownload={onDownload}
                            onRetry={onRetryItem}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-slate-500" data-testid="empty-queue-message">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p>No items in queue</p>
                    <p className="text-sm mt-1">Add prompts above to start generating</p>
                </div>
            )}
        </div>
    );
}

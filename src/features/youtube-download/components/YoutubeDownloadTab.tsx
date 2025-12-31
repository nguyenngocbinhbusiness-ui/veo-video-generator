import { useState, useEffect } from 'react';
import { YoutubeDownloadItem } from '../types';
import { UrlInput } from './UrlInput';
import { DownloadList } from './DownloadList';

// Generate unique ID
const generateId = () => `yt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Check if running in Electron
const isElectron = () => {
    try {
        return !!(window as unknown as { require?: unknown }).require;
    } catch {
        return false;
    }
};

// Safe IPC renderer getter
const getIpcRenderer = () => {
    if (isElectron()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (window as any).require('electron').ipcRenderer;
    }
    return null;
};

export function YoutubeDownloadTab() {
    const [downloads, setDownloads] = useState<YoutubeDownloadItem[]>([]);

    // Listen for progress updates from main process
    useEffect(() => {
        const ipcRenderer = getIpcRenderer();
        if (!ipcRenderer) return;

        const handleProgress = (_: unknown, data: { id: string; progress: number; title?: string; thumbnail?: string }) => {
            setDownloads(prev => prev.map(item =>
                item.id === data.id
                    ? {
                        ...item,
                        progress: data.progress,
                        title: data.title || item.title,
                        thumbnail: data.thumbnail || item.thumbnail,
                        status: 'downloading' as const,
                    }
                    : item
            ));
        };

        const handleComplete = (_: unknown, data: { id: string; filePath: string }) => {
            setDownloads(prev => prev.map(item =>
                item.id === data.id
                    ? { ...item, status: 'completed' as const, progress: 100, filePath: data.filePath }
                    : item
            ));
        };

        const handleError = (_: unknown, data: { id: string; error: string }) => {
            setDownloads(prev => prev.map(item =>
                item.id === data.id
                    ? { ...item, status: 'failed' as const, error: data.error }
                    : item
            ));
        };

        ipcRenderer.on('youtube:progress', handleProgress);
        ipcRenderer.on('youtube:complete', handleComplete);
        ipcRenderer.on('youtube:error', handleError);

        return () => {
            ipcRenderer.removeListener('youtube:progress', handleProgress);
            ipcRenderer.removeListener('youtube:complete', handleComplete);
            ipcRenderer.removeListener('youtube:error', handleError);
        };
    }, []);

    const handleDownload = async (url: string) => {
        const ipcRenderer = getIpcRenderer();

        const newItem: YoutubeDownloadItem = {
            id: generateId(),
            url,
            title: 'Fetching video info...',
            status: 'queued',
            progress: 0,
            createdAt: new Date(),
        };

        setDownloads(prev => [newItem, ...prev]);

        // Request download from main process
        if (!ipcRenderer) {
            setDownloads(prev => prev.map(item =>
                item.id === newItem.id
                    ? { ...item, status: 'failed' as const, error: 'Not running in Electron' }
                    : item
            ));
            return;
        }

        try {
            await ipcRenderer.invoke('youtube:download', { id: newItem.id, url });
        } catch (err) {
            setDownloads(prev => prev.map(item =>
                item.id === newItem.id
                    ? { ...item, status: 'failed' as const, error: String(err) }
                    : item
            ));
        }
    };

    const handleOpenFolder = async (item: YoutubeDownloadItem) => {
        if (item.filePath) {
            const ipcRenderer = getIpcRenderer();
            if (ipcRenderer) {
                await ipcRenderer.invoke('video:download', item.filePath);
            }
        }
    };

    const handleRetry = async (item: YoutubeDownloadItem) => {
        // Update status to queued and retry
        setDownloads(prev => prev.map(i =>
            i.id === item.id
                ? { ...i, status: 'queued' as const, error: undefined, progress: 0 }
                : i
        ));

        const ipcRenderer = getIpcRenderer();
        if (!ipcRenderer) return;

        try {
            await ipcRenderer.invoke('youtube:download', { id: item.id, url: item.url });
        } catch (err) {
            setDownloads(prev => prev.map(i =>
                i.id === item.id
                    ? { ...i, status: 'failed' as const, error: String(err) }
                    : i
            ));
        }
    };

    const handleCancel = async (item: YoutubeDownloadItem) => {
        const ipcRenderer = getIpcRenderer();
        if (ipcRenderer) {
            await ipcRenderer.invoke('youtube:cancel', { id: item.id });
        }
        setDownloads(prev => prev.filter(i => i.id !== item.id));
    };

    const handleClearCompleted = () => {
        setDownloads(prev => prev.filter(item => item.status !== 'completed'));
    };

    const isDownloading = downloads.some(d => d.status === 'downloading');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">YouTube Downloader</h2>
                    <p className="text-sm text-slate-400">Download videos from YouTube</p>
                </div>
            </div>

            {/* URL Input */}
            <div className="card">
                <UrlInput onDownload={handleDownload} disabled={isDownloading} />
            </div>

            {/* Download List */}
            <div className="card">
                <DownloadList
                    items={downloads}
                    onOpenFolder={handleOpenFolder}
                    onRetry={handleRetry}
                    onCancel={handleCancel}
                    onClearCompleted={handleClearCompleted}
                />
            </div>
        </div>
    );
}

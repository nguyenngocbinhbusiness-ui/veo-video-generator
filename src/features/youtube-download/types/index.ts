/**
 * YouTube Download Feature - Type Definitions
 */

export type YoutubeDownloadStatus = 'queued' | 'downloading' | 'completed' | 'failed';

export interface YoutubeDownloadItem {
    id: string;
    url: string;
    title: string;
    status: YoutubeDownloadStatus;
    progress: number;
    filePath?: string;
    error?: string;
    createdAt: Date;
    thumbnail?: string;
    duration?: string;
}

export interface VideoInfo {
    title: string;
    thumbnail: string;
    duration: string;
    channel: string;
}

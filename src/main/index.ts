/**
 * Electron Main Process
 * Entry point for the Electron application
 */

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as os from 'os';
import { IPC_CHANNELS } from '../shared/types';

import youtubedl from 'youtube-dl-exec';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

// Track active downloads for cancellation
const activeDownloads: Map<string, { controller: AbortController }> = new Map();

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#0f172a',
        show: false,
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers - Video management
ipcMain.handle(IPC_CHANNELS.VIDEO_DOWNLOAD, async (_, videoPath: string) => {
    try {
        shell.showItemInFolder(videoPath);
        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
});

ipcMain.handle(IPC_CHANNELS.VIDEO_OPEN_FOLDER, async (_, folderPath: string) => {
    await shell.openPath(folderPath);
});

// IPC Handlers - YouTube Download
ipcMain.handle(IPC_CHANNELS.YOUTUBE_DOWNLOAD, async (event, data: { id: string; url: string }) => {
    const { id, url } = data;
    const downloadsDir = path.join(os.homedir(), 'Downloads');

    try {
        // First, get video info
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const info: any = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        const title = (info.title as string) || 'Unknown Video';
        const thumbnail = (info.thumbnail as string) || '';
        const duration = formatDuration((info.duration as number) || 0);
        const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
        const outputPath = path.join(downloadsDir, `${safeTitle}.mp4`);

        // Send initial info
        mainWindow?.webContents.send(IPC_CHANNELS.YOUTUBE_PROGRESS, {
            id,
            progress: 0,
            title,
            thumbnail,
            duration,
        });

        // Create AbortController for cancellation
        const controller = new AbortController();
        activeDownloads.set(id, { controller });

        // Download with progress
        const subprocess = youtubedl.exec(url, {
            output: outputPath,
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            noCheckCertificates: true,
            noWarnings: true,
            mergeOutputFormat: 'mp4',
        });

        // Parse progress from stderr
        subprocess.stderr?.on('data', (chunk: Buffer) => {
            const line = chunk.toString();
            const match = line.match(/(\d+\.?\d*)%/);
            if (match) {
                const progress = parseFloat(match[1]);
                mainWindow?.webContents.send(IPC_CHANNELS.YOUTUBE_PROGRESS, {
                    id,
                    progress: Math.round(progress),
                    title,
                    thumbnail,
                });
            }
        });

        await subprocess;

        // Clean up
        activeDownloads.delete(id);

        // Notify completion
        mainWindow?.webContents.send(IPC_CHANNELS.YOUTUBE_COMPLETE, {
            id,
            filePath: outputPath,
        });

        return { success: true };
    } catch (error) {
        activeDownloads.delete(id);

        mainWindow?.webContents.send(IPC_CHANNELS.YOUTUBE_ERROR, {
            id,
            error: error instanceof Error ? error.message : 'Download failed',
        });

        return { success: false, error: String(error) };
    }
});

ipcMain.handle(IPC_CHANNELS.YOUTUBE_CANCEL, async (_, data: { id: string }) => {
    const download = activeDownloads.get(data.id);
    if (download) {
        download.controller.abort();
        activeDownloads.delete(data.id);
    }
    return { success: true };
});

// Helper function to format duration
function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// IPC Handler - AI Chat with Streaming (Local LLM)
ipcMain.handle(
    IPC_CHANNELS.AI_SEND_MESSAGE,
    async (_, data: { messages: Array<{ role: string; content: string }> }) => {
        // Default Ollama endpoint - can be made configurable via settings
        const endpoint = process.env.LLM_ENDPOINT || 'http://localhost:11434/api/chat';
        const model = process.env.LLM_MODEL || 'llama3.2';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    messages: data.messages,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`LLM request failed: ${response.status} ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body reader available');
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(Boolean);

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);
                        const content = json.message?.content || '';
                        if (content) {
                            mainWindow?.webContents.send(IPC_CHANNELS.AI_STREAM_CHUNK, content);
                        }
                    } catch {
                        // Skip invalid JSON lines
                    }
                }
            }

            mainWindow?.webContents.send(IPC_CHANNELS.AI_STREAM_END);
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            mainWindow?.webContents.send(IPC_CHANNELS.AI_ERROR, errorMessage);
            return { success: false, error: errorMessage };
        }
    }
);


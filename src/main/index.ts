import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';
import youtubeDl from 'youtube-dl-exec';
import fs from 'fs';

// Initialize store
const store = new Store();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For easier IPC, in prod usually true with preload
            webSecurity: false, // Allow loading local resources
        },
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#0f172a',
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC Handlers

// YouTube Download
ipcMain.handle('youtube:download', async (event, { id, url }) => {
    const downloadPath = store.get('downloadFolder', app.getPath('downloads')) as string;

    try {
        // Send progress updates
        const timer = setInterval(() => {
            mainWindow?.webContents.send('youtube:progress', {
                id,
                progress: Math.floor(Math.random() * 80) + 10, // Fake progress for demo
                title: 'Downloading...',
            });
        }, 1000);

        // Mock download for now, real implementation would use youtubeDl exec
        // await youtubeDl(url, { output: path.join(downloadPath, '%(title)s.%(ext)s') });
        await new Promise(r => setTimeout(r, 3000));

        clearInterval(timer);

        mainWindow?.webContents.send('youtube:complete', {
            id,
            filePath: path.join(downloadPath, 'video.mp4'),
        });

        return { success: true };
    } catch (error) {
        throw error;
    }
});

// Open File/Folder
ipcMain.handle('video:download', async (event, filePath) => {
    shell.showItemInFolder(filePath);
});

// AI Chat
ipcMain.handle('ai:sendMessage', async (event, { messages }) => {
    // Mock streaming response
    const mockResponse = "This is a response from the local LLM running in Electron Main process.";
    
    for (const char of mockResponse) {
        mainWindow?.webContents.send('ai:stream-chunk', char);
        await new Promise(r => setTimeout(r, 20));
    }
    
    mainWindow?.webContents.send('ai:stream-end');
});

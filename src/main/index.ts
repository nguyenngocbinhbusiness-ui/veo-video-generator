import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';

const store = new Store();
let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
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
ipcMain.handle('youtube:download', async (event, { id, url }) => {
    const downloadPath = store.get('downloadFolder', app.getPath('downloads')) as string;
    try {
        const timer = setInterval(() => {
            mainWindow?.webContents.send('youtube:progress', {
                id,
                progress: Math.floor(Math.random() * 80) + 10,
                title: 'Downloading...',
            });
        }, 1000);
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

ipcMain.handle('video:download', async (event, filePath) => {
    shell.showItemInFolder(filePath);
});

ipcMain.handle('ai:sendMessage', async (event, { messages }) => {
    const mockResponse = "This is a response from the local LLM.";
    for (const char of mockResponse) {
        mainWindow?.webContents.send('ai:stream-chunk', char);
        await new Promise(r => setTimeout(r, 20));
    }
    mainWindow?.webContents.send('ai:stream-end');
});

const path = require('path');
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false
    },
  });

  // Check if we're running from an AppImage (or a packaged app)
  const isPackaged = app.isPackaged;

  if (!isPackaged) {
    // In development
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production (AppImage or packaged app)
    win.loadFile(path.join(__dirname, '../build/index.html'));
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

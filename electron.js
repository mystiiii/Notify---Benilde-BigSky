const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "Notify - BigSky Automation",
    backgroundColor: '#f9fafb'
  });

  // In development, load from Vite dev server
  // In production, load from built files
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'react-frontend/dist/index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const isDev = !app.isPackaged;
  // In production, resources are unpacked to a specific location or kept in asar
  // We need to find the correct path to server.js
  let serverPath;

  if (isDev) {
    console.log('Development mode: Backend should be running via concurrently. Skipping spawn.');
    return;
  }

  // In built app, we configure extraResources to copy express-backend
  serverPath = path.join(process.resourcesPath, 'express-backend', 'server.js');

  // Ensure the storage directory exists
  const userDataPath = app.getPath('userData');
  const storagePath = path.join(userDataPath, 'state.json');

  console.log('Starting backend from:', serverPath);
  console.log('Storage path for backend:', storagePath);

  if (fs.existsSync(serverPath)) {
    backendProcess = fork(serverPath, [], {
      silent: false, // Let it print to console for now
      env: {
        ...process.env,
        PORT: 3000,
        STORAGE_PATH: storagePath
      }
    });
  } else {
    console.error('Backend server file not found at:', serverPath);
  }
}

app.on('ready', () => {
  startBackend();
  createWindow();

  // Set dock icon for macOS during development
  if (process.platform === 'darwin' && !app.isPackaged) {
    const iconPath = path.join(__dirname, 'assets/icon.png');
    if (fs.existsSync(iconPath)) {
      app.dock.setIcon(iconPath);
    }
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

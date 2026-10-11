/**
 * Electron main process.
 * Spawns the FastAPI backend, then opens the Vite-built frontend.
 */
const { app, BrowserWindow, shell } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

const isDev = !app.isPackaged

let mainWindow
let backendProcess

function startBackend() {
  const backendDir = isDev
    ? path.join(__dirname, '..', 'backend')
    : path.join(process.resourcesPath, 'backend')

  backendProcess = spawn('python3', ['main.py'], {
    cwd: backendDir,
    stdio: 'pipe',
  })

  backendProcess.stdout.on('data', (d) => console.log('[backend]', d.toString()))
  backendProcess.stderr.on('data', (d) => console.error('[backend]', d.toString()))
  backendProcess.on('exit', (code) => console.log('[backend] exited', code))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#05070f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    // Wait a moment for Vite dev server to be ready
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5173')
      mainWindow.webContents.openDevTools()
    }, 1500)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // Open external links in browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  startBackend()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill()
})

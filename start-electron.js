import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const VERCEL_URL = 'https://billing.nishantsoftwares.in'

function createWindow() {
  const win = new BrowserWindow({
    width: 430,
    height: 900,
    minWidth: 360,
    minHeight: 600,
    title: 'निशांत बिलिंग',
    icon: path.join(__dirname, 'public', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  })

  win.loadURL(VERCEL_URL)

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(VERCEL_URL)) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  win.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    if (url.startsWith('https://wa.me') || url.startsWith('https://api.whatsapp.com')) {
      shell.openExternal(url)
    } else if (url.startsWith(VERCEL_URL)) {
      win.loadURL(url)
    } else {
      shell.openExternal(url)
    }
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
const { app, BrowserWindow, protocol, net, Menu } = require('electron')
const path = require('path'), { pathToFileURL } = require('url')
// app:// = origin aman & tetap -> IndexedDB (data toko) persisten dan path absolut /_expo/... berfungsi.
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }])
if (!app.requestSingleInstanceLock()) app.quit()
const root = path.join(__dirname, 'web')
app.whenReady().then(() => {
  protocol.handle('app', req => {
    let p = decodeURIComponent(new URL(req.url).pathname)
    if (p === '/' || !path.extname(p)) p = '/index.html'
    const f = path.normalize(path.join(root, p))
    if (!f.startsWith(root)) return new Response('Forbidden', { status: 403 })
    return net.fetch(pathToFileURL(f).toString())
  })
  Menu.setApplicationMenu(null)
  const w = new BrowserWindow({ width: 1200, height: 800, minWidth: 380, minHeight: 600, backgroundColor: '#141F2B', title: 'TokoLokal', icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } })
  w.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  w.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) e.preventDefault() })
  w.loadURL('app://tokolokal/')
})
app.on('window-all-closed', () => app.quit())

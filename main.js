const { app, BrowserWindow } = require('electron')
require('electron-reload')(__dirname)

let win

function createWindow () {
  win = new BrowserWindow({ widget: 800, height: 600, nodeIntegration: false })
  win.loadFile('index.html')
  win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

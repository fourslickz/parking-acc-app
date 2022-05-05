const { app, BrowserWindow } = require('electron')

try{
  require('./printer-service.js');
} catch {
  console.log('error');
}


const createWindow = () => {
  // Create the browser window.
  const win = new BrowserWindow({
    backgroundColor: '#ffffff', 
    width: 1280,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadURL('https://parkingcloud.mitranetwork.id/')

  //
  win.setMenu(null)
  
  // Open the DevTools.
  win.webContents.openDevTools({mode: 'detach'})
}

app.whenReady().then(() => {
    createWindow()
});


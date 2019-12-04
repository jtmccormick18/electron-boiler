const { app, BrowserWindow, ipcMain } = require('electron');
const shapefile = require("shapefile");
const ArcGIS = require("terraformer-arcgis-parser");
const server = require('./app');

const fs = require('fs');

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow(
        {
            width: 1000,
            height: 750,
            'minHeight': 750,
            'minWidth': 1000,
            webPreferences: {
                nodeIntegration: true
            }
        }
    );

    mainWindow.loadURL('http://localhost:5000/');
    // mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, 'public', 'index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    //Shapefile upload
    ipcMain.on("upload-shp", (event, arg) => {
        const results = [];
        shapefile.open(arg)
            .then(source => source.read()
                .then(function log(result) {
                    if (result.done) {
                        win.webContents.send("load-shp", results);
                    }
                    else {
                        results.push(ArcGIS.convert(result.value));
                        return source.read().then(log);
                    }
                }))
            .catch(error => console.error(error.stack));
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

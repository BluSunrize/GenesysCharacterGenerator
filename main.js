// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, globalShortcut} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({minWidth: 1000, minHeight: 600, useContentSize: true});

    mainWindow.loadFile('index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    globalShortcut.register('CommandOrControl+Shift+I', () => {
        mainWindow.webContents.openDevTools();
    });

    ipcMain.on("goto_chargen", function (event, data) {
        switchToChargen(data);
    });
    ipcMain.on("goto_index", function (event, data) {
        mainWindow.loadFile('index.html');
    });
}

function switchToChargen(dataset) {
    mainWindow.loadFile('charactergen.html');
    ipcMain.on("init", function (event, data) {
        mainWindow.webContents.send("init", dataset);
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
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

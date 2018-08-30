// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');

// var arch_human = new Archetype("human", [2,2,2,2,2,2], 10, 10, 110, ["athletics", "ranged (light)"], ["Once per session as an out-ofturn incidental, a Human may move one Story Point from the Game Master's pool to the players' pool."]);
//
// dataset_default.set(arch_human.name, arch_human);


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the charactergen.html of the app.
    mainWindow.loadFile('charactergen.html');

    // console.log("path: "+app.getAppPath());
    // console.log(mainWindow.getTitle());
    // console.log("characters: "+characters);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
    mainWindow.onbeforeunload = function (e) {
        mainWindow.webContents.send('reload', 'THERE IS A PAGE RELOAD INCOMING');
        console.log("prepping reload");
        e.returnValue = false;
    };
}

ipcMain.on("test", function (event, data) {
    console.log("got a test message:");
    console.log("event: "+event);
    console.log("data: "+data);
});

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

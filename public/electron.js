const electron = require("electron");

const { app } = electron;
const { BrowserWindow } = electron;

const path = require("path");
const isDev = require("electron-is-dev");

const { connect: connectDB } = require("../src/database/database");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 900,
        height: 680,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    });
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});

//DATABASE MANAGEMENT

const { Moovie } = require("../src/database/models/moovies");
const { seedMoovies } = require("../src/database/seeders/mooves.seeder");
const { Op } = require("sequelize");

const forceSync = false;
const sync = async () => {
    await Moovie.sync({ force: forceSync });
    console.log("Models sync");
    //console.log("Seeding");
    //await seedMoovies();
    //console.log("Test moovies seeded");
};

connectDB();
sync();

//Load Conectors
require("../src/database/comunicators/profiles.main");
//Moovies Connector
require("../src/database/comunicators/moovies/moovies.main");
//Links Connector
require("../src/lib/communicators/links/links.main");

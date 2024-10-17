"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeScreenBlocker = exports.createScreenBlocker = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
let blockerWindowList = [];
function createScreenBlocker(screenType, duration) {
    console.log('createScreenBlocker', screenType, duration);
    const displays = electron_1.screen.getAllDisplays();
    console.log('displays', displays);
    blockerWindowList = displays.map(function (display) {
        const tempWindow = new electron_1.BrowserWindow({
            skipTaskbar: true,
            fullscreen: true,
            frame: false,
            alwaysOnTop: true,
            focusable: false,
            x: display.bounds.x,
            y: display.bounds.y,
            width: display.bounds.width,
            height: display.bounds.height,
            webPreferences: {
                preload: path_1.default.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });
        // 根据screenType加载不同的HTML文件
        if (screenType === 'windows-origin-blocker') {
            tempWindow.loadFile(path_1.default.join(__dirname, '../public/blockerscreens/windows-origin-blocker.html'));
        }
        else if (screenType === 'windows-3d-blocker') {
            tempWindow.loadFile(path_1.default.join(__dirname, '../public/blockerscreens/windows-3d-blocker.html'));
        }
        else {
            tempWindow.loadFile(path_1.default.join(__dirname, '../public/blockerscreens/windows-origin-blocker.html'));
        }
        return tempWindow;
    });
    console.log('blockerWindowList', blockerWindowList);
    // 更新 screen_block_settings 表
    (0, database_1.saveScreenBlockerStatus)(true, Date.now(), duration);
}
exports.createScreenBlocker = createScreenBlocker;
function closeScreenBlocker() {
    console.log('Closing screen blocker');
    if (blockerWindowList && blockerWindowList.length > 0) {
        blockerWindowList.forEach((window) => {
            if (!window.isDestroyed()) {
                window.close();
            }
        });
    }
    blockerWindowList = []; // 清空列表 
    // 更新 screen_block_settings 表
    (0, database_1.saveScreenBlockerStatus)(false, null, null);
}
exports.closeScreenBlocker = closeScreenBlocker;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeReminderWindow = exports.createReminderWindow = exports.triggerAlarm = exports.scheduleDailyAlarm = void 0;
const moment_1 = __importDefault(require("moment"));
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
function scheduleDailyAlarm(sender, time) {
    const now = (0, moment_1.default)();
    const nextAlarm = (0, moment_1.default)((0, moment_1.default)().format('YYYY-MM-DD') + ' ' + time);
    if (now.isAfter(nextAlarm)) {
        nextAlarm.add(1, 'day');
    }
    const delay = nextAlarm.diff(now);
    console.log('set alarm 2', time, delay);
    setTimeout(() => {
        triggerAlarm(sender);
        setInterval(() => triggerAlarm(sender), 24 * 60 * 60 * 1000); // 每24小时触发一次
    }, delay);
}
exports.scheduleDailyAlarm = scheduleDailyAlarm;
// 触发闹钟事件
function triggerAlarm(sender) {
    createReminderWindow('您设置的提醒时间到了');
}
exports.triggerAlarm = triggerAlarm;
// 工作提醒
let reminderWindow = null;
function createReminderWindow(message) {
    console.log('createReminderWindow', message);
    reminderWindow = new electron_1.BrowserWindow({
        width: 340,
        height: 380,
        show: false,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js')
        },
        icon: path_1.default.join(__dirname, '../public/icon.png')
    });
    // 加载 workdiary.html 文件
    reminderWindow.loadFile(path_1.default.join(__dirname, '../public/workdiary_reminder.html'));
    // 传递提醒消息到渲染进程
    reminderWindow.webContents.once('did-finish-load', () => {
        reminderWindow?.webContents.send('set-reminder-message', message);
    });
    reminderWindow.once('ready-to-show', () => {
        reminderWindow?.show();
    });
}
exports.createReminderWindow = createReminderWindow;
function closeReminderWindow() {
    reminderWindow?.close();
    reminderWindow = null;
}
exports.closeReminderWindow = closeReminderWindow;

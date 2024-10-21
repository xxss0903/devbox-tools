"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIPCHandle = void 0;
const screenBlockerHandle_1 = require("./screenBlockerHandle");
const workDiaryHandle_1 = require("./workDiaryHandle");
const clipboardManagerHandle_1 = require("./clipboardManagerHandle");
const openExeHandle_1 = require("./openExeHandle");
function setupIPCHandle(win) {
    // 打开exe的接口工具
    (0, openExeHandle_1.setupOpenExeHandle)(win);
    // 屏幕遮挡
    (0, screenBlockerHandle_1.setupScreenBlockerHandle)(win);
    // 工作日记
    (0, workDiaryHandle_1.setupWorkDiaryHandle)(win);
    // 剪切板管理
    (0, clipboardManagerHandle_1.setupClipboardManagerHandle)(win);
}
exports.setupIPCHandle = setupIPCHandle;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupOpenExeHandle = void 0;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// 打开exe的接口工具，比如打开PDF工具
function setupOpenExeHandle(win) {
    // 打开pdf的接口工具
    electron_1.ipcMain.handle('open-pdfbox-app', async (_, filePath) => {
        const javaPath = path_1.default.join(electron_1.app.getAppPath(), 'public', 'jdk-17.0.12', 'bin', 'java');
        const pdfBoxPath = path_1.default.join(electron_1.app.getAppPath(), 'public', 'pdfbox-app.jar');
        const command = `${javaPath} -jar "${pdfBoxPath}" debug "${filePath}"`;
        // const pdfBoxPath = path.join(app.getAppPath(), 'public', 'pdfbox-app.jar')
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
    // 打开url
    electron_1.ipcMain.handle('open-url', async (event, text) => {
        electron_1.shell.openExternal(text);
    });
    // 执行命令
    electron_1.ipcMain.handle('execute-command', async (_, command) => {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
    // adb 执行命令
    electron_1.ipcMain.handle('execute-adb', async (event, command) => {
        // ADB 执行逻辑
    });
    // 选择文件夹
    electron_1.ipcMain.handle('select-folder', async () => {
        const result = await electron_1.dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (result.canceled) {
            return null;
        }
        const files = await promises_1.default.readdir(result.filePaths[0]);
        const imageFiles = await Promise.all(files
            .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
            .map(async (file) => {
            const filePath = path_1.default.join(result.filePaths[0], file);
            const stats = await promises_1.default.stat(filePath);
            const fileContent = await promises_1.default.readFile(filePath, { encoding: 'base64' });
            return {
                name: file,
                size: stats.size,
                data: `data:image/${path_1.default.extname(file).slice(1)};base64,${fileContent}`
            };
        }));
        return imageFiles;
    });
    // 处理拖拽的文件
    electron_1.ipcMain.handle('process-dropped-files', async (event, filePaths) => {
        const imageFiles = await Promise.all(filePaths
            .filter((filePath) => /\.(jpg|jpeg|png)$/i.test(filePath))
            .map(async (filePath) => {
            const stats = await promises_1.default.stat(filePath);
            const fileContent = await promises_1.default.readFile(filePath, { encoding: 'base64' });
            return {
                name: path_1.default.basename(filePath),
                size: stats.size,
                data: `data:image/${path_1.default.extname(filePath).slice(1)};base64,${fileContent}`
            };
        }));
        return imageFiles;
    });
    // 选择文件
    electron_1.ipcMain.handle('get-file-path', async (event, options) => {
        const result = await electron_1.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });
        if (result.canceled) {
            return null;
        }
        else {
            return result.filePaths[0];
        }
    });
    // 截图
    electron_1.ipcMain.handle('TAKE_SCREENSHOT', async () => {
        const sources = await electron_1.desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });
        return sources[0].thumbnail.toDataURL();
    });
}
exports.setupOpenExeHandle = setupOpenExeHandle;

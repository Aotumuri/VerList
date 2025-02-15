const { app, BrowserWindow, ipcMain, clipboard, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('generate-patchnote', (event, data) => {
    const { version, additions, changes, fixes } = data;
    let patchNote = `# **${version}**\n\n## 追加\n`;

    ["アイテム", "ブロック", "モブ", "状態", "実績", "ゲーム性", "その他"].forEach(category => {
        const items = additions[category] || [];
        patchNote += `> **>>${category}** (${items.length})\n`;
        items.forEach(item => patchNote += `> ‣${item}を追加しました\n`);
        patchNote += `> \n`;
    });

    patchNote += `## 変更\n`;
    ["アイテム", "ブロック", "モブ", "状態", "実績", "ゲーム性", "その他"].forEach(category => {
        const items = changes[category] || [];
        patchNote += `> **>>${category}** (${items.length})\n`;
        items.forEach(item => patchNote += `> ‣${item}\n`);
        patchNote += `> \n`;
    });

    patchNote += `## 修正\n`;
    ["アイテム", "ブロック", "モブ", "状態", "実績", "ゲーム性", "その他"].forEach(category => {
        const items = fixes[category] || [];
        patchNote += `> **>>${category}** (${items.length})\n`;
        items.forEach(item => patchNote += `> ‣${item}\n`);
        patchNote += `> \n`;
    });

    event.reply('patchnote-generated', patchNote);
});


ipcMain.on('copy-to-clipboard', (event, text) => {
    clipboard.writeText(text);
});

ipcMain.on('save-to-file', (event, text) => {
    const filePath = path.join(__dirname, 'patchnote.txt');
    fs.writeFileSync(filePath, text);
});

ipcMain.on('load-from-file', (event) => {
    const filePath = path.join(__dirname, 'patchnote.txt');

    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        event.reply('file-loaded', content);
    } else {
        event.reply('file-load-error', "patchnote.txt が見つかりません。");
    }
});

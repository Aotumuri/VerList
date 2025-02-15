const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    generatePatchnote: (data) => ipcRenderer.send('generate-patchnote', data),
    onPatchnoteGenerated: (callback) => ipcRenderer.on('patchnote-generated', (event, text) => callback(text)),
    copyToClipboard: (text) => ipcRenderer.send('copy-to-clipboard', text),
    saveToFile: (text) => ipcRenderer.send('save-to-file', text),
    loadFromFile: () => ipcRenderer.send('load-from-file'),
    onFileLoaded: (callback) => ipcRenderer.on('file-loaded', (event, content) => callback(content)),
    onFileLoadError: (callback) => ipcRenderer.on('file-load-error', (event, message) => callback(message))
});

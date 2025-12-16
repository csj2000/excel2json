// Preload script (如果需要的话)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectExcelFiles: () => ipcRenderer.invoke('select-excel-files'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveJsonFile: (defaultName) => ipcRenderer.invoke('save-json-file', defaultName),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
});


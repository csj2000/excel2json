const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 开发环境加载 Vite 开发服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC 处理程序：选择 Excel 文件
ipcMain.handle('select-excel-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Excel 文件', extensions: ['xlsx'] }
    ]
  });
  
  if (result.canceled) {
    return { canceled: true, filePaths: [] };
  }
  
  return { canceled: false, filePaths: result.filePaths };
});

// IPC 处理程序：读取文件内容
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    // 返回 ArrayBuffer
    return { success: true, data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC 处理程序：保存 JSON 文件
ipcMain.handle('save-json-file', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'output.json',
    filters: [
      { name: 'JSON 文件', extensions: ['json'] }
    ]
  });
  
  if (result.canceled) {
    return { canceled: true };
  }
  
  return { canceled: false, filePath: result.filePath };
});

// IPC 处理程序：写入文件
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});


import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    // 确保 Electron 主进程可以正确解析模块
    browserField: false,
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext']
  }
});


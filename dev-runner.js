const { spawn } = require('child_process');
const { createServer } = require('vite');

async function startDev() {
  // 设置环境变量
  process.env.NODE_ENV = 'development';

  // 启动 Vite 开发服务器
  const server = await createServer({
    configFile: './vite.config.ts',
    server: {
      port: 5173
    }
  });

  await server.listen();
  
  console.log('Vite 开发服务器已启动在 http://localhost:5173');

  // 等待服务器就绪后启动 Electron
  setTimeout(() => {
    console.log('启动 Electron...');
    const electronProcess = spawn('electron', ['.'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    electronProcess.on('close', () => {
      server.close();
      process.exit();
    });
  }, 2000);
}

startDev().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});


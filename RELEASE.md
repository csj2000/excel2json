# 发布说明

## 如何发布新版本

### 方法 1：通过 Git 标签触发（推荐）

1. **提交所有代码**
   ```bash
   git add .
   git commit -m "Release v1.0.0"
   ```

2. **创建版本标签**
   ```bash
   git tag v1.0.0
   ```

3. **推送到 GitHub**
   ```bash
   git push origin main
   git push origin v1.0.0
   ```

4. **GitHub Actions 自动构建**
   - 自动构建 Windows、macOS、Linux 版本
   - 自动创建 GitHub Release
   - 自动上传所有安装包

### 方法 2：手动触发

1. 访问 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择 `Build and Release` 工作流
4. 点击 `Run workflow` 按钮
5. 选择分支并运行

## 构建产物

构建完成后，您会得到：

### Windows
- `Excel转JSON工具 Setup 1.0.0.exe` - NSIS 安装程序（~154MB）

### macOS
- `Excel转JSON工具-1.0.0.dmg` - 磁盘镜像安装包
- `Excel转JSON工具-1.0.0-mac.zip` - 便携版压缩包
- 支持 Intel (x64) 和 Apple Silicon (arm64) 两种架构

### Linux
- `Excel转JSON工具-1.0.0.AppImage` - 通用便携版
- `excel-to-json-tool_1.0.0_amd64.deb` - Debian/Ubuntu 包
- `excel-to-json-tool-1.0.0.x86_64.rpm` - RedHat/Fedora 包

## 版本号规范

使用语义化版本：`v主版本.次版本.修订号`

- **主版本**：不兼容的 API 修改
- **次版本**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

示例：
- `v1.0.0` - 首次发布
- `v1.1.0` - 新增功能
- `v1.1.1` - 修复 bug

## 下载构建产物

### 查看 Artifacts（每次构建）
1. 进入 GitHub Actions
2. 点击最近的构建
3. 下载 `windows-installer`、`macos-installer`、`linux-installer`
4. 构建产物保留 7 天

### 查看 Releases（标签构建）
1. 进入 GitHub Releases 页面
2. 所有版本的安装包都在这里
3. 永久保存

## 注意事项

1. **macOS 签名**
   - 当前配置跳过了代码签名
   - 用户需要右键打开应用（首次运行）
   - 如需正式签名，需要 Apple 开发者账号

2. **构建时间**
   - Windows: ~5-8 分钟
   - macOS: ~8-12 分钟
   - Linux: ~5-8 分钟
   - 总计: ~20-30 分钟

3. **构建限制**
   - GitHub Actions 免费账户：每月 2000 分钟
   - 足够构建多次发布

## 首次设置

1. **创建 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/excel-to-json-tool.git
   git push -u origin main
   ```

2. **启用 GitHub Actions**
   - GitHub Actions 默认启用
   - 无需额外配置

3. **测试构建**
   - 推送一个测试标签
   - 等待构建完成
   - 检查产物是否正确

## 问题排查

如果构建失败，查看 Actions 日志：
1. 进入 GitHub Actions
2. 点击失败的构建
3. 查看具体错误信息
4. 常见问题：
   - 依赖安装失败 → 检查 package.json
   - 构建失败 → 检查 TypeScript 错误
   - 打包失败 → 检查 electron-builder 配置


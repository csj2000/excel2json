# 📊 Excel 转 JSON 工具

一个功能强大的桌面应用程序，用于将 Excel 文件(.xlsx)转换为多种 JSON 格式。

## ✨ 功能特性

- 🗂️ **多工作表支持** - 可选择一个或多个工作表进行转换
- 👀 **数据预览** - 转换前实时预览 Excel 数据
- 📦 **批量转换** - 一次性处理多个 Excel 文件
- 🎨 **多种 JSON 格式**
  - 对象数组：`[{"name": "张三", "age": 20}, ...]`
  - 二维数组：`[["name", "age"], ["张三", 20], ...]`
  - 键值对象：`{"1": {"name": "张三"}, "2": {...}}`
  - 分组对象：按指定列分组输出
- 🔄 **智能类型转换** - 自动识别数字、布尔值等数据类型
- 🎯 **拖拽上传** - 支持拖拽文件到窗口
- 🖥️ **现代化界面** - 简洁美观的用户界面

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run electron:dev
```

这将同时启动 Vite 开发服务器和 Electron 应用。

### 构建生产版本

```bash
npm run build
npm run dist
```

打包后的可执行文件将生成在 `dist` 目录中。

## 📖 使用说明

1. **选择文件**
   - 点击"选择文件"按钮，或直接拖拽 .xlsx 文件到窗口
   - 支持一次选择多个文件

2. **选择工作表**
   - 文件加载后，左侧会显示所有工作表列表
   - 勾选需要转换的工作表（支持多选）

3. **预览数据**
   - 右侧会显示选中工作表的数据预览
   - 默认显示前 50 行

4. **选择 JSON 格式**
   - 在右侧选择需要的 JSON 输出格式
   - 如果选择"分组对象"格式，需要指定分组列
   - 可选择是否启用智能类型转换

5. **转换导出**
   - 点击"转换当前文件"导出单个文件
   - 点击"批量转换所有文件"处理所有已加载的文件
   - 选择保存位置，完成导出

## 🛠️ 技术栈

- **框架**: Electron 28.x
- **前端**: React 18.x + TypeScript
- **构建工具**: Vite 5.x
- **Excel 解析**: xlsx (SheetJS)
- **打包工具**: electron-builder

## 📁 项目结构

```
entropy-tools/
├── electron/              # Electron 主进程
│   ├── main.js           # 主进程入口
│   └── preload.js        # 预加载脚本
├── src/                  # React 应用源码
│   ├── components/       # UI 组件
│   │   ├── FileUploader.tsx
│   │   ├── SheetSelector.tsx
│   │   ├── DataPreview.tsx
│   │   ├── FormatSelector.tsx
│   │   └── BatchProcessor.tsx
│   ├── utils/           # 工具函数
│   │   ├── excelParser.ts
│   │   └── jsonConverter.ts
│   ├── styles/          # 样式文件
│   │   └── app.css
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # React 入口
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔧 开发说明

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（带热重载）
npm run electron:dev

# 构建前端
npm run build

# 仅运行 Electron
npm run electron

# 打包为可执行程序
npm run dist

# 打包但不安装（用于测试）
npm run pack
```

### 打包配置

打包配置在 `package.json` 的 `build` 字段中：

- Windows: 生成 NSIS 安装包 (.exe)
- 输出目录: `dist/`
- 可自定义应用图标（放置在 `build/icon.ico`）

## ⚠️ 注意事项

- 目前仅支持 .xlsx 格式（不支持旧版 .xls 格式）
- 大型 Excel 文件可能需要较长处理时间
- 数据预览默认显示前 50 行
- 批量转换时，JSON 文件会保存到与源文件相同的目录

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 💡 常见问题

**Q: 为什么不支持 .xls 格式？**  
A: .xls 是旧版 Excel 格式，建议使用 Excel 将其另存为 .xlsx 格式后再使用本工具。

**Q: 可以处理多大的 Excel 文件？**  
A: 理论上没有大小限制，但建议单个文件不超过 10MB，以保证流畅的用户体验。

**Q: 智能类型转换是什么？**  
A: 开启后，工具会自动将看起来像数字的文本转换为数字类型，将 "true"/"false" 转换为布尔值，便于后续数据处理。

**Q: 如何自定义应用图标？**  
A: 将 icon.ico 文件放置在 `build/` 目录中，然后重新打包即可。


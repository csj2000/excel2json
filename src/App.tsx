import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import FileUploader from './components/FileUploader';
import SheetSelector from './components/SheetSelector';
import DataPreview from './components/DataPreview';
import FormatSelector from './components/FormatSelector';
import BatchProcessor, { FileProcessStatus } from './components/BatchProcessor';
import HeaderMapper from './components/HeaderMapper';
import { 
  parseExcelFile, 
  extractSheetData, 
  SheetInfo, 
  ParsedSheet 
} from './utils/excelParser';
import { 
  convertToJson, 
  formatJson, 
  JsonFormat,
  convertMultipleSheets 
} from './utils/jsonConverter';
import './styles/app.css';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileProcessStatus[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [previewSheet, setPreviewSheet] = useState<ParsedSheet | null>(null);
  
  // JSON 格式选项
  const [jsonFormat, setJsonFormat] = useState<JsonFormat>('array-of-objects');
  const [useTypeConversion, setUseTypeConversion] = useState(true);
  const [groupByColumn, setGroupByColumn] = useState<string>('');
  const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
  
  const [isProcessing, setIsProcessing] = useState(false);

  // 处理文件选择
  const handleFilesSelected = async (filePaths: string[]) => {
    const newFiles: FileProcessStatus[] = filePaths.map(path => ({
      filePath: path,
      fileName: path.split(/[/\\]/).pop() || path,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // 如果是第一个文件，自动加载
    if (!currentFile && newFiles.length > 0) {
      await loadFile(newFiles[0].filePath);
    }
  };

  // 加载 Excel 文件
  const loadFile = async (filePath: string) => {
    try {
      setIsProcessing(true);
      const { ipcRenderer } = window.require('electron');
      
      // 读取文件
      const result = await ipcRenderer.invoke('read-file', filePath);
      if (!result.success) {
        throw new Error(result.error);
      }

      // 解析 Excel
      const { workbook: wb, sheets: sheetList } = await parseExcelFile(result.data);
      
      setCurrentFile(filePath);
      setWorkbook(wb);
      setSheets(sheetList);
      
      // 默认选择第一个工作表
      if (sheetList.length > 0) {
        setSelectedSheets([sheetList[0].name]);
        
        // 加载预览
        const preview = extractSheetData(wb, sheetList[0].name);
        setPreviewSheet(preview);
        
        // 设置可用的列（用于分组）
        if (preview.headers.length > 0) {
          setGroupByColumn(preview.headers[0]);
        }
      }

      // 更新文件状态
      setFiles(prev => prev.map(f => 
        f.filePath === filePath 
          ? { ...f, status: 'completed' } 
          : f
      ));
    } catch (error) {
      console.error('加载文件失败:', error);
      alert(`加载文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
      
      setFiles(prev => prev.map(f => 
        f.filePath === filePath 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : '未知错误' } 
          : f
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  // 工作表选择变化时更新预览
  useEffect(() => {
    if (workbook && selectedSheets.length > 0) {
      const preview = extractSheetData(workbook, selectedSheets[0]);
      setPreviewSheet(preview);
    }
  }, [selectedSheets, workbook]);

  // 转换并导出
  const handleConvert = async () => {
    if (!workbook || selectedSheets.length === 0) {
      alert('请先选择要转换的工作表');
      return;
    }

    if (jsonFormat === 'grouped' && !groupByColumn) {
      alert('分组格式需要选择分组列');
      return;
    }

    try {
      setIsProcessing(true);

      // 提取所有选中的工作表数据
      const parsedSheets = selectedSheets.map(sheetName => 
        extractSheetData(workbook, sheetName)
      );

      let jsonData: any;
      let defaultFileName = 'output.json';

      if (selectedSheets.length === 1) {
        // 单个工作表
        jsonData = convertToJson(parsedSheets[0], {
          format: jsonFormat,
          useTypeConversion,
          groupByColumn: jsonFormat === 'grouped' ? groupByColumn : undefined,
          skipEmptyRows: true,
          startRow: 1,
          headerMapping,
        });
        defaultFileName = `${parsedSheets[0].name}.json`;
      } else {
        // 多个工作表
        const sheetsData = convertMultipleSheets(parsedSheets, {
          format: jsonFormat,
          useTypeConversion,
          groupByColumn: jsonFormat === 'grouped' ? groupByColumn : undefined,
          skipEmptyRows: true,
          startRow: 1,
          headerMapping,
        });
        jsonData = sheetsData;
        defaultFileName = 'multiple-sheets.json';
      }

      // 格式化 JSON
      const jsonString = formatJson(jsonData, true);

      // 保存文件
      const { ipcRenderer } = window.require('electron');
      const saveResult = await ipcRenderer.invoke('save-json-file', defaultFileName);
      
      if (!saveResult.canceled && saveResult.filePath) {
        const writeResult = await ipcRenderer.invoke('write-file', saveResult.filePath, jsonString);
        
        if (writeResult.success) {
          alert('导出成功！');
        } else {
          throw new Error(writeResult.error);
        }
      }
    } catch (error) {
      console.error('转换失败:', error);
      alert(`转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 批量转换所有文件
  const handleBatchConvert = async () => {
    if (files.length === 0) {
      alert('请先选择文件');
      return;
    }

    if (jsonFormat === 'grouped' && !groupByColumn) {
      alert('分组格式需要选择分组列');
      return;
    }

    try {
      setIsProcessing(true);

      for (const file of files) {
        if (file.status === 'completed' || file.status === 'error') {
          continue;
        }

        try {
          // 更新状态为处理中
          setFiles(prev => prev.map(f => 
            f.filePath === file.filePath 
              ? { ...f, status: 'processing' } 
              : f
          ));

          const { ipcRenderer } = window.require('electron');
          
          // 读取文件
          const result = await ipcRenderer.invoke('read-file', file.filePath);
          if (!result.success) {
            throw new Error(result.error);
          }

          // 解析 Excel
          const { workbook: wb, sheets: sheetList } = await parseExcelFile(result.data);
          
          // 提取所有工作表
          const parsedSheets = sheetList.map(sheet => extractSheetData(wb, sheet.name));
          
          // 转换
          const sheetsData = convertMultipleSheets(parsedSheets, {
            format: jsonFormat,
            useTypeConversion,
            groupByColumn: jsonFormat === 'grouped' ? groupByColumn : undefined,
            skipEmptyRows: true,
            startRow: 1,
            headerMapping,
          });

          // 保存文件（自动命名）
          const outputPath = file.filePath.replace(/\.xlsx$/i, '.json');
          const jsonString = formatJson(sheetsData, true);
          const writeResult = await ipcRenderer.invoke('write-file', outputPath, jsonString);
          
          if (!writeResult.success) {
            throw new Error(writeResult.error);
          }

          // 更新状态为完成
          setFiles(prev => prev.map(f => 
            f.filePath === file.filePath 
              ? { ...f, status: 'completed' } 
              : f
          ));
        } catch (error) {
          // 更新状态为错误
          setFiles(prev => prev.map(f => 
            f.filePath === file.filePath 
              ? { ...f, status: 'error', error: error instanceof Error ? error.message : '未知错误' } 
              : f
          ));
        }
      }

      alert('批量转换完成！');
    } catch (error) {
      console.error('批量转换失败:', error);
      alert(`批量转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (filePath: string) => {
    setFiles(prev => prev.filter(f => f.filePath !== filePath));
    if (currentFile === filePath) {
      setCurrentFile(null);
      setWorkbook(null);
      setSheets([]);
      setSelectedSheets([]);
      setPreviewSheet(null);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setCurrentFile(null);
    setWorkbook(null);
    setSheets([]);
    setSelectedSheets([]);
    setPreviewSheet(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 Excel 转 JSON 工具</h1>
        <p>支持多工作表、数据预览、批量转换</p>
      </header>

      <main className="app-main">
        <div className="left-panel">
          <FileUploader 
            onFilesSelected={handleFilesSelected}
            disabled={isProcessing}
          />

          <BatchProcessor
            files={files}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
          />

          {sheets.length > 0 && (
            <SheetSelector
              sheets={sheets}
              selectedSheets={selectedSheets}
              onSelectionChange={setSelectedSheets}
            />
          )}
        </div>

        <div className="right-panel">
          {previewSheet && (
            <>
              <DataPreview sheet={previewSheet} maxRows={50} />
              
              <HeaderMapper
                originalHeaders={previewSheet.headers}
                onMappingChange={setHeaderMapping}
                initialMapping={headerMapping}
              />
            </>
          )}

          <FormatSelector
            selectedFormat={jsonFormat}
            onFormatChange={setJsonFormat}
            groupByColumn={groupByColumn}
            onGroupByColumnChange={setGroupByColumn}
            availableColumns={previewSheet?.headers || []}
            useTypeConversion={useTypeConversion}
            onTypeConversionChange={setUseTypeConversion}
          />

          <div className="action-buttons">
            <button 
              onClick={handleConvert}
              disabled={isProcessing || !workbook || selectedSheets.length === 0}
              className="primary-button large"
            >
              {isProcessing ? '处理中...' : '转换当前文件'}
            </button>
            
            {files.length > 1 && (
              <button 
                onClick={handleBatchConvert}
                disabled={isProcessing}
                className="secondary-button large"
              >
                批量转换所有文件
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;


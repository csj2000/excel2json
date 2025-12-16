import React, { useCallback } from 'react';

interface FileUploaderProps {
  onFilesSelected: (files: string[]) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, disabled }) => {
  const handleSelectFiles = async () => {
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('select-excel-files');
      
      if (!result.canceled && result.filePaths.length > 0) {
        onFilesSelected(result.filePaths);
      }
    } catch (error) {
      console.error('选择文件失败:', error);
      alert('选择文件失败，请重试');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const xlsxFiles = files.filter(file => file.name.endsWith('.xlsx'));

    if (xlsxFiles.length > 0) {
      const filePaths = xlsxFiles.map(file => file.path);
      onFilesSelected(filePaths);
    } else {
      alert('请拖放 .xlsx 文件');
    }
  }, [onFilesSelected, disabled]);

  return (
    <div 
      className="file-uploader"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="upload-icon">📁</div>
      <h3>选择 Excel 文件</h3>
      <p>支持 .xlsx 格式，可多选</p>
      <button 
        onClick={handleSelectFiles}
        disabled={disabled}
        className="primary-button"
      >
        选择文件
      </button>
      <p className="hint">或将文件拖放到这里</p>
    </div>
  );
};

export default FileUploader;


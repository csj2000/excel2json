import React from 'react';

export interface FileProcessStatus {
  filePath: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface BatchProcessorProps {
  files: FileProcessStatus[];
  onRemoveFile: (filePath: string) => void;
  onClearAll: () => void;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({ 
  files, 
  onRemoveFile,
  onClearAll 
}) => {
  if (files.length === 0) {
    return null;
  }

  const getStatusIcon = (status: FileProcessStatus['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '';
    }
  };

  const getStatusText = (status: FileProcessStatus['status']) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'error':
        return '失败';
      default:
        return '';
    }
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="batch-processor">
      <div className="batch-header">
        <h3>文件列表 ({files.length})</h3>
        <div className="batch-stats">
          {completedCount > 0 && <span className="stat-success">✓ {completedCount}</span>}
          {errorCount > 0 && <span className="stat-error">✗ {errorCount}</span>}
        </div>
        <button onClick={onClearAll} className="text-button">清空</button>
      </div>
      <div className="file-list">
        {files.map((file) => (
          <div key={file.filePath} className={`file-item status-${file.status}`}>
            <span className="status-icon">{getStatusIcon(file.status)}</span>
            <div className="file-info">
              <div className="file-name">{file.fileName}</div>
              <div className="file-status">
                {getStatusText(file.status)}
                {file.error && <span className="error-msg">: {file.error}</span>}
              </div>
            </div>
            <button 
              onClick={() => onRemoveFile(file.filePath)}
              className="remove-button"
              title="移除"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchProcessor;


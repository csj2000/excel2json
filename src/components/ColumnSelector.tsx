import React, { useState, useEffect } from 'react';

interface ColumnSelectorProps {
  availableColumns: string[];
  selectedColumns: string[];
  onSelectionChange: (selected: string[]) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  availableColumns,
  selectedColumns,
  onSelectionChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 初始化：默认选中所有列
  useEffect(() => {
    if (availableColumns.length > 0 && selectedColumns.length === 0) {
      onSelectionChange(availableColumns);
    }
  }, [availableColumns]);

  const handleToggle = (column: string) => {
    if (selectedColumns.includes(column)) {
      onSelectionChange(selectedColumns.filter(col => col !== column));
    } else {
      onSelectionChange([...selectedColumns, column]);
    }
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === availableColumns.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(availableColumns);
    }
  };

  const handleInvertSelection = () => {
    const inverted = availableColumns.filter(col => !selectedColumns.includes(col));
    onSelectionChange(inverted);
  };

  if (availableColumns.length === 0) {
    return null;
  }

  const allSelected = selectedColumns.length === availableColumns.length;
  const noneSelected = selectedColumns.length === 0;

  return (
    <div className="column-selector">
      <div className="column-selector-header">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-button"
        >
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="selector-title">
            选择导出列 
            {!allSelected && (
              <span className="selection-badge">
                已选 {selectedColumns.length}/{availableColumns.length}
              </span>
            )}
          </span>
        </button>
        {isExpanded && (
          <div className="column-actions">
            <button onClick={handleSelectAll} className="text-button small">
              {allSelected ? '取消全选' : '全选'}
            </button>
            <button onClick={handleInvertSelection} className="text-button small">
              反选
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="column-selector-content">
          {noneSelected && (
            <p className="column-hint warning">
              ⚠️ 至少选择一列才能导出
            </p>
          )}
          <div className="column-list">
            {availableColumns.map((column, index) => {
              const isSelected = selectedColumns.includes(column);
              return (
                <label key={index} className={`column-item ${isSelected ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(column)}
                  />
                  <div className="column-info">
                    <span className="column-name">{column}</span>
                    <span className="column-index">列 {index + 1}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;


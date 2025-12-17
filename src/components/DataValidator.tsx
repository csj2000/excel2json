import React, { useState, useMemo } from 'react';
import { ParsedSheet } from '../utils/excelParser';

interface DataValidatorProps {
  sheet: ParsedSheet;
}

interface DuplicateInfo {
  value: string;
  count: number;
  rows: number[];
}

interface ValidationResult {
  column: string;
  totalRows: number;
  uniqueCount: number;
  duplicateCount: number;
  emptyCount: number;
  duplicates: DuplicateInfo[];
}

const DataValidator: React.FC<DataValidatorProps> = ({ sheet }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  // 检查选中列的数据
  const validationResult = useMemo<ValidationResult | null>(() => {
    if (!selectedColumn || !sheet || sheet.data.length <= 1) {
      return null;
    }

    const columnIndex = sheet.headers.indexOf(selectedColumn);
    if (columnIndex === -1) {
      return null;
    }

    const dataRows = sheet.data.slice(1); // 跳过表头
    const valueMap = new Map<string, number[]>();
    let emptyCount = 0;

    // 统计每个值出现的次数和行号
    dataRows.forEach((row, index) => {
      const value = row[columnIndex];
      const stringValue = value !== null && value !== undefined ? String(value).trim() : '';
      
      if (stringValue === '') {
        emptyCount++;
      } else {
        const rows = valueMap.get(stringValue) || [];
        rows.push(index + 2); // +2 因为从第2行开始（Excel行号）
        valueMap.set(stringValue, rows);
      }
    });

    // 找出重复的值
    const duplicates: DuplicateInfo[] = [];
    valueMap.forEach((rows, value) => {
      if (rows.length > 1) {
        duplicates.push({
          value,
          count: rows.length,
          rows
        });
      }
    });

    // 按重复次数降序排序
    duplicates.sort((a, b) => b.count - a.count);

    return {
      column: selectedColumn,
      totalRows: dataRows.length,
      uniqueCount: valueMap.size,
      duplicateCount: duplicates.reduce((sum, d) => sum + d.count, 0),
      emptyCount,
      duplicates
    };
  }, [sheet, selectedColumn]);

  if (!sheet || sheet.headers.length === 0) {
    return null;
  }

  const hasDuplicates = validationResult && validationResult.duplicates.length > 0;
  const hasEmpty = validationResult && validationResult.emptyCount > 0;

  return (
    <div className="data-validator">
      <div className="validator-header">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-button"
        >
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="validator-title">
            数据检查
            {validationResult && (hasDuplicates || hasEmpty) && (
              <span className="warning-badge">发现问题</span>
            )}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="validator-content">
          <p className="validator-hint">
            🔍 选择列进行数据质量检查（去重、空值等）
          </p>

          <div className="column-select-row">
            <label>检查列：</label>
            <select 
              value={selectedColumn} 
              onChange={(e) => {
                setSelectedColumn(e.target.value);
                setShowDetails(false);
              }}
              className="column-select"
            >
              <option value="">请选择列</option>
              {sheet.headers.map((header, idx) => (
                <option key={idx} value={header}>{header}</option>
              ))}
            </select>
          </div>

          {validationResult && (
            <div className="validation-results">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">总行数</span>
                  <span className="stat-value">{validationResult.totalRows}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">唯一值</span>
                  <span className="stat-value unique">{validationResult.uniqueCount}</span>
                </div>
                <div className={`stat-item ${validationResult.duplicateCount > 0 ? 'warning' : ''}`}>
                  <span className="stat-label">重复值</span>
                  <span className="stat-value">{validationResult.duplicateCount}</span>
                </div>
                <div className={`stat-item ${validationResult.emptyCount > 0 ? 'warning' : ''}`}>
                  <span className="stat-label">空值</span>
                  <span className="stat-value">{validationResult.emptyCount}</span>
                </div>
              </div>

              {validationResult.duplicates.length > 0 && (
                <div className="duplicate-section">
                  <div className="section-header">
                    <h4>⚠️ 发现 {validationResult.duplicates.length} 个重复值</h4>
                    <button 
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-button small"
                    >
                      {showDetails ? '收起详情' : '查看详情'}
                    </button>
                  </div>

                  {showDetails && (
                    <div className="duplicate-list">
                      {validationResult.duplicates.map((dup, idx) => (
                        <div key={idx} className="duplicate-item">
                          <div className="duplicate-header">
                            <span className="duplicate-value">"{dup.value}"</span>
                            <span className="duplicate-count">重复 {dup.count} 次</span>
                          </div>
                          <div className="duplicate-rows">
                            出现在行: {dup.rows.slice(0, 10).join(', ')}
                            {dup.rows.length > 10 && ` ... 等 ${dup.rows.length} 行`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {validationResult.duplicates.length === 0 && validationResult.emptyCount === 0 && (
                <div className="success-message">
                  ✅ 该列数据质量良好，无重复值和空值
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataValidator;


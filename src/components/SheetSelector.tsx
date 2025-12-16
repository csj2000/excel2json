import React from 'react';
import { SheetInfo } from '../utils/excelParser';

interface SheetSelectorProps {
  sheets: SheetInfo[];
  selectedSheet: string;
  onSelectionChange: (selected: string) => void;
}

const SheetSelector: React.FC<SheetSelectorProps> = ({ 
  sheets, 
  selectedSheet, 
  onSelectionChange 
}) => {
  if (sheets.length === 0) {
    return null;
  }

  // 如果只有一个工作表，直接显示不需要选择
  if (sheets.length === 1) {
    return (
      <div className="sheet-selector">
        <div className="selector-header">
          <h3>当前工作表</h3>
        </div>
        <div className="sheet-list">
          <div className="sheet-item active single">
            <div className="sheet-info">
              <span className="sheet-name">{sheets[0].name}</span>
              <span className="sheet-stats">
                {sheets[0].rowCount} 行 × {sheets[0].colCount} 列
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sheet-selector">
      <div className="selector-header">
        <h3>选择工作表（单选）</h3>
      </div>
      <div className="sheet-list">
        {sheets.map(sheet => (
          <label key={sheet.name} className="sheet-item">
            <input
              type="radio"
              name="sheet"
              checked={selectedSheet === sheet.name}
              onChange={() => onSelectionChange(sheet.name)}
            />
            <div className="sheet-info">
              <span className="sheet-name">{sheet.name}</span>
              <span className="sheet-stats">
                {sheet.rowCount} 行 × {sheet.colCount} 列
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SheetSelector;


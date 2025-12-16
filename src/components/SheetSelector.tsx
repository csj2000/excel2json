import React from 'react';
import { SheetInfo } from '../utils/excelParser';

interface SheetSelectorProps {
  sheets: SheetInfo[];
  selectedSheets: string[];
  onSelectionChange: (selected: string[]) => void;
}

const SheetSelector: React.FC<SheetSelectorProps> = ({ 
  sheets, 
  selectedSheets, 
  onSelectionChange 
}) => {
  const handleToggle = (sheetName: string) => {
    if (selectedSheets.includes(sheetName)) {
      onSelectionChange(selectedSheets.filter(name => name !== sheetName));
    } else {
      onSelectionChange([...selectedSheets, sheetName]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSheets.length === sheets.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(sheets.map(s => s.name));
    }
  };

  if (sheets.length === 0) {
    return null;
  }

  return (
    <div className="sheet-selector">
      <div className="selector-header">
        <h3>选择工作表</h3>
        <button onClick={handleSelectAll} className="text-button">
          {selectedSheets.length === sheets.length ? '取消全选' : '全选'}
        </button>
      </div>
      <div className="sheet-list">
        {sheets.map(sheet => (
          <label key={sheet.name} className="sheet-item">
            <input
              type="checkbox"
              checked={selectedSheets.includes(sheet.name)}
              onChange={() => handleToggle(sheet.name)}
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


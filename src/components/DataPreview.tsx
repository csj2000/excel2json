import React, { useMemo } from 'react';
import { ParsedSheet } from '../utils/excelParser';

interface DataPreviewProps {
  sheet: ParsedSheet;
  maxRows?: number;
}

const DataPreview: React.FC<DataPreviewProps> = ({ sheet, maxRows = 50 }) => {
  const previewData = useMemo(() => {
    return sheet.data.slice(0, maxRows);
  }, [sheet.data, maxRows]);

  if (!sheet || sheet.data.length === 0) {
    return (
      <div className="data-preview empty">
        <p>无数据可预览</p>
      </div>
    );
  }

  const totalRows = sheet.data.length;
  const showingRows = previewData.length;

  return (
    <div className="data-preview">
      <div className="preview-header">
        <h3>数据预览：{sheet.name}</h3>
        <span className="preview-stats">
          显示 {showingRows} / {totalRows} 行
        </span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="row-number">#</th>
              {sheet.headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.slice(1).map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="row-number">{rowIdx + 1}</td>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx}>
                    {cell !== null && cell !== undefined ? String(cell) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalRows > maxRows && (
        <p className="preview-note">
          仅显示前 {maxRows} 行数据
        </p>
      )}
    </div>
  );
};

export default DataPreview;


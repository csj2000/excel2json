import React from 'react';
import { JsonFormat } from '../utils/jsonConverter';

interface FormatSelectorProps {
  selectedFormat: JsonFormat;
  onFormatChange: (format: JsonFormat) => void;
  groupByColumn?: string;
  onGroupByColumnChange?: (column: string) => void;
  availableColumns?: string[];
  useTypeConversion: boolean;
  onTypeConversionChange: (use: boolean) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
  groupByColumn,
  onGroupByColumnChange,
  availableColumns = [],
  useTypeConversion,
  onTypeConversionChange,
}) => {
  const formats: Array<{ value: JsonFormat; label: string; description: string; example: string }> = [
    {
      value: 'array-of-objects',
      label: '对象数组',
      description: '第一行作为键名',
      example: '[{"name": "张三", "age": 20}, ...]'
    },
    {
      value: 'array-2d',
      label: '二维数组',
      description: '包含表头',
      example: '[["name", "age"], ["张三", 20], ...]'
    },
    {
      value: 'keyed-object',
      label: '键值对象',
      description: '行号作为键',
      example: '{"1": {"name": "张三"}, "2": {...}}'
    },
    {
      value: 'grouped',
      label: '分组对象',
      description: '按指定列分组',
      example: '{"部门A": [{...}], "部门B": [{...}]}'
    }
  ];

  return (
    <div className="format-selector">
      <h3>JSON 格式</h3>
      <div className="format-options">
        {formats.map(format => (
          <label key={format.value} className="format-option">
            <input
              type="radio"
              name="format"
              value={format.value}
              checked={selectedFormat === format.value}
              onChange={() => onFormatChange(format.value)}
            />
            <div className="format-details">
              <strong>{format.label}</strong>
              <p className="format-description">{format.description}</p>
              <code className="format-example">{format.example}</code>
            </div>
          </label>
        ))}
      </div>

      {selectedFormat === 'grouped' && (
        <div className="group-by-selector">
          <label>
            分组列：
            <select 
              value={groupByColumn || ''} 
              onChange={(e) => onGroupByColumnChange?.(e.target.value)}
            >
              <option value="">请选择</option>
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="conversion-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={useTypeConversion}
            onChange={(e) => onTypeConversionChange(e.target.checked)}
          />
          <span>智能类型转换（自动识别数字、布尔值等）</span>
        </label>
      </div>
    </div>
  );
};

export default FormatSelector;


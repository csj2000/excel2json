import React from 'react';
import { JsonFormat } from '../utils/jsonConverter';

interface FormatSelectorProps {
  selectedFormat: JsonFormat;
  onFormatChange: (format: JsonFormat) => void;
  useTypeConversion: boolean;
  onTypeConversionChange: (use: boolean) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
  useTypeConversion,
  onTypeConversionChange,
}) => {
  const formats: Array<{ 
    value: JsonFormat; 
    label: string; 
    description: string; 
    example: string;
    technical: string;
  }> = [
    {
      value: 'newline',
      label: '换行符分隔',
      description: '每个文档独立一行，用换行符分隔',
      technical: 'Separate Documents with Newline (\\n)',
      example: '{"name":"张三","age":20}\n{"name":"李四","age":25}'
    },
    {
      value: 'comma-newline',
      label: '逗号换行分隔',
      description: '文档之间用逗号和换行符分隔',
      technical: 'Separate Documents with Comma and Newline (,\\n)',
      example: '{"name":"张三","age":20},\n{"name":"李四","age":25}'
    },
    {
      value: 'array',
      label: '标准数组格式 ⭐',
      description: '导出为标准 JSON 数组',
      technical: 'Export Documents as Array ([,\\n])',
      example: '[\n  {"name":"张三","age":20},\n  {"name":"李四","age":25}\n]'
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
              <p className="format-technical">{format.technical}</p>
              <p className="format-description">{format.description}</p>
              <code className="format-example">{format.example}</code>
            </div>
          </label>
        ))}
      </div>

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


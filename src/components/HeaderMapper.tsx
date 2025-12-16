import React, { useState, useEffect } from 'react';

interface HeaderMapperProps {
  originalHeaders: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  initialMapping?: Record<string, string>;
}

const HeaderMapper: React.FC<HeaderMapperProps> = ({
  originalHeaders,
  onMappingChange,
  initialMapping = {}
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // 初始化映射，如果没有设置则使用原始表头
    const newMapping: Record<string, string> = {};
    originalHeaders.forEach(header => {
      newMapping[header] = initialMapping[header] || header;
    });
    setMapping(newMapping);
  }, [originalHeaders, initialMapping]);

  const handleHeaderChange = (original: string, newName: string) => {
    const newMapping = { ...mapping, [original]: newName };
    setMapping(newMapping);
    onMappingChange(newMapping);
  };

  const handleReset = () => {
    const resetMapping: Record<string, string> = {};
    originalHeaders.forEach(header => {
      resetMapping[header] = header;
    });
    setMapping(resetMapping);
    onMappingChange(resetMapping);
  };

  const handleResetSingle = (header: string) => {
    const newMapping = { ...mapping, [header]: header };
    setMapping(newMapping);
    onMappingChange(newMapping);
  };

  if (originalHeaders.length === 0) {
    return null;
  }

  const hasChanges = originalHeaders.some(header => mapping[header] !== header);

  return (
    <div className="header-mapper">
      <div className="mapper-header">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-button"
        >
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="mapper-title">
            表头重命名 {hasChanges && <span className="changed-badge">已修改</span>}
          </span>
        </button>
        {hasChanges && (
          <button onClick={handleReset} className="text-button small">
            全部重置
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mapper-content">
          <p className="mapper-hint">
            💡 可以自定义导出 JSON 时的列名，留空则使用原始列名
          </p>
          <div className="mapping-list">
            {originalHeaders.map((header, index) => {
              const isChanged = mapping[header] !== header;
              return (
                <div key={index} className={`mapping-item ${isChanged ? 'changed' : ''}`}>
                  <div className="mapping-row">
                    <div className="original-header">
                      <label>原始列名：</label>
                      <span className="header-name">{header}</span>
                    </div>
                    <div className="arrow">→</div>
                    <div className="new-header">
                      <label>新列名：</label>
                      <input
                        type="text"
                        value={mapping[header] || ''}
                        onChange={(e) => handleHeaderChange(header, e.target.value)}
                        placeholder={header}
                        className="header-input"
                      />
                    </div>
                    {isChanged && (
                      <button
                        onClick={() => handleResetSingle(header)}
                        className="reset-single-button"
                        title="重置此项"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderMapper;


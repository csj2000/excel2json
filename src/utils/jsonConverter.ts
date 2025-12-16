import { ParsedSheet, smartTypeConversion } from './excelParser';

export type JsonFormat = 'array-of-objects' | 'array-2d' | 'keyed-object' | 'grouped';

export interface ConversionOptions {
  format: JsonFormat;
  useTypeConversion: boolean;
  groupByColumn?: string; // 用于 grouped 格式
  skipEmptyRows?: boolean;
  startRow?: number; // 从哪一行开始（0-based）
  headerMapping?: Record<string, string>; // 表头映射/重命名
}

/**
 * 将解析的工作表数据转换为 JSON
 */
export const convertToJson = (
  sheet: ParsedSheet,
  options: ConversionOptions
): any => {
  const { format, useTypeConversion, groupByColumn, skipEmptyRows, startRow, headerMapping } = options;

  // 过滤空行
  let dataRows = sheet.data.slice(startRow || 1); // 默认跳过第一行（表头）
  
  if (skipEmptyRows) {
    dataRows = dataRows.filter(row => 
      row.some(cell => cell !== null && cell !== undefined && cell !== '')
    );
  }

  // 应用表头映射
  const headers = sheet.headers.map(header => 
    headerMapping && headerMapping[header] ? headerMapping[header] : header
  );

  switch (format) {
    case 'array-of-objects':
      return convertToArrayOfObjects(headers, dataRows, useTypeConversion);
    
    case 'array-2d':
      return convertToArray2D(sheet.data, useTypeConversion);
    
    case 'keyed-object':
      return convertToKeyedObject(headers, dataRows, useTypeConversion);
    
    case 'grouped':
      if (!groupByColumn) {
        throw new Error('分组格式需要指定分组列');
      }
      return convertToGrouped(headers, dataRows, groupByColumn, useTypeConversion);
    
    default:
      throw new Error(`不支持的格式: ${format}`);
  }
};

/**
 * 转换为对象数组格式：[{name: "张三", age: 20}, ...]
 */
const convertToArrayOfObjects = (
  headers: string[],
  dataRows: any[][],
  useTypeConversion: boolean
): any[] => {
  return dataRows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((header, idx) => {
      const value = row[idx];
      obj[header] = useTypeConversion ? smartTypeConversion(value) : value;
    });
    return obj;
  });
};

/**
 * 转换为二维数组格式：[["name", "age"], ["张三", 20], ...]
 */
const convertToArray2D = (
  allData: any[][],
  useTypeConversion: boolean
): any[][] => {
  if (!useTypeConversion) {
    return allData;
  }

  return allData.map((row, rowIdx) => {
    // 第一行（表头）不进行类型转换
    if (rowIdx === 0) {
      return row;
    }
    return row.map(cell => smartTypeConversion(cell));
  });
};

/**
 * 转换为键值对象格式：{"1": {name: "张三"}, "2": {...}}
 */
const convertToKeyedObject = (
  headers: string[],
  dataRows: any[][],
  useTypeConversion: boolean
): Record<string, any> => {
  const result: Record<string, any> = {};
  
  dataRows.forEach((row, idx) => {
    const obj: Record<string, any> = {};
    headers.forEach((header, colIdx) => {
      const value = row[colIdx];
      obj[header] = useTypeConversion ? smartTypeConversion(value) : value;
    });
    result[String(idx + 1)] = obj;
  });

  return result;
};

/**
 * 转换为分组格式：按指定列的值进行分组
 * 例如：{"部门A": [{...}, {...}], "部门B": [{...}]}
 */
const convertToGrouped = (
  headers: string[],
  dataRows: any[][],
  groupByColumn: string,
  useTypeConversion: boolean
): Record<string, any[]> => {
  const groupIndex = headers.indexOf(groupByColumn);
  
  if (groupIndex === -1) {
    throw new Error(`找不到分组列: ${groupByColumn}`);
  }

  const result: Record<string, any[]> = {};

  dataRows.forEach(row => {
    const groupKey = String(row[groupIndex] || '未分组');
    
    const obj: Record<string, any> = {};
    headers.forEach((header, idx) => {
      if (idx !== groupIndex) { // 不包含分组列本身
        const value = row[idx];
        obj[header] = useTypeConversion ? smartTypeConversion(value) : value;
      }
    });

    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(obj);
  });

  return result;
};

/**
 * 批量转换多个工作表
 */
export const convertMultipleSheets = (
  sheets: ParsedSheet[],
  options: ConversionOptions
): Record<string, any> => {
  const result: Record<string, any> = {};
  
  sheets.forEach(sheet => {
    result[sheet.name] = convertToJson(sheet, options);
  });

  return result;
};

/**
 * 格式化 JSON 字符串
 */
export const formatJson = (data: any, pretty: boolean = true): string => {
  return JSON.stringify(data, null, pretty ? 2 : 0);
};


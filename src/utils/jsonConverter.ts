import { ParsedSheet, smartTypeConversion } from './excelParser';

// NoSQLBooster 风格的三种导出格式
export type JsonFormat = 'newline' | 'comma-newline' | 'array';

export interface ConversionOptions {
  format: JsonFormat;
  useTypeConversion: boolean;
  skipEmptyRows?: boolean;
  startRow?: number; // 从哪一行开始（0-based）
  headerMapping?: Record<string, string>; // 表头映射/重命名
}

/**
 * 将解析的工作表数据转换为对象数组（所有格式的基础）
 */
export const convertToJson = (
  sheet: ParsedSheet,
  options: ConversionOptions
): any[] => {
  const { useTypeConversion, skipEmptyRows, startRow, headerMapping } = options;

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

  // 统一转换为对象数组
  return convertToArrayOfObjects(headers, dataRows, useTypeConversion);
};

/**
 * 转换为对象数组：[{name: "张三", age: 20}, ...]
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
 * 批量转换多个工作表
 */
export const convertMultipleSheets = (
  sheets: ParsedSheet[],
  options: ConversionOptions
): any[] => {
  // 合并所有工作表的数据为一个数组
  const allData: any[] = [];
  
  sheets.forEach(sheet => {
    const sheetData = convertToJson(sheet, options);
    allData.push(...sheetData);
  });

  return allData;
};

/**
 * 格式化 JSON 字符串 - NoSQLBooster 风格
 * @param data 数据数组
 * @param format 导出格式
 */
export const formatJson = (data: any[], format: JsonFormat): string => {
  if (!Array.isArray(data) || data.length === 0) {
    return '[]';
  }

  switch (format) {
    case 'newline':
      // 用换行符分隔文档
      // {"name":"张三","age":20}
      // {"name":"李四","age":25}
      return data.map(item => JSON.stringify(item)).join('\n');
    
    case 'comma-newline':
      // 用逗号和换行符分隔文档
      // {"name":"张三","age":20},
      // {"name":"李四","age":25}
      return data.map(item => JSON.stringify(item)).join(',\n');
    
    case 'array':
      // 导出为数组格式（标准 JSON）
      // [
      //   {"name":"张三","age":20},
      //   {"name":"李四","age":25}
      // ]
      return JSON.stringify(data, null, 2);
    
    default:
      return JSON.stringify(data, null, 2);
  }
};


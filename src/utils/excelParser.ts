import * as XLSX from 'xlsx';

export interface SheetInfo {
  name: string;
  rowCount: number;
  colCount: number;
}

export interface ParsedSheet {
  name: string;
  data: any[][];
  headers: string[];
}

/**
 * 解析 Excel 文件，获取所有工作表信息
 */
export const parseExcelFile = async (arrayBuffer: ArrayBuffer): Promise<{ 
  workbook: XLSX.WorkBook;
  sheets: SheetInfo[];
}> => {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheets: SheetInfo[] = workbook.SheetNames.map(name => {
      const worksheet = workbook.Sheets[name];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      return {
        name,
        rowCount: range.e.r - range.s.r + 1,
        colCount: range.e.c - range.s.c + 1,
      };
    });

    return { workbook, sheets };
  } catch (error) {
    throw new Error(`解析 Excel 文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 从工作簿中提取指定工作表的数据
 */
export const extractSheetData = (
  workbook: XLSX.WorkBook, 
  sheetName: string
): ParsedSheet => {
  const worksheet = workbook.Sheets[sheetName];
  
  if (!worksheet) {
    throw new Error(`工作表 "${sheetName}" 不存在`);
  }

  // 将工作表转换为二维数组
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: null,
    raw: false // 将所有值转换为字符串，保持一致性
  });

  // 如果数据为空，返回空数组
  if (data.length === 0) {
    return {
      name: sheetName,
      data: [],
      headers: []
    };
  }

  // 第一行作为表头，过滤掉空白列
  const rawHeaders = data[0] || [];
  const headers: string[] = [];
  const validColumnIndices: number[] = [];
  
  rawHeaders.forEach((h: any, idx: number) => {
    const headerName = h !== null && h !== undefined && h !== '' ? String(h).trim() : '';
    // 只保留非空的列
    if (headerName !== '') {
      headers.push(headerName);
      validColumnIndices.push(idx);
    }
  });
  
  // 如果没有有效的表头，返回空数据
  if (headers.length === 0) {
    return {
      name: sheetName,
      data: [],
      headers: []
    };
  }
  
  // 过滤数据行，只保留有效列
  const filteredData = data.map(row => 
    validColumnIndices.map(idx => row[idx])
  );

  return {
    name: sheetName,
    data: filteredData,
    headers
  };
};

/**
 * 从文件路径读取 Excel 文件
 * 注意：这个函数需要在 Electron 环境中使用 IPC 通信
 */
export const readExcelFromFile = async (filePath: string): Promise<ArrayBuffer> => {
  // 使用 Electron IPC 读取文件
  const { ipcRenderer } = window.require('electron');
  const result = await ipcRenderer.invoke('read-file', filePath);
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
};

/**
 * 智能类型转换
 */
export const smartTypeConversion = (value: any): any => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const str = String(value).trim();
  
  // 尝试转换为数字
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    const num = Number(str);
    if (!isNaN(num)) {
      return num;
    }
  }

  // 尝试转换为布尔值
  if (str.toLowerCase() === 'true') return true;
  if (str.toLowerCase() === 'false') return false;

  // 保持字符串
  return str;
};


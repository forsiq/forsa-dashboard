import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import { AmberButton } from '../AmberButton';

// --- Types ---

export interface ExcelColumn<T = any> {
  key: keyof T | string;
  label: string;
  width?: number;
  render?: (item: T) => React.ReactNode | string | number;
}

export interface AmberExcelExportProps<T = any> {
  data: T[];
  columns: ExcelColumn<T>[];
  filename?: string;
  sheetName?: string;
  trigger?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: Error) => void;
  onGenerateReport?: () => void | Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

// --- Excel Export Component ---

/**
 * AmberExcelExport - Export data to Excel file
 *
 * @example
 * <AmberExcelExport
 *   data={products}
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { key: 'price', label: 'Price', render: (item) => `$${item.price}` }
 *   ]}
 *   filename="products"
 * />
 *
 * @example
 * // With custom trigger
 * <AmberExcelExport
 *   data={data}
 *   columns={columns}
 *   trigger={<button className="custom-btn">Download Excel</button>}
 * />
 *
 * @example
 * // With data fetch on export
 * <AmberExcelExport
 *   data={[]}
 *   columns={columns}
 *   onGenerateReport={async () => {
 *     const data = await fetchData();
 *     setData(data);
 *   }}
 * />
 */
export function AmberExcelExport<T extends Record<string, any>>({
  data,
  columns,
  filename = 'export',
  sheetName = 'Sheet1',
  trigger,
  className,
  disabled = false,
  onExportStart,
  onExportComplete,
  onExportError,
  onGenerateReport,
  size = 'md',
  variant = 'outline',
}: AmberExcelExportProps<T>) {
  const { t, dir } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  // Format cell value for Excel
  const formatCellValue = (value: any): string | number => {
    if (value === null || value === undefined) {
      return '';
    }

    if (React.isValidElement(value)) {
      // Extract text content from React elements
      const extractText = (element: any): string => {
        if (typeof element === 'string' || typeof element === 'number') {
          return element.toString();
        }
        if (React.isValidElement(element)) {
          if (typeof (element.props as any).children === 'string') {
            return (element.props as any).children;
          }
          if (Array.isArray((element.props as any).children)) {
            return (element.props as any).children
              .map(extractText)
              .filter(Boolean)
              .join(' ');
          }
          return extractText((element.props as any).children) || '';
        }
        return '';
      };
      return extractText(value);
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value.toString();
  };

  // Handle export
  const handleExport = async () => {
    if (disabled || isExporting) return;

    try {
      setIsExporting(true);
      onExportStart?.();

      // Call onGenerateReport if provided (for fetching data)
      if (onGenerateReport) {
        await onGenerateReport();
      }

      // Prepare data for Excel
      const excelData = data.map((item) => {
        const row: Record<string, any> = {};
        columns.forEach((col) => {
          const value = col.render ? col.render(item) : item[col.key as keyof T];
          row[col.label] = formatCellValue(value);
        });
        return row;
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths if specified
      if (columns.some(col => col.width)) {
        const colWidths = columns.map((col) => ({
          wch: col.width ? Math.round(col.width / 8) : 15,
        }));
        ws['!cols'] = colWidths;
      }

      // Style the header row (basic styling - full styling requires pro version)
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[address]) continue;
        ws[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'CCCCCC' } },
          alignment: { horizontal: 'center' },
        };
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate Excel file and trigger download
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const finalFilename = `${filename}_${timestamp}.xlsx`;

      saveAs(blob, finalFilename);
      onExportComplete?.();
    } catch (error) {
      console.error('Excel export error:', error);
      onExportError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  // Default trigger button
  const defaultTrigger = (
    <AmberButton
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isExporting}
      onClick={handleExport}
    >
      {isExporting ? (
        <>
          <Loader2 className={cn('w-4 h-4 animate-spin', dir === 'rtl' ? 'ml-2' : 'mr-2')} />
          {t('common.exporting') || 'Exporting...'}
        </>
      ) : (
        <>
          <FileSpreadsheet className={cn('w-4 h-4', dir === 'rtl' ? 'ml-2' : 'mr-2')} />
          {t('common.export_excel') || 'Export Excel'}
        </>
      )}
    </AmberButton>
  );

  // Icon-only trigger for compact version
  const iconTrigger = (
    <button
      className={cn(
        'p-2 rounded-lg text-zinc-muted hover:text-brand hover:bg-white/5',
        'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || isExporting}
      onClick={handleExport}
      title={t('common.export_excel') || 'Export Excel'}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
    </button>
  );

  // Custom trigger support
  if (trigger) {
    return React.cloneElement(trigger as React.ReactElement, {
      onClick: handleExport,
      disabled: disabled || isExporting,
    } as any);
  }

  return defaultTrigger;
}

// --- Utility Functions ---

/**
 * Create Excel columns from table column definitions
 *
 * @example
 * const tableColumns = [
 *   { key: 'name', label: 'Name', render: (item) => <strong>{item.name}</strong> }
 * ];
 * const excelColumns = createExcelColumns(tableColumns);
 */
export function createExcelColumns<T>(
  tableColumns: Array<{
    key: string;
    label: string;
    width?: number;
    render?: (item: T) => any;
  }>
): ExcelColumn<T>[] {
  return tableColumns.map((col) => ({
    key: col.key as keyof T,
    label: col.label,
    width: col.width,
    render: col.render,
  }));
}

/**
 * Export data to Excel immediately (imperative API)
 *
 * @example
 * handleExport = () => {
 *   exportToExcel(data, columns, 'my-file');
 * }
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExcelColumn<T>[],
  filename: string = 'export',
  sheetName: string = 'Sheet1'
): void {
  // Create a temporary wrapper to handle the export
  const tempDiv = document.createElement('div');
  document.body.appendChild(tempDiv);

  // This is a simple synchronous version
  // For full functionality, use the AmberExcelExport component
  const excelData = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      const value = col.render ? col.render(item) : item[col.key as keyof T];
      row[col.label] = typeof value === 'string' ? value : String(value ?? '');
    });
    return row;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  saveAs(new Blob([blob]), `${filename}_${timestamp}.xlsx`);

  document.body.removeChild(tempDiv);
}

export default AmberExcelExport;

// --- Note about dependencies ---
// This component requires:
// npm install xlsx file-saver
// npm install -D @types/file-saver

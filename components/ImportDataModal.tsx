import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { Kpi } from '../types';
import { batchImportActuals, batchImportBudgets } from '../services/firebaseService';
import { getAIAssistedMapping } from '../services/geminiService';
import * as XLSX from 'xlsx';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

// Enhanced parsing functions to extract pre-header content
const parseCSV = (text: string): { headers: string[], data: any[], preHeaderContent: string } => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 1) return { headers: [], data: [], preHeaderContent: '' };
    let headerIndex = lines.findIndex(line => line.split(',').some(h => h.trim() !== '' && h.length > 1));
    if (headerIndex === -1) headerIndex = lines.length -1;
    
    const preHeaderLines = lines.slice(0, headerIndex);
    const preHeaderContent = preHeaderLines.join('\n');
    
    const headers = lines[headerIndex]?.split(',').map(h => h.trim()) || [];
    const data = lines.slice(headerIndex + 1)
        .filter(line => line.trim() !== '' && line.split(',').some(v => v.trim() !== ''))
        .map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index]?.trim() || '';
                return obj;
            }, {} as { [key: string]: string });
        });
    return { headers, data, preHeaderContent };
};

const parseExcelWorkbook = (file: File): Promise<{ headers: string[], data: any[], preHeaderContent: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                let allData: any[] = [];
                let unifiedHeaders: string[] = [];
                let preHeaderContent = '';

                workbook.SheetNames.forEach((sheetName, sheetIndex) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                    
                    if (json.length === 0) return;

                    let headerIndex = json.findIndex(row => Array.isArray(row) && row.some(cell => cell && String(cell).trim().length > 1));
                     if (headerIndex === -1) headerIndex = json.length > 0 ? 0 : -1;

                    // Capture pre-header content only from the first sheet
                    if (sheetIndex === 0 && headerIndex > 0) {
                        preHeaderContent = json.slice(0, headerIndex).map(row => row.join(', ')).join('\n');
                    }
                    
                    const headers = json[headerIndex]?.map(h => String(h).trim()) || [];
                    if (unifiedHeaders.length === 0 && headers.length > 0) {
                        unifiedHeaders = headers;
                    }
                    
                    const sheetData = json.slice(headerIndex + 1)
                        .filter(row => Array.isArray(row) && row.some(cell => cell && String(cell).trim() !== ''))
                        .map(row => {
                            return unifiedHeaders.reduce((obj, header) => {
                                obj[header] = row[headers.indexOf(header)] || '';
                                return obj;
                            }, {} as { [key: string]: any });
                        });
                    
                    allData = allData.concat(sheetData);
                });

                if (allData.length === 0 && unifiedHeaders.length === 0) {
                     reject(new Error("No data or headers found in any of the workbook's sheets."));
                } else {
                     resolve({ headers: unifiedHeaders, data: allData, preHeaderContent });
                }
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};


export const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const resetState = () => {
    setFiles([]);
    setIsProcessing(false);
    setProgress({ current: 0, total: 0 });
    setStatusLog([]);
    setErrors([]);
  };

  useEffect(() => {
    if (isOpen) resetState();
  }, [isOpen]);

  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [statusLog]);

  const handleFileDrop = (fileList: FileList) => {
    if (fileList && fileList.length > 0) {
      setFiles(Array.from(fileList));
      setStatusLog([]);
      setErrors([]);
    }
  };

  const handleImport = async () => {
    if (files.length === 0) {
      setErrors(['Please select at least one file to upload.']);
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });
    setStatusLog([]);
    setErrors([]);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const currentFileNum = i + 1;
        setProgress({ current: currentFileNum, total: files.length });
        setStatusLog(prev => [...prev, `[${currentFileNum}/${files.length}] Processing ${file.name}...`]);

        const fileType = file.name.split('.').pop()?.toLowerCase() || '';

        try {
            if (['xlsx', 'xlsm', 'xls'].includes(fileType)) {
                const { headers, data, preHeaderContent } = await parseExcelWorkbook(file);
                const isBudget = headers.includes('Year') && headers.includes('Month');
                if (isBudget) {
                     setStatusLog(prev => [...prev, `  -> Detected Budget format. Importing...`]);
                     await batchImportBudgets(data);
                } else {
                     setStatusLog(prev => [...prev, `  -> Asking AI to map columns and find date...`]);
                     const appKpis = ['Store Name', 'Week Start Date', ...Object.values(Kpi), 'ignore'];
                     const aiMappingResult = await getAIAssistedMapping(headers, appKpis, preHeaderContent, file.name);
                     setStatusLog(prev => [...prev, `  -> Applying AI map and importing data...`]);
                     await batchImportActuals(data, aiMappingResult, file.name);
                }
            } else if (fileType === 'csv') {
                const { headers, data, preHeaderContent } = parseCSV(await file.text());
                const isBudget = headers.includes('Year') && headers.includes('Month');
                if (isBudget) {
                     setStatusLog(prev => [...prev, `  -> Detected Budget format. Importing...`]);
                     await batchImportBudgets(data);
                } else {
                    setStatusLog(prev => [...prev, `  -> Asking AI to map columns and find date...`]);
                    const appKpis = ['Store Name', 'Week Start Date', ...Object.values(Kpi), 'ignore'];
                    const aiMappingResult = await getAIAssistedMapping(headers, appKpis, preHeaderContent, file.name);
                    setStatusLog(prev => [...prev, `  -> Applying AI map and importing data...`]);
                    await batchImportActuals(data, aiMappingResult, file.name);
                }
            } else {
                 throw new Error(`Unsupported file type: .${fileType}. Please use Excel or CSV files.`);
            }
            setStatusLog(prev => [...prev, `  -> SUCCESS: ${file.name} imported.`]);

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setErrors(prev => [...prev, `FAILED: ${file.name} - ${errorMsg}`]);
            setStatusLog(prev => [...prev, `  -> ERROR: ${errorMsg}`]);
        }
    }

    setStatusLog(prev => [...prev, `\nImport Complete.`]);
    setIsProcessing(false);
    onImportSuccess();
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700'); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); handleFileDrop(e.dataTransfer.files); };
  
  const acceptedFileTypes = ".csv, .xlsx, .xlsm, .xls";

  const isFinished = !isProcessing && progress.total > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Universal Data Hub">
      <div className="space-y-4">
        {!isProcessing && !isFinished && (
             <p className="text-slate-300 text-sm">
                Upload any Weekly Actuals or Annual Budget file. The system will automatically detect the file type, dates, and data structure, even across multiple tabs in an Excel workbook.
            </p>
        )}
       
        {!isProcessing && !isFinished && (
            <div 
            ref={dropzoneRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-10 text-center cursor-pointer transition-colors hover:bg-slate-800/50"
            >
                <input id="file-upload" type="file" accept={acceptedFileTypes} className="hidden" onChange={(e) => handleFileDrop(e.target.files!)} multiple />
                <Icon name="download" className="w-12 h-12 mx-auto text-slate-500 mb-3" />
                {files.length > 0 ? (
                    <div className="text-slate-200 text-sm">
                      <p className="font-bold text-lg">{files.length} file(s) selected:</p>
                      <ul className="mt-2 text-left max-h-24 overflow-y-auto custom-scrollbar list-disc pl-5">
                        {files.map(f => <li key={f.name}>{f.name}</li>)}
                      </ul>
                    </div>
                ) : (
                    <>
                    <p className="text-slate-300 font-medium text-lg">Drag & drop one or more files here</p>
                    <p className="text-sm text-slate-500 mt-2">Supports Excel and CSV</p>
                    </>
                )}
            </div>
        )}
        
        {(isProcessing || isFinished) && (
            <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <p className="text-cyan-400 font-semibold">{isProcessing ? 'Importing...' : 'Finished'}</p>
                    <p className="text-slate-400">{progress.current} / {progress.total}</p>
                 </div>
                 <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
                <div ref={logContainerRef} className="bg-slate-900 border border-slate-700 rounded-md p-3 h-48 overflow-y-auto custom-scrollbar text-xs font-mono">
                    {statusLog.map((log, i) => (
                        <p key={i} className={log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-slate-400'}>
                            {log}
                        </p>
                    ))}
                </div>
            </div>
        )}

        {errors.length > 0 && (
            <div className="space-y-1">
                 <h3 className="text-sm font-bold text-red-400">Errors Encountered:</h3>
                {errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-400 bg-red-900/30 p-1.5 rounded-md">{err}</p>
                ))}
            </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-4">
          {isFinished ? (
            <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md shadow-lg shadow-cyan-900/20">Close</button>
          ) : (
            <>
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                <button onClick={handleImport} disabled={isProcessing || files.length === 0} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20">
                    {isProcessing ? 'Processing...' : `Import ${files.length} File(s)`}
                </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

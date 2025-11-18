import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { DataMappingTemplate, Kpi } from '../types';
import { batchImportActuals, batchImportBudgets, batchImportStructuredActuals } from '../services/firebaseService';
import { getAIAssistedMapping, extractKpisFromImage, extractKpisFromDocument } from '../services/geminiService';
import * as XLSX from 'xlsx';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: DataMappingTemplate[];
  onOpenMappingModal: (file: File, headers: string[], parsedData: any[], suggestedMappings: { [header: string]: string }) => void;
  onImportSuccess: () => void;
}

const parseCSV = (text: string): { headers: string[], data: any[] } => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 1) return { headers: [], data: [] };
    let headerIndex = lines.findIndex(line => line.split(',').some(h => h.trim() !== ''));
    if (headerIndex === -1) return { headers: [], data: [] };
    const headers = lines[headerIndex].split(',').map(h => h.trim());
    const data = lines.slice(headerIndex + 1)
        .filter(line => line.trim() !== '' && line.split(',').some(v => v.trim() !== ''))
        .map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index]?.trim() || '';
                return obj;
            }, {} as { [key: string]: string });
        });
    return { headers, data };
};

const parseExcel = (file: File): Promise<{ headers: string[], data: any[] }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (json.length === 0) {
                    resolve({ headers: [], data: [] });
                    return;
                }
                
                let headerIndex = json.findIndex(row => Array.isArray(row) && row.some(cell => cell && String(cell).trim() !== ''));
                if (headerIndex === -1) {
                    resolve({ headers: [], data: [] });
                    return;
                }
                
                const headers = json[headerIndex].map(h => String(h).trim());
                const parsedData = json.slice(headerIndex + 1)
                    .filter(row => Array.isArray(row) && row.some(cell => cell && String(cell).trim() !== ''))
                    .map(row => {
                        return headers.reduce((obj, header, index) => {
                            obj[header] = row[index] || '';
                            return obj;
                        }, {} as { [key: string]: any });
                    });
                resolve({ headers, data: parsedData });
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};


export const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose, templates, onOpenMappingModal, onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null); setIsLoading(false); setStatusMessage(null); setError(null);
    }
  }, [isOpen]);

  const handleFileDrop = (files: FileList) => {
    if (files && files[0]) { setFile(files[0]); setError(null); }
  };

  const handleImport = async () => {
    if (!file) { setError('Please select a file to upload.'); return; }

    setIsLoading(true); setStatusMessage('Reading and parsing file...'); setError(null);
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    
    try {
        if (['csv', 'xlsx', 'xlsm'].includes(fileType)) {
            // Tabular Data Flow (CSV/Excel)
            setStatusMessage(`Parsing ${file.name}...`);
            const { headers, data } = fileType === 'csv' 
                ? parseCSV(await file.text())
                : await parseExcel(file);
            
            if (data.length === 0) throw new Error("Could not find any data rows in the file.");
            
            // Intelligent Routing: Check for Budget headers
            const isBudget = headers.includes('Year') && headers.includes('Month');
            
            if (isBudget) {
                setStatusMessage('Detected Budget format. Importing...');
                await batchImportBudgets(data);
                setStatusMessage('Successfully imported budget data!');
                setTimeout(() => { onImportSuccess(); onClose(); }, 1500);
            } else {
                // Actuals
                setStatusMessage(`Parsed ${data.length} rows. Checking for matching templates...`);
                const template = templates.find(t => JSON.stringify(t.headers) === JSON.stringify(headers));
                
                if (template) {
                    setStatusMessage(`Applying template "${template.name}" and importing data...`);
                    await batchImportActuals(data, template);
                    setStatusMessage('Successfully imported data!');
                    setTimeout(() => { onImportSuccess(); onClose(); }, 1500);
                } else {
                    setStatusMessage('No template found. Asking AI to assist with mapping...');
                    const appKpis = ['Store Name', 'Week Start Date', ...Object.values(Kpi), 'ignore'];
                    const suggestedMappings = await getAIAssistedMapping(headers, appKpis);
                    onOpenMappingModal(file, headers, data, suggestedMappings);
                }
            }

        } else if (['png', 'jpg', 'jpeg', 'pdf', 'docx'].includes(fileType)) {
            // AI Vision Flow (Image/PDF/Doc)
            setStatusMessage('Analyzing document with AI Vision...');
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64Data = (e.target?.result as string).split(',')[1];
                    const context = `Identify the week start dates directly from the document visual or text.`;
                    let extractedData;

                    if (['png', 'jpg', 'jpeg'].includes(fileType)) {
                        extractedData = await extractKpisFromImage(base64Data, context);
                    } else { // PDF, DOCX
                        extractedData = await extractKpisFromDocument(base64Data, file.type, context);
                    }

                    if (extractedData.length === 0) throw new Error("AI could not extract any valid data from the document.");
                    
                    setStatusMessage(`AI extracted ${extractedData.length} weekly records. Importing...`);
                    await batchImportStructuredActuals(extractedData);
                    setStatusMessage('Successfully imported data from document!');
                    setTimeout(() => { onImportSuccess(); onClose(); }, 1500);

                } catch(err) {
                    const errorMsg = err instanceof Error ? err.message : 'AI analysis failed.';
                    setError(errorMsg);
                    setIsLoading(false);
                }
            };
            reader.readAsDataURL(file);
        } else {
            throw new Error('Unsupported file type.');
        }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700'); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); handleFileDrop(e.dataTransfer.files); };
  
  const acceptedFileTypes = ".csv, .xlsx, .xlsm, .png, .jpg, .jpeg, .pdf, .docx";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Universal Data Hub">
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
            Upload any Weekly Actuals or Annual Budget file. The system will automatically detect the file type, dates, and data structure.
        </p>

        <div 
          ref={dropzoneRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          className="border-2 border-dashed border-slate-600 rounded-lg p-10 text-center cursor-pointer transition-colors hover:bg-slate-800/50"
        >
          <input id="file-upload" type="file" accept={acceptedFileTypes} className="hidden" onChange={(e) => handleFileDrop(e.target.files!)} />
          <Icon name="download" className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          {file ? (
            <p className="text-slate-200 text-lg">File selected: <span className="font-bold text-cyan-400">{file.name}</span></p>
          ) : (
            <>
              <p className="text-slate-300 font-medium text-lg">Drag & drop a report here</p>
              <p className="text-sm text-slate-500 mt-2">Supports Excel, CSV, Images, PDF, and Word</p>
            </>
          )}
        </div>

        {isLoading && (
            <div className="flex items-center justify-center gap-2 text-cyan-400 mt-4">
                 <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                 <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                 <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                 <p>{statusMessage}</p>
            </div>
        )}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-2 rounded-md border border-red-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-4">
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
          <button onClick={handleImport} disabled={isLoading || !file} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20">
            {isLoading ? 'Processing...' : 'Import Data'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

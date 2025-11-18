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
  onOpenMappingModal: (file: File, headers: string[], parsedData: any[], weekStartDate: string, suggestedMappings: { [header: string]: string }) => void;
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
  const [activeTab, setActiveTab] = useState<'actuals' | 'budgets'>('actuals');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weekStartDate, setWeekStartDate] = useState('');
  const dropzoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null); setIsLoading(false); setStatusMessage(null); setError(null); setWeekStartDate('');
    }
  }, [isOpen]);

  const handleFileDrop = (files: FileList) => {
    if (files && files[0]) { setFile(files[0]); setError(null); }
  };

  const handleImport = async () => {
    if (!file) { setError('Please select a file to upload.'); return; }
    if (activeTab === 'actuals' && !weekStartDate) { setError('Please select a Week Start Date for this report.'); return; }

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
            setStatusMessage(`Parsed ${data.length} rows. Checking for matching templates...`);
            
            if (activeTab === 'actuals') {
                const template = templates.find(t => JSON.stringify(t.headers) === JSON.stringify(headers));
                if (template) {
                    setStatusMessage(`Applying template "${template.name}" and importing data...`);
                    await batchImportActuals(data, template, new Date(`${weekStartDate}T12:00:00`));
                    setStatusMessage('Successfully imported data!');
                    setTimeout(() => { onImportSuccess(); onClose(); }, 1500);
                } else {
                    setStatusMessage('No template found. Asking AI to assist with mapping...');
                    const appKpis = ['Store Name', ...Object.values(Kpi), 'ignore'];
                    const suggestedMappings = await getAIAssistedMapping(headers, appKpis);
                    onOpenMappingModal(file, headers, data, weekStartDate, suggestedMappings);
                }
            } else { // Budgets
                await batchImportBudgets(data);
                setStatusMessage('Successfully imported budget data!');
                setTimeout(() => { onImportSuccess(); onClose(); }, 1500);
            }
        } else if (['png', 'jpg', 'jpeg', 'pdf', 'docx'].includes(fileType)) {
            // AI Vision Flow (Image/PDF/Doc)
            setStatusMessage('Analyzing document with AI Vision...');
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64Data = (e.target?.result as string).split(',')[1];
                    const context = `This document is for the week starting ${weekStartDate}. The year is ${new Date(weekStartDate).getFullYear()}.`;
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
                    setError(err instanceof Error ? err.message : 'AI analysis failed.');
                    setIsLoading(false);
                }
            };
            reader.readAsDataURL(file);
        } else {
            throw new Error('Unsupported file type.');
        }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsLoading(false);
    }
    // Note: Don't set isLoading to false here for async operations inside reader.onload
    if (!['png', 'jpg', 'jpeg', 'pdf', 'docx'].includes(fileType)) {
        setIsLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700'); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); handleFileDrop(e.dataTransfer.files); };
  
  const acceptedFileTypes = ".csv, .xlsx, .xlsm, .png, .jpg, .jpeg, .pdf, .docx";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Universal Data Hub">
      <div className="flex border-b border-slate-700 mb-4">
        <button onClick={() => setActiveTab('actuals')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'actuals' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Import Weekly Actuals</button>
        <button onClick={() => setActiveTab('budgets')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'budgets' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Import Annual Budgets</button>
      </div>

      <div className="space-y-4">
        <div 
          ref={dropzoneRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer transition-colors"
        >
          <input id="file-upload" type="file" accept={acceptedFileTypes} className="hidden" onChange={(e) => handleFileDrop(e.target.files!)} />
          <Icon name="download" className="w-10 h-10 mx-auto text-slate-500 mb-2" />
          {file ? (
            <p className="text-slate-300">File selected: <span className="font-semibold text-cyan-400">{file.name}</span></p>
          ) : (
            <>
              <p className="text-slate-400">Drag & drop a file here, or click to select.</p>
              <p className="text-xs text-slate-500 mt-1">Supports CSV, Excel, Images, PDF, and Word documents.</p>
            </>
          )}
        </div>
        
        {activeTab === 'actuals' && (
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Week Start Date</label>
                <input type="date" value={weekStartDate} onChange={e => setWeekStartDate(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                <p className="text-xs text-slate-500 mt-1">Select the Monday of the week this report covers.</p>
            </div>
        )}

        {isLoading && <p className="text-center text-cyan-400">{statusMessage}</p>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-2 rounded-md">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
          <button onClick={handleImport} disabled={isLoading || !file} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed">
            {isLoading ? 'Processing...' : 'Import Data'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
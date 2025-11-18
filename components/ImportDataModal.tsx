import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { DataMappingTemplate, Kpi } from '../types';
import { batchImportActuals, batchImportBudgets } from '../services/firebaseService';
import { getAIAssistedMapping } from '../services/geminiService';
import { ALL_KPIS } from '../constants';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: DataMappingTemplate[];
  onOpenMappingModal: (file: File, headers: string[], parsedData: any[], weekStartDate: string, suggestedMappings: { [header: string]: string }) => void;
  onImportSuccess: () => void;
}

// Simple CSV parser
const parseCSV = (text: string): { headers: string[], data: any[] } => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return { headers: [], data: [] };

    // Find the first line that looks like a header row (not just commas)
    let headerIndex = 0;
    while(headerIndex < lines.length && (lines[headerIndex].trim() === '' || lines[headerIndex].split(',').every(h => h.trim() === ''))) {
        headerIndex++;
    }

    if(headerIndex >= lines.length) return { headers: [], data: [] };

    const headers = lines[headerIndex].split(',').map(h => h.trim());
    const data = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
        if (lines[i].trim() === '' || lines[i].split(',').every(h => h.trim() === '')) continue;
        const values = lines[i].split(',');
        const row = headers.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim() || '';
            return obj;
        }, {} as { [key: string]: string });
        data.push(row);
    }
    return { headers, data };
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
      // Reset state when modal opens
      setFile(null);
      setIsLoading(false);
      setStatusMessage(null);
      setError(null);
      setWeekStartDate('');
    }
  }, [isOpen]);

  const handleFileDrop = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setError(null);
    }
  };

  const processFileWithTemplate = async (parsedData: any[], template: DataMappingTemplate) => {
    setStatusMessage(`Applying template "${template.name}" and importing data...`);
    try {
      await batchImportActuals(parsedData, template, new Date(`${weekStartDate}T12:00:00`));
      setStatusMessage(`Successfully imported ${parsedData.length} rows!`);
      setTimeout(() => {
        onImportSuccess();
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during import.');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (activeTab === 'actuals' && !weekStartDate) {
      setError('Please select a Week Start Date for this report.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Reading and parsing file...');
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, data } = parseCSV(text);
        if (data.length === 0) {
          setError("Could not find any data rows in the file.");
          setIsLoading(false);
          return;
        }

        setStatusMessage(`Parsed ${data.length} rows. Checking for matching templates...`);

        if (activeTab === 'actuals') {
            const template = templates.find(t => JSON.stringify(t.headers) === JSON.stringify(headers));
            if (template) {
                await processFileWithTemplate(data, template);
            } else {
                setStatusMessage('No matching template found. Asking AI to pre-map columns...');
                const appKpis = ['Store Name', 'Week Start Date', 'Year', 'Month', ...Object.values(Kpi), 'ignore'];
                const suggestedMappings = await getAIAssistedMapping(headers, appKpis);
                
                setStatusMessage('AI analysis complete. Opening data mapper...');
                onOpenMappingModal(file, headers, data, weekStartDate, suggestedMappings);
            }
        } else {
            // For budgets, use a simpler direct import for now
            setStatusMessage('Importing budget data...');
            await batchImportBudgets(data);
            setStatusMessage(`Successfully imported ${data.length} budget rows!`);
            setTimeout(() => {
                onImportSuccess();
                onClose();
            }, 1500);
        }

      } catch (err) {
        setError('Failed to read or parse the file. Please ensure it is a valid CSV.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700');
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700');
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700');
    handleFileDrop(e.dataTransfer.files);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Intelligent Data Hub">
      <div className="flex border-b border-slate-700 mb-4">
        <button onClick={() => setActiveTab('actuals')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'actuals' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Import Weekly Actuals</button>
        <button onClick={() => setActiveTab('budgets')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'budgets' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Import Annual Budgets</button>
      </div>

      <div className="space-y-4">
        <div 
          ref={dropzoneRef}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer transition-colors"
        >
          <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={(e) => handleFileDrop(e.target.files!)} />
          <Icon name="download" className="w-10 h-10 mx-auto text-slate-500 mb-2" />
          {file ? (
            <p className="text-slate-300">File selected: <span className="font-semibold text-cyan-400">{file.name}</span></p>
          ) : (
            <p className="text-slate-400">Drag & drop a CSV file here, or click to select a file.</p>
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
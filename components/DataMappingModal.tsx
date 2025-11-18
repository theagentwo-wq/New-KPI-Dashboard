import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Kpi, DataMappingTemplate } from '../types';
import { ALL_KPIS } from '../constants';
import { saveDataMappingTemplate, batchImportActuals } from '../services/firebaseService';

interface DataMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  parsedData: any[];
  weekStartDate: string;
  onImportSuccess: () => void;
  initialMappings?: { [header: string]: string };
}

const appKpis: (Kpi | 'Store Name' | 'Week Start Date' | 'Year' | 'Month' | 'ignore')[] = [
  'Store Name',
  ...ALL_KPIS,
  'ignore'
];

export const DataMappingModal: React.FC<DataMappingModalProps> = ({ isOpen, onClose, headers, parsedData, weekStartDate, onImportSuccess, initialMappings }) => {
  const [mappings, setMappings] = useState<{ [header: string]: string }>({});
  const [templateName, setTemplateName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        // Pre-populate with AI suggestions if available
        setMappings(initialMappings || {});
        setTemplateName('');
        setError(null);
        setIsLoading(false);
    }
  }, [isOpen, initialMappings]);

  const handleMappingChange = (header: string, kpi: string) => {
    setMappings(prev => ({ ...prev, [header]: kpi }));
  };

  const handleSaveAndImport = async () => {
    if (!templateName.trim()) {
      setError('Please provide a name for this new template.');
      return;
    }
    if (Object.values(mappings).filter(m => m === 'Store Name').length === 0) {
      setError('You must map one column to "Store Name".');
      return;
    }
     if (!weekStartDate) {
      setError('A valid week start date is required for import.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const newTemplate: Omit<DataMappingTemplate, 'id'> = {
        name: templateName,
        headers: headers,
        mappings: mappings as DataMappingTemplate['mappings'],
      };
      
      const savedTemplate = await saveDataMappingTemplate(newTemplate);
      
      const importDate = new Date(`${weekStartDate}T12:00:00`);
      await batchImportActuals(parsedData, savedTemplate, importDate);

      onImportSuccess();
      onClose();

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Data Mapping Template">
      <div className="space-y-4">
        <p className="text-slate-300">The AI has pre-filled its best guesses for this new file format. Please review the mappings below, give this template a name, and then click "Save & Import".</p>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Template Name</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., 'Weekly MTD Report'"
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white"
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-3 p-3 bg-slate-900 rounded-md border border-slate-700 custom-scrollbar">
          <h4 className="font-semibold text-cyan-400">Map Columns</h4>
          {headers.map(header => (
            <div key={header} className="grid grid-cols-2 gap-4 items-center">
              <span className="text-slate-400 truncate" title={header}>{header}</span>
              <select 
                value={mappings[header] || 'ignore'} 
                onChange={e => handleMappingChange(header, e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm"
              >
                {appKpis.map(kpi => <option key={kpi} value={kpi}>{kpi}</option>)}
              </select>
            </div>
          ))}
        </div>

        {error && <p className="text-center text-red-400 bg-red-900/50 p-2 rounded-md">{error}</p>}
        
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
          <button onClick={handleSaveAndImport} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            {isLoading ? 'Saving & Importing...' : 'Save & Import'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
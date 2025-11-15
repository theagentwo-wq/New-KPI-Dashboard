import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Kpi, PerformanceData } from '../types';
import { ALL_KPIS, ALL_STORES } from '../constants';
import { format } from 'date-fns';

interface DataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (storeId: string, weekStartDate: Date, data: PerformanceData) => void;
  initialData?: PerformanceData;
}

export const DataEntryModal: React.FC<DataEntryModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<PerformanceData>(initialData || {} as PerformanceData);
  const [storeId, setStoreId] = useState(ALL_STORES[0]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    // Reset form when modal opens or initial data changes
    setFormData(initialData || {} as PerformanceData);
  }, [initialData, isOpen]);

  const handleChange = (kpi: Kpi, value: string) => {
    const numValue = parseFloat(value);
    const formattedValue = kpi.includes('Cost') || kpi.includes('SOP') || kpi.includes('Score') ? numValue / 100 : numValue;
    setFormData(prev => ({ ...prev, [kpi]: isNaN(numValue) ? 0 : formattedValue }));
  };
  
  const getDisplayValue = (kpi: Kpi) => {
    const value = formData[kpi];
    if(value === undefined || value === null || isNaN(value)) return '';
    if (kpi.includes('Cost') || kpi.includes('SOP') || kpi.includes('Score')) {
      return (value * 100).toString();
    }
    return value.toString();
  }

  const handleSave = () => {
    if (storeId && date) {
      // By creating the date at noon, we avoid timezone issues where midnight might shift the date
      onSave(storeId, new Date(`${date}T12:00:00`), formData);
      onClose();
    } else {
      alert("Please select a store and a date.");
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Weekly Data Entry">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Store</label>
                <select value={storeId} onChange={e => setStoreId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                    {ALL_STORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Week Start Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {ALL_KPIS.map(kpi => (
                 <div key={kpi}>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{kpi} {kpi.includes('Cost') || kpi.includes('SOP') || kpi.includes('Score') ? '(%)' : ''}</label>
                    <input
                        type="number"
                        step="0.01"
                        value={getDisplayValue(kpi)}
                        onChange={(e) => handleChange(kpi, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
            ))}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
          <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">Save Data</button>
        </div>
      </div>
    </Modal>
  );
};
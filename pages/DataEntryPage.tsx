import React, { useState } from 'react';
import { ALL_STORES, ALL_KPIS, KPI_CONFIG } from '../constants';
import { Kpi, PerformanceData } from '../types';

interface DataEntryPageProps {
  onSave: (storeId: string, weekStartDate: Date, data: PerformanceData) => Promise<void>;
}

export const DataEntryPage: React.FC<DataEntryPageProps> = ({ onSave }) => {
  const [selectedStore, setSelectedStore] = useState<string>(ALL_STORES[0]);
  const [weekStartDate, setWeekStartDate] = useState<string>('');
  const [kpiValues, setKpiValues] = useState<Partial<{ [key in Kpi]: number | string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (kpi: Kpi, value: string) => {
    setKpiValues(prev => ({ ...prev, [kpi]: value }));
  };

  const handleSave = async () => {
    if (!selectedStore || !weekStartDate) {
      setError('Please select a store and a week start date.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const date = new Date(weekStartDate);
      // Adjust for timezone offset to ensure the date is saved as intended
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const correctedDate = new Date(date.getTime() + userTimezoneOffset);

      const dataToSave: PerformanceData = {};
      for (const kpi of ALL_KPIS) {
        const rawValue = kpiValues[kpi];
        const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;

        if (value !== undefined && !isNaN(value)) {
          if (KPI_CONFIG[kpi].format === 'percent') {
            dataToSave[kpi] = value / 100; // Convert from 18.5 to 0.185
          } else {
            dataToSave[kpi] = value;
          }
        }
      }

      if (Object.keys(dataToSave).length === 0) {
        throw new Error("No data entered. Please fill in at least one KPI value.");
      }

      await onSave(selectedStore, correctedDate, dataToSave);
      
      setSuccessMessage(`Data for ${selectedStore} for the week of ${correctedDate.toLocaleDateString()} saved successfully!`);
      setKpiValues({});
      
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to save data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">Manual Data Entry</h1>
          <p className="text-slate-400 mb-6">Quickly add or update weekly performance data for a specific store. Saving will overwrite any existing data for the selected week.</p>
          
          {successMessage && <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-300 rounded-md text-sm">{successMessage}</div>}
          {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="store-select" className="block text-sm font-medium text-slate-300 mb-1">Store</label>
              <select 
                id="store-select" 
                value={selectedStore} 
                onChange={e => setSelectedStore(e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {ALL_STORES.map(store => <option key={store} value={store}>{store}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="date-select" className="block text-sm font-medium text-slate-300 mb-1">Week Start Date</label>
              <input 
                id="date-select"
                type="date" 
                value={weekStartDate}
                onChange={e => setWeekStartDate(e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Enter KPI Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_KPIS.map(kpi => (
                <div key={kpi}>
                  <label htmlFor={`kpi-${kpi}`} className="block text-sm font-medium text-slate-400">{kpi}</label>
                  <input
                    id={`kpi-${kpi}`}
                    type="number"
                    step="any"
                    value={kpiValues[kpi] ?? ''}
                    onChange={e => handleInputChange(kpi, e.target.value)}
                    placeholder={KPI_CONFIG[kpi].format === 'percent' ? 'e.g., 18.5 for 18.5%' : 'e.g., 55000'}
                    className="mt-1 w-full bg-slate-900 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8 border-t border-slate-700 pt-6">
            <button
              onClick={() => { setKpiValues({}); setWeekStartDate(''); setSelectedStore(ALL_STORES[0]); setError(null); }}
              className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Clear Form
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading || !selectedStore || !weekStartDate}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20"
            >
              {isLoading ? 'Saving...' : 'Save Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
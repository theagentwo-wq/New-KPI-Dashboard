import React, { useState, useMemo } from 'react';
import { ALL_STORES, ALL_KPIS, KPI_CONFIG } from '../constants';
import { Kpi, PerformanceData, Period } from '../types';
import { ALL_PERIODS } from '../utils/dateUtils';

interface DataEntryPageProps {
  onSave: (storeId: string, period: Period, data: PerformanceData) => Promise<void>;
}

export const DataEntryPage: React.FC<DataEntryPageProps> = ({ onSave }) => {
  const [selectedStore, setSelectedStore] = useState<string>(ALL_STORES[0]);
  const [periodType, setPeriodType] = useState<'Week' | 'Month' | 'Quarter' | 'Year'>('Week');
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState<string>('');
  const [kpiValues, setKpiValues] = useState<Partial<{ [key in Kpi]: number | string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availablePeriods = useMemo(() => {
    return ALL_PERIODS.filter(p => p.type === periodType);
  }, [periodType]);

  React.useEffect(() => {
    if (availablePeriods.length > 0) {
      setSelectedPeriodLabel(availablePeriods[0].label);
    } else {
      setSelectedPeriodLabel('');
    }
  }, [availablePeriods]);

  const handleInputChange = (kpi: Kpi, value: string) => {
    setKpiValues(prev => ({ ...prev, [kpi]: value }));
  };

  const handleSave = async () => {
    if (!selectedStore || !selectedPeriodLabel) {
      setError('Please select a store and a period.');
      return;
    }

    const selectedPeriod = ALL_PERIODS.find(p => p.label === selectedPeriodLabel);
    if (!selectedPeriod) {
        setError('Invalid period selected.');
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const dataToSave: PerformanceData = {};
      for (const kpi of ALL_KPIS) {
        const rawValue = kpiValues[kpi];
        const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;

        if (value !== undefined && !isNaN(value)) {
          if (KPI_CONFIG[kpi].format === 'percent') {
            dataToSave[kpi] = value / 100;
          } else {
            dataToSave[kpi] = value;
          }
        }
      }

      if (Object.keys(dataToSave).length === 0) {
        throw new Error("No data entered. Please fill in at least one KPI value.");
      }

      await onSave(selectedStore, selectedPeriod, dataToSave);
      
      setSuccessMessage(`Data for ${selectedStore} for ${selectedPeriod.label} saved successfully!`);
      setKpiValues({});
      
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to save data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const periodTypes: ('Week' | 'Month' | 'Quarter' | 'Year')[] = ['Week', 'Month', 'Quarter', 'Year'];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">Manual Data Entry</h1>
          <p className="text-slate-400 mb-6">Enter data for a specific store and period. For longer periods (Month, Quarter, Year), totals will be distributed across the weeks within that period.</p>
          
          {successMessage && <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-300 rounded-md text-sm">{successMessage}</div>}
          {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
              <label htmlFor="period-type-select" className="block text-sm font-medium text-slate-300 mb-1">Period Type</label>
              <select 
                id="period-type-select"
                value={periodType}
                onChange={e => setPeriodType(e.target.value as any)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                 {periodTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="period-select" className="block text-sm font-medium text-slate-300 mb-1">Select Period</label>
              <select 
                id="period-select"
                value={selectedPeriodLabel}
                onChange={e => setSelectedPeriodLabel(e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {availablePeriods.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
              </select>
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
              onClick={() => { setKpiValues({}); setSelectedPeriodLabel(availablePeriods.length > 0 ? availablePeriods[0].label : ''); setSelectedStore(ALL_STORES[0]); setError(null); }}
              className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Clear Form
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading || !selectedStore || !selectedPeriodLabel}
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
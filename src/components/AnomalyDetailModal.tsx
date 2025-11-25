
import { Anomaly } from '../types';
import { X, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { KPI_CONFIG } from '../constants';

interface AnomalyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomaly: Anomaly | undefined;
}

export const AnomalyDetailModal: React.FC<AnomalyDetailModalProps> = ({ isOpen, onClose, anomaly }) => {
  if (!isOpen || !anomaly) return null;

  const kpiConfig = KPI_CONFIG[anomaly.kpi];
  
  const isPositive = anomaly.variance > 0;
  const isNegative = anomaly.variance < 0;

  const getIcon = () => {
    if (isPositive) return <TrendingUp className="text-green-400" />;
    if (isNegative) return <TrendingDown className="text-red-400" />;
    return <HelpCircle className="text-yellow-400" />;
  }

  const formatValue = (kpi: Anomaly['kpi'], value: number) => {
    const config = KPI_CONFIG[kpi];
    if(!config) return value;
    switch (config.format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg border border-slate-700 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
           onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3 p-2 bg-slate-900 rounded-full">
              {getIcon()}
            </div>
            <h2 className="text-lg font-bold text-white">Anomaly: {anomaly.storeId}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6">
          <p className="text-slate-300 mb-5 text-base leading-relaxed">{anomaly.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-5 bg-slate-900/50 p-4 rounded-md border border-slate-700">
            <div>
              <p className="text-slate-400">KPI</p>
              <p className="font-semibold text-white text-base">{anomaly.kpi}</p>
            </div>
            <div>
              <p className="text-slate-400">Period</p>
              <p className="font-semibold text-white text-base">{anomaly.periodLabel}</p>
            </div>
             <div>
              <p className="text-slate-400">Actual Value</p>
              <p className="font-semibold text-white text-base">{formatValue(anomaly.kpi, anomaly.value)}</p>
            </div>
            <div>
              <p className="text-slate-400">Expected Value</p>
              <p className="font-semibold text-white text-base">{formatValue(anomaly.kpi, anomaly.expected)}</p>
            </div>
            <div>
              <p className="text-slate-400">Variance</p>
              <div className={`flex items-center font-bold text-base ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-yellow-400'}`}>
                {anomaly.variance.toFixed(2)}{kpiConfig && kpiConfig.format === 'percent' ? '%' : ''}
                <span className="ml-2 text-xs font-normal text-slate-400">({isPositive ? 'Above' : isNegative ? 'Below' : 'Near'} Expectation)</span>
              </div>
            </div>
          </div>
          
          {anomaly.analysis && (
            <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Further Context</h3>
              <div className="prose prose-invert prose-sm max-w-none bg-slate-900/50 p-4 rounded-md border border-slate-700">
                <p>{anomaly.analysis}</p>
              </div>
            </div>
          )}

        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right rounded-b-lg">
            <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

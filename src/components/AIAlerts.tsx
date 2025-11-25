
import { Anomaly } from '../types';
import { AlertTriangle, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

interface AIAlertsProps {
  anomalies: Anomaly[];
  onSelectAnomaly: (anomaly: Anomaly) => void;
}

const getIcon = (variance: number) => {
    if (variance > 0) {
        return <TrendingUp className="text-green-400" />;
    } else if (variance < 0) {
        return <TrendingDown className="text-red-400" />;
    } else {
        return <HelpCircle className="text-yellow-400" />;
    }
}

export const AIAlerts: React.FC<AIAlertsProps> = ({ anomalies, onSelectAnomaly }) => {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="text-center text-slate-400 p-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-slate-500" />
        <h3 className="mt-4 text-lg font-medium text-white">No Anomalies Detected</h3>
        <p className="mt-1 text-sm text-slate-400">The system has not found any significant deviations from the norm in the selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {anomalies.map((anomaly, index) => (
        <button 
          key={index} 
          onClick={() => onSelectAnomaly(anomaly)}
          className="w-full text-left bg-slate-800 hover:bg-slate-700 p-3 rounded-lg transition-colors duration-150"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
                {getIcon(anomaly.variance)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                {anomaly.kpi} anomaly at {anomaly.storeId}
              </p>
              <p className="text-sm text-slate-400">
                {anomaly.summary}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

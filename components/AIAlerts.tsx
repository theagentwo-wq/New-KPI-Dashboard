import React from 'react';
import { Anomaly } from '../types';
import { Icon } from './Icon';

interface AIAlertsProps {
  anomalies: Anomaly[];
  onSelectAnomaly: (anomaly: Anomaly) => void;
}

export const AIAlerts: React.FC<AIAlertsProps> = ({ anomalies, onSelectAnomaly }) => {
  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
      <h2 className="text-lg font-bold text-cyan-400 mb-2">AI Alerts</h2>
      {anomalies.length === 0 ? (
        <p className="text-slate-400 text-sm">No significant anomalies detected for this period.</p>
      ) : (
        <div className="space-y-3">
          {anomalies.map(anomaly => (
            <div 
              key={anomaly.id} 
              className="bg-slate-900 p-3 rounded-md border border-slate-700 hover:border-cyan-500 cursor-pointer"
              onClick={() => onSelectAnomaly(anomaly)}
            >
              <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold text-slate-200">{anomaly.summary}</p>
                  <span className={`text-xs font-bold ${anomaly.deviation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {anomaly.deviation > 0 ? '▲' : '▼'} {Math.abs(anomaly.deviation)}%
                  </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{anomaly.location} - {anomaly.kpi}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
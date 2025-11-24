import React from 'react';
import { Modal } from './Modal';
import { Anomaly } from '../types';

interface AnomalyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomaly?: Anomaly;
}

export const AnomalyDetailModal: React.FC<AnomalyDetailModalProps> = ({ isOpen, onClose, anomaly }) => {
  if (!anomaly) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Anomaly Detail: ${anomaly.kpi} at ${anomaly.location}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-cyan-400">Summary</h3>
          <p className="text-slate-300">{anomaly.summary}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 bg-slate-900 p-3 rounded-md border border-slate-700">
            <div>
                <p className="text-sm text-slate-400">KPI</p>
                <p className="font-semibold text-slate-200">{anomaly.kpi}</p>
            </div>
             <div>
                <p className="text-sm text-slate-400">Deviation</p>
                <p className={`font-semibold ${anomaly.deviation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}%
                </p>
            </div>
             <div>
                <p className="text-sm text-slate-400">Location</p>
                <p className="font-semibold text-slate-200">{anomaly.location}</p>
            </div>
             <div>
                <p className="text-sm text-slate-400">Period</p>
                <p className="font-semibold text-slate-200">{anomaly.periodLabel}</p>
            </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-cyan-400">AI Root Cause Analysis</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{anomaly.analysis}</p>
        </div>
      </div>
    </Modal>
  );
};
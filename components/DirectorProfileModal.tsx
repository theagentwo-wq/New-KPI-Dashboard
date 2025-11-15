import React from 'react';
import { Modal } from './Modal';
import { DirectorProfile, Kpi } from '../types';

interface DirectorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  director?: DirectorProfile;
  performanceData?: any; // Data for the current period
  selectedKpi: Kpi;
}

export const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ isOpen, onClose, director, performanceData, selectedKpi }) => {
  if (!director) return null;

  const topStore = director.stores.reduce((best, current) => {
    const bestPerf = performanceData?.[best]?.actual?.[selectedKpi] ?? -Infinity;
    const currentPerf = performanceData?.[current]?.actual?.[selectedKpi] ?? -Infinity;
    return currentPerf > bestPerf ? current : best;
  }, director.stores[0]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={director.name}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <img src={director.photo} alt={director.name} className="w-32 h-32 rounded-full mx-auto" />
          <h3 className="text-center text-xl font-bold text-slate-200 mt-2">{director.name}</h3>
          <p className="text-center text-cyan-400">{director.title}</p>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-slate-300 mb-2">About</h4>
          <p className="text-slate-400 mb-4">{director.bio}</p>

          <h4 className="text-lg font-bold text-slate-300 mb-2">Managed Locations</h4>
          <div className="grid grid-cols-2 gap-1 text-sm text-slate-300 mb-4">
              {director.stores.map(store => <p key={store}>- {store}</p>)}
          </div>
          
          <div className="mt-4 p-4 bg-slate-900 rounded-md border border-slate-700">
            <h4 className="text-lg font-bold text-cyan-400 mb-2">Performance Spotlight</h4>
            <p className="text-slate-300">Top performing store for <span className="font-bold">{selectedKpi}</span> in this period:</p>
            <p className="text-2xl font-bold text-white mt-1">{topStore || 'N/A'}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
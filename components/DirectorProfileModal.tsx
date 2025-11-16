import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { DirectorProfile, Kpi, Period } from '../types';
import { getDirectorPerformanceSnapshot } from '../services/geminiService';
import { marked } from 'marked';
import { KPI_CONFIG } from '../constants';

interface DirectorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  director?: DirectorProfile;
  performanceData?: any;
  selectedKpi: Kpi;
  period: Period;
}

export const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ isOpen, onClose, director, performanceData, selectedKpi, period }) => {
  const [snapshot, setSnapshot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
        if (snapshot) {
            const html = await marked.parse(snapshot);
            setSanitizedHtml(html);
        } else {
            setSanitizedHtml('');
        }
    };
    renderMarkdown();
  }, [snapshot]);

  useEffect(() => {
    if (isOpen && director && performanceData) {
      const fetchSnapshot = async () => {
        setIsLoading(true);
        setSnapshot('');
        const dataForDirector = performanceData[director.name]?.aggregated;
        if (dataForDirector) {
          const result = await getDirectorPerformanceSnapshot(director.name, period.label, dataForDirector);
          setSnapshot(result);
        }
        setIsLoading(false);
      };
      fetchSnapshot();
    }
  }, [isOpen, director, performanceData, period]);

  if (!director) return null;

  const topStore = (director.stores && director.stores.length > 0) ? director.stores.reduce((best, current) => {
    if (!performanceData?.[current]?.actual) return best;
    if (!performanceData?.[best]?.actual) return current;

    const kpiConfig = KPI_CONFIG[selectedKpi];
    const bestPerf = performanceData[best].actual[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
    const currentPerf = performanceData[current].actual[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
    
    if (kpiConfig.higherIsBetter) {
      return currentPerf > bestPerf ? current : best;
    } else {
      return currentPerf < bestPerf ? current : best;
    }
  }, director.stores[0]) : 'N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${director.name} ${director.lastName}`}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 text-center">
          <img src={director.photo} alt={`${director.name} ${director.lastName}`} className="w-32 h-32 rounded-full mx-auto border-4 border-slate-700" />
          <h3 className="text-xl font-bold text-slate-200 mt-2">{`${director.name} ${director.lastName}`}</h3>
          <p className="text-cyan-400">{director.title}</p>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-lg font-bold text-slate-300 mb-2">About</h4>
            <p className="text-slate-400">{director.bio}</p>
          </div>

           <div>
            <h4 className="text-lg font-bold text-slate-300 mb-2">Contact Information</h4>
            <div className="text-sm space-y-1 text-slate-300 bg-slate-900/50 p-3 rounded-md border border-slate-700">
                <p><strong>Email:</strong> <a href={`mailto:${director.email}`} className="text-cyan-400 hover:underline">{director.email}</a></p>
                <p><strong>Phone:</strong> <a href={`tel:${director.phone}`} className="text-cyan-400 hover:underline">{director.phone}</a></p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-300 mb-2">Managed Locations</h4>
            <div className="grid grid-cols-2 gap-1 text-sm text-slate-300">
                {director.stores.map(store => <p key={store}>- {store}</p>)}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-slate-300 mb-2">Performance Highlight</h4>
            <p className="text-slate-400 text-sm">
              Top performing store for <span className="font-bold text-cyan-400">{selectedKpi}</span> this period:
              <span className="font-bold text-white block mt-1 text-base">{topStore}</span>
            </p>
          </div>

          <div className="mt-4 p-4 bg-slate-900 rounded-md border border-slate-700">
            <h4 className="text-lg font-bold text-cyan-400 mb-2">AI Performance Snapshot</h4>
            <div className="max-h-40 overflow-y-auto custom-scrollbar pr-2">
             {isLoading ? (
                <div className="flex items-center justify-center space-x-2 min-h-[100px]">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                    <p className="text-slate-400">Generating AI snapshot...</p>
                </div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: sanitizedHtml }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
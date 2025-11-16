import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { DirectorProfile, Kpi, Period, PerformanceData } from '../types';
import { getDirectorPerformanceSnapshot } from '../services/geminiService';
import { marked } from 'marked';
import { KPI_CONFIG } from '../constants';
import { Icon } from './Icon';

interface DirectorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  director?: DirectorProfile;
  directorAggregateData?: PerformanceData;
  directorStoreData?: { [storeId: string]: { actual: PerformanceData }};
  selectedKpi: Kpi;
  period: Period;
  onPhotoUpdate: (photoData: { directorId: string; base64Image: string }[]) => void;
}

export const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ isOpen, onClose, director, directorAggregateData, directorStoreData, selectedKpi, period, onPhotoUpdate }) => {
  const [snapshot, setSnapshot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  const [stagedPhoto, setStagedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStagedPhoto(null);
      setSnapshot('');
      setSanitizedHtml('');
    }
  }, [isOpen]);

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

  const handleGenerateSnapshot = async () => {
    if (!director || !directorAggregateData) return;
    setIsLoading(true);
    setSnapshot('');
    const result = await getDirectorPerformanceSnapshot(director.name, period.label, directorAggregateData);
    setSnapshot(result);
    setIsLoading(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setStagedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (stagedPhoto && director) {
      onPhotoUpdate([{ directorId: director.id, base64Image: stagedPhoto }]);
      setStagedPhoto(null);
    }
  };

  if (!director) return null;

  const topStore = (director.stores && director.stores.length > 0 && directorStoreData) ? director.stores.reduce((best, current) => {
    if (!directorStoreData?.[current]?.actual) return best;
    if (!directorStoreData?.[best]?.actual) return current;

    const kpiConfig = KPI_CONFIG[selectedKpi];
    const bestPerf = directorStoreData[best].actual[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
    const currentPerf = directorStoreData[current].actual[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
    
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
          <div className="relative group w-32 h-32 mx-auto">
            <img 
              src={stagedPhoto || director.photo} 
              alt={`${director.name} ${director.lastName}`} 
              className="w-32 h-32 rounded-full border-4 border-slate-700 object-cover"
            />
            <button 
              onClick={handlePhotoClick}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-300 cursor-pointer"
              aria-label="Change profile photo"
            >
              <Icon name="photo" className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif, image/webp"
              className="hidden"
            />
          </div>
          {stagedPhoto && (
            <div className="flex gap-2 justify-center mt-3">
              <button onClick={handleSaveChanges} className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1 px-3 rounded-md">Save</button>
              <button onClick={() => setStagedPhoto(null)} className="text-xs bg-slate-600 hover:bg-slate-700 text-white font-bold py-1 px-3 rounded-md">Cancel</button>
            </div>
          )}

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
                <p><strong>Home Location:</strong> {director.homeLocation}</p>
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
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-bold text-cyan-400">AI Performance Snapshot</h4>
                {(!isLoading && snapshot) && (
                    <button onClick={handleGenerateSnapshot} className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                        <Icon name="sparkles" className="w-4 h-4" />
                        Regenerate
                    </button>
                )}
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
             {isLoading ? (
                <div className="flex items-center justify-center space-x-2 min-h-[100px]">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                    <p className="text-slate-400">Generating AI snapshot...</p>
                </div>
              ) : sanitizedHtml ? (
                <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: sanitizedHtml }}></div>
              ) : (
                <div className="text-center py-4">
                    <p className="text-slate-400 mb-3">Get an AI-powered summary of this director's performance for the period.</p>
                    <button onClick={handleGenerateSnapshot} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2">
                        <Icon name="sparkles" className="w-5 h-5" />
                        Generate Snapshot
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

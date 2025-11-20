import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from './Modal';
import { DirectorProfile, Kpi, Period, PerformanceData, Deployment, Goal, StorePerformanceData, Budget } from '../types';
import { getDirectorPerformanceSnapshot } from '../services/geminiService';
import { marked } from 'marked';
import { KPI_CONFIG } from '../constants';
import { Icon } from './Icon';
import { DeploymentPlannerModal } from './DeploymentPlannerModal';
import { DeploymentMap } from './DeploymentMap';

interface DirectorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  director?: DirectorProfile;
  performanceData: StorePerformanceData[];
  budgets: Budget[];
  goals: Goal[];
  selectedKpi: Kpi;
  period: Period;
  onUpdatePhoto: (directorId: string, file: File) => Promise<string>;
  onUpdateContactInfo: (directorId: string, contactInfo: { email: string; phone: string }) => Promise<void>;
  deployments: Deployment[];
  onAddDeployment: (deploymentData: Omit<Deployment, 'id' | 'createdAt'>) => void;
}

type DeploymentTab = 'map' | 'timeline' | 'budget';

export const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ 
    isOpen, onClose, director, performanceData, budgets, goals, selectedKpi, period, 
    onUpdatePhoto, onUpdateContactInfo, deployments, onAddDeployment 
}) => {
  const [snapshot, setSnapshot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [activeDeploymentTab, setActiveDeploymentTab] = useState<DeploymentTab>('map');
  
  const directorDeployments = useMemo(() => {
    if (!director) return [];
    return deployments.filter(d => d.directorId === director.id);
  }, [deployments, director]);

  const directorGoals = useMemo(() => {
    if (!director) return [];
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.floor((new Date().getMonth() / 3)) + 1;
    return goals.filter(g => g.directorId === director.id && g.year === currentYear && g.quarter === currentQuarter);
  }, [goals, director]);

  const directorStoreData = useMemo(() => {
    if (!director) return [];
    return performanceData.filter(pd => director.stores.includes(pd.storeId));
  }, [performanceData, director]);

  const directorAggregateData = useMemo(() => {
    const data: PerformanceData = {};
    if (directorStoreData.length === 0) return data;
    
    for (const kpi of Object.values(Kpi)) {
        const kpiConfig = KPI_CONFIG[kpi];
        const values = directorStoreData.map(pd => pd.data[kpi]).filter(v => v !== undefined && !isNaN(v)) as number[];
        if (values.length > 0) {
            if (kpiConfig.format === 'currency') {
                data[kpi] = values.reduce((sum, v) => sum + v, 0);
            } else {
                data[kpi] = values.reduce((sum, v) => sum + v, 0) / values.length;
            }
        }
    }
    return data;
  }, [directorStoreData]);

  useEffect(() => {
    if (!isOpen) {
      setSnapshot('');
      setSanitizedHtml('');
      setUploadError(null);
      setIsEditingContact(false);
      setActiveDeploymentTab('map');
    } else if (director) {
      setEditEmail(director.email);
      setEditPhone(director.phone);
    }
  }, [isOpen, director]);

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !director) return;
    setIsUploading(true);
    setUploadError(null);
    try { await onUpdatePhoto(director.id, file); } 
    catch (error) { setUploadError(error instanceof Error ? error.message : "Upload failed."); } 
    finally { setIsUploading(false); }
  };

  const handleSaveContact = async () => {
    if (!director) return;
    await onUpdateContactInfo(director.id, { email: editEmail, phone: editPhone });
    setIsEditingContact(false);
  };
  
  const handleAddDeployment = (deploymentData: Omit<Deployment, 'id' | 'createdAt'>) => {
    onAddDeployment(deploymentData);
    setIsPlannerOpen(false);
  };

  if (!director) return null;

  const topStore = useMemo(() => {
    if (!directorStoreData || directorStoreData.length === 0) return 'N/A';
    
    // FIX: Provide an initial value to reduce() to prevent errors on empty or filtered-empty arrays.
    const initialValue = directorStoreData[0];

    const topPerformingStore = directorStoreData.reduce((best, current) => {
        const kpiConfig = KPI_CONFIG[selectedKpi];
        const bestPerf = best.data[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
        const currentPerf = current.data[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
        
        if (kpiConfig.higherIsBetter) {
            return currentPerf > bestPerf ? current : best;
        } else {
            return currentPerf < bestPerf ? current : best;
        }
    }, initialValue);

    return topPerformingStore.storeId;
  }, [directorStoreData, selectedKpi]);
  
  const getBudgetBarColor = (percentage: number) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const renderDeploymentContent = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const activeDeployments = directorDeployments.filter(d => new Date(d.startDate) <= now && new Date(d.endDate) >= now);
    const totalBudgetSpentThisYear = directorDeployments
        .filter(d => new Date(d.startDate).getFullYear() === currentYear)
        .reduce((sum, d) => sum + d.estimatedBudget, 0);
    const budgetPercentage = (totalBudgetSpentThisYear / director.yearlyTravelBudget) * 100;
    
    switch (activeDeploymentTab) {
      case 'map':
        return <DeploymentMap activeDeployments={activeDeployments} director={director} />;
      case 'timeline':
        return (
          <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            {directorDeployments.length > 0 ? directorDeployments.map(d => (
              <div key={d.id} className="text-xs p-2 bg-slate-800/50 rounded-md">
                <p className="font-bold text-slate-200">{d.deployedPerson === 'Director' ? director.name : d.deployedPerson} to {d.destination}</p>
                <p className="text-slate-400">{new Date(d.startDate).toLocaleDateString()} - {new Date(d.endDate).toLocaleDateString()}</p>
                <p className="text-slate-300 italic">Purpose: {d.purpose}</p>
              </div>
            )) : <p className="text-xs text-slate-400 text-center py-4">No deployments planned.</p>}
          </div>
        );
      case 'budget':
        return (
           <div className="p-4 flex items-center gap-4">
             <Icon name="budget" className="w-10 h-10 text-cyan-400 flex-shrink-0" />
             <div className="w-full">
                <div className="flex justify-between items-baseline mb-1">
                    <p className="text-xl font-bold text-white">
                        {totalBudgetSpentThisYear.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-slate-400">of {director.yearlyTravelBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</p>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className={`${getBudgetBarColor(budgetPercentage)} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(budgetPercentage, 100)}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 text-right mt-1">{`FY${currentYear} Travel Budget`}</p>
             </div>
           </div>
        );
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`${director.name} ${director.lastName}'s Hub`} size="large">
        <div className="flex flex-col md:flex-row gap-6">
            {/* --- LEFT COLUMN --- */}
            <div className="w-full md:w-1/3 space-y-4">
                {/* Profile Section */}
                <div className="text-center">
                    <div className="relative group w-32 h-32 mx-auto">
                        <img src={director.photo} alt={`${director.name} ${director.lastName}`} className="w-32 h-32 rounded-full border-4 border-slate-700 object-cover"/>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm"><Icon name="edit" className="w-4 h-4" /> Change</span>
                        </button>
                    </div>
                    <h3 className="text-xl font-bold text-slate-200 mt-2">{`${director.name} ${director.lastName}`}</h3>
                    <p className="text-cyan-400">{director.title}</p>
                </div>

                {/* Contact & Stores */}
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                    <h4 className="text-md font-bold text-slate-300">Details</h4>
                    <div className="text-sm space-y-1 text-slate-300">
                        <p><strong>Email:</strong> <a href={`mailto:${director.email}`} className="text-cyan-400 hover:underline">{director.email}</a></p>
                        <p><strong>Phone:</strong> <a href={`tel:${director.phone}`} className="text-cyan-400 hover:underline">{director.phone}</a></p>
                        <p><strong>Home:</strong> {director.homeLocation}</p>
                    </div>
                    <h4 className="text-md font-bold text-slate-300 pt-2 border-t border-slate-700">Region Stores</h4>
                    <div className="text-sm space-y-1 text-slate-300 max-h-24 overflow-y-auto custom-scrollbar pr-2">
                        {director.stores.map(store => <p key={store}>{store}</p>)}
                    </div>
                </div>
                
                {/* Goals & Performance */}
                 <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                     <h4 className="text-md font-bold text-slate-300">Goals & Performance</h4>
                      <div className="bg-slate-800 p-3 rounded-md">
                        <p className="text-xs text-slate-400 mb-1">Top Performing Store (by {selectedKpi})</p>
                        <p className="font-bold text-cyan-400 flex items-center gap-2"><Icon name="trophy" className="w-4 h-4" />{topStore}</p>
                      </div>
                      <div className="bg-slate-800 p-3 rounded-md">
                        <p className="text-xs text-slate-400 mb-1">Active Q{Math.floor((new Date().getMonth() / 3)) + 1} Goals</p>
                        {directorGoals.length > 0 ? (
                            <ul className="text-xs space-y-1">
                                {directorGoals.map(g => <li key={g.id} className="flex justify-between"><span>{g.kpi}:</span> <span className="font-bold text-white">{g.target}</span></li>)}
                            </ul>
                        ) : <p className="text-xs text-slate-500">No goals set.</p>}
                      </div>
                </div>

            </div>
            {/* --- RIGHT COLUMN --- */}
            <div className="w-full md:w-2/3 space-y-4">
                {/* Deployment Planner */}
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-bold text-slate-300">Deployments</h4>
                        <button onClick={() => setIsPlannerOpen(true)} className="flex items-center gap-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-3 rounded-md transition-colors">
                            <Icon name="plus" className="w-4 h-4" /> Plan New
                        </button>
                    </div>
                    <div className="flex border-b border-slate-700 mb-2">
                        <button onClick={() => setActiveDeploymentTab('map')} className={`flex-1 py-2 text-sm font-semibold ${activeDeploymentTab === 'map' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Map</button>
                        <button onClick={() => setActiveDeploymentTab('timeline')} className={`flex-1 py-2 text-sm font-semibold ${activeDeploymentTab === 'timeline' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Timeline</button>
                        <button onClick={() => setActiveDeploymentTab('budget')} className={`flex-1 py-2 text-sm font-semibold ${activeDeploymentTab === 'budget' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Budget</button>
                    </div>
                    <div>{renderDeploymentContent()}</div>
                </div>

                {/* AI Snapshot */}
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-bold text-cyan-400">AI Performance Snapshot</h4>
                        {(!isLoading && snapshot) && (<button onClick={handleGenerateSnapshot} className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300"><Icon name="sparkles" className="w-4 h-4" />Regenerate</button>)}
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center space-x-2 min-h-[100px]"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div><p className="text-slate-400">Generating AI snapshot...</p></div>
                    ) : sanitizedHtml ? (
                        <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: sanitizedHtml }}></div>
                    ) : (
                        <div className="text-center py-4"><p className="text-slate-400 mb-3">Get an AI-powered summary of this director's performance for {period.label}.</p><button onClick={handleGenerateSnapshot} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2"><Icon name="sparkles" className="w-5 h-5" />Generate Snapshot</button></div>
                    )}
                    </div>
                </div>
            </div>
        </div>
      </Modal>
      <DeploymentPlannerModal 
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        director={director}
        onAddDeployment={handleAddDeployment}
      />
    </>
  );
};
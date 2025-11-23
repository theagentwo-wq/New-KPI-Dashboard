
import React, { useState, useEffect, useMemo } from 'react';
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
  onUpdateDeployment: (deploymentId: string, updates: Partial<Omit<Deployment, 'id' | 'createdAt'>>) => void;
  onDeleteDeployment: (deploymentId: string) => void;
}

type DeploymentTab = 'map' | 'timeline' | 'budget';

export const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ 
    isOpen, onClose, director, performanceData, budgets, goals, selectedKpi, period, 
    onUpdatePhoto, onUpdateContactInfo, deployments, onAddDeployment, onUpdateDeployment, onDeleteDeployment
}) => {
  const [snapshot, setSnapshot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);

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
      setActiveDeploymentTab('map');
      setEditingDeployment(null);
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
  
  const handleOpenPlannerForCreate = () => {
    setEditingDeployment(null);
    setIsPlannerOpen(true);
  };
  
  const handleOpenPlannerForEdit = (deployment: Deployment) => {
    setEditingDeployment(deployment);
    setIsPlannerOpen(true);
  };

  const handleDeleteDeployment = (deploymentId: string) => {
    if (window.confirm("Are you sure you want to delete this deployment plan?")) {
      onDeleteDeployment(deploymentId);
    }
  };
  
  const topStore = useMemo(() => {
    if (!directorStoreData || directorStoreData.length === 0) {
      return 'N/A';
    }
    const kpiConfig = KPI_CONFIG[selectedKpi];
    const sortedStores = [...directorStoreData].sort((a, b) => {
        const aPerf = a.data[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
        const bPerf = b.data[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
        return kpiConfig.higherIsBetter ? bPerf - aPerf : aPerf - bPerf;
    });
    return sortedStores[0].storeId;
  }, [directorStoreData, selectedKpi]);

  if (!director) return null;
  
  const getBudgetBarColor = (percentage: number) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const renderDeploymentContent = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const activeDeployments = directorDeployments.filter(d => new Date(d.startDate) <= now && new Date(d.endDate) >= now);
    
    // Safe budget calculation
    const totalBudgetSpentThisYear = directorDeployments
        .filter(d => new Date(d.startDate).getFullYear() === currentYear)
        .reduce((sum, d) => sum + (d.estimatedBudget || 0), 0);
        
    // Default to 30000 if yearlyTravelBudget is missing on the profile
    const safeYearlyBudget = director.yearlyTravelBudget || 30000;
    const budgetPercentage = safeYearlyBudget > 0 ? (totalBudgetSpentThisYear / safeYearlyBudget) * 100 : 0;
    const remainingBudget = safeYearlyBudget - totalBudgetSpentThisYear;
    
    switch (activeDeploymentTab) {
      case 'map':
        return <DeploymentMap activeDeployments={activeDeployments} director={director} />;
      case 'timeline':
        return (
          <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            {directorDeployments.length > 0 ? directorDeployments.map(d => (
              <div key={d.id} className="text-xs p-2 bg-slate-800/50 rounded-md flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-200">{d.deployedPerson === 'Director' ? `${director.name} ${director.lastName}` : d.deployedPerson} to {d.destination}</p>
                    <p className="text-slate-400">{new Date(d.startDate).toLocaleDateString()} - {new Date(d.endDate).toLocaleDateString()}</p>
                    <p className="text-slate-300 italic">Purpose: {d.purpose}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-cyan-400 font-mono font-semibold">{(d.estimatedBudget || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</span>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleOpenPlannerForEdit(d)} className="text-slate-400 hover:text-white"><Icon name="edit" className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteDeployment(d.id)} className="text-slate-400 hover:text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
                    </div>
                </div>
              </div>
            )) : <p className="text-xs text-slate-400 text-center py-4">No deployments planned.</p>}
          </div>
        );
      case 'budget':
        return (
           <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-lg">
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-white">Travel Budget FY{currentYear}</h4>
                <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <Icon name="budget" className="w-6 h-6 text-cyan-400" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Spent</p>
                    <p className="text-2xl font-bold text-white">
                        {totalBudgetSpentThisYear.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Remaining</p>
                    <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {remainingBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                    </p>
                </div>
             </div>

             <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-cyan-300 bg-cyan-500/20">
                            Budget Utilization
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-slate-300">
                            {budgetPercentage.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-slate-700 border border-slate-600">
                    <div style={{ width: `${Math.min(budgetPercentage, 100)}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getBudgetBarColor(budgetPercentage)} transition-all duration-700 ease-out`}></div>
                </div>
                <p className="text-xs text-slate-500 text-center">
                    Total Budget: <span className="text-slate-300 font-medium">{safeYearlyBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</span>
                </p>
             </div>
           </div>
        );
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`${director.name} ${director.lastName}'s Hub`} size="large">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4">
                <div className="text-center">
                    <img src={director.photo} alt={`${director.name} ${director.lastName}`} className="w-32 h-32 rounded-full border-4 border-slate-700 object-cover mx-auto"/>
                    <h3 className="text-xl font-bold text-slate-200 mt-2">{`${director.name} ${director.lastName}`}</h3>
                    <p className="text-cyan-400">{director.title}</p>
                </div>

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
            <div className="w-full md:w-2/3 space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-bold text-slate-300">Deployments</h4>
                        <button onClick={handleOpenPlannerForCreate} className="flex items-center gap-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-3 rounded-md transition-colors">
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
        existingDeployment={editingDeployment}
        onAddDeployment={onAddDeployment}
        onUpdateDeployment={onUpdateDeployment}
      />
    </>
  );
};
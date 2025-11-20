import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from './Modal';
import { DirectorProfile, Kpi, Period, PerformanceData, Deployment, View } from '../types';
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
  directorAggregateData?: PerformanceData;
  directorStoreData?: { [storeId: string]: { actual: PerformanceData }};
  selectedKpi: Kpi;
  period: Period;
  onUpdatePhoto: (directorId: string, file: File) => Promise<string>;
  onUpdateContactInfo: (directorId: string, contactInfo: { email: string; phone: string }) => Promise<void>;
  deployments: Deployment[];
  onAddDeployment: (deploymentData: Omit<Deployment, 'id' | 'createdAt'>) => void;
}

type DeploymentTab = 'map' | 'timeline' | 'budget';

export const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ isOpen, onClose, director, directorAggregateData, directorStoreData, selectedKpi, period, onUpdatePhoto, onUpdateContactInfo, deployments, onAddDeployment }) => {
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
    setIsPlannerOpen(false); // Close planner on save
  };

  if (!director) return null;

  const topStore = (director.stores && director.stores.length > 0 && directorStoreData) ? director.stores.reduce((best, current) => {
    if (!directorStoreData?.[current]?.actual) return best;
    if (!directorStoreData?.[best]?.actual) return current;
    const kpiConfig = KPI_CONFIG[selectedKpi];
    const bestPerf = directorStoreData[best].actual[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
    const currentPerf = directorStoreData[current].actual[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
    return (kpiConfig.higherIsBetter ? currentPerf > bestPerf : currentPerf < bestPerf) ? current : best;
  }, director.stores[0]) : 'N/A';
  
  const renderDeploymentContent = () => {
    const now = new Date();
    const activeDeployments = directorDeployments.filter(d => new Date(d.startDate) <= now && new Date(d.endDate) >= now);
    const totalBudgetSpent = directorDeployments.reduce((sum, d) => sum + d.estimatedBudget, 0);
    const budgetPercentage = (totalBudgetSpent / director.quarterlyTravelBudget) * 100;
    
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
           <div className="p-4 text-center">
             <p className="text-xs text-slate-400">QTD Travel Spend</p>
             <p className="text-2xl font-bold text-white mt-1">
                {totalBudgetSpent.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
             </p>
             <p className="text-sm text-slate-400">of {director.quarterlyTravelBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} budget</p>
             <div className="w-full bg-slate-700 rounded-full h-2.5 mt-3">
               <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${Math.min(budgetPercentage, 100)}%` }}></div>
             </div>
           </div>
        );
    }
  };

  return (
    <>
        <Modal isOpen={isOpen} onClose={onClose} title={`${director.name} ${director.lastName}`} size="large">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4">
            {/* Profile Section */}
             <div className="text-center">
              <div className="relative group w-32 h-32 mx-auto">
                <img src={director.photo} alt={`${director.name} ${director.lastName}`} className="w-32 h-32 rounded-full border-4 border-slate-700 object-cover"/>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm"><Icon name="edit" className="w-4 h-4" /> Change</span>
                </button>
                {isUploading && (<div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-full"><svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>)}
              </div>
              {uploadError && <p className="text-xs text-red-400 mt-2">{uploadError}</p>}
              <h3 className="text-xl font-bold text-slate-200 mt-2">{`${director.name} ${director.lastName}`}</h3>
              <p className="text-cyan-400">{director.title}</p>
            </div>
            {/* Contact Info */}
             <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-slate-300">Contact</h4>
                    {!isEditingContact && (<button onClick={() => setIsEditingContact(true)} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 p-1 rounded-md hover:bg-slate-700"><Icon name="edit" className="w-3 h-3" /> Edit</button>)}
                </div>
                {isEditingContact ? (
                     <div className="text-sm space-y-3 text-slate-300 bg-slate-900/50 p-3 rounded-md border border-slate-700">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                            <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white text-sm" />
                        </div>
                        <div>
                             <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                             <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white text-sm" />
                        </div>
                         <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setIsEditingContact(false)} className="text-xs bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1 px-2 rounded-md">Cancel</button>
                            <button onClick={handleSaveContact} className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1 px-2 rounded-md">Save</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm space-y-1 text-slate-300 bg-slate-900/50 p-3 rounded-md border border-slate-700">
                        <p><strong>Email:</strong> <a href={`mailto:${director.email}`} className="text-cyan-400 hover:underline">{director.email}</a></p>
                        <p><strong>Phone:</strong> <a href={`tel:${director.phone}`} className="text-cyan-400 hover:underline">{director.phone}</a></p>
                        <p><strong>Home:</strong> {director.homeLocation}</p>
                    </div>
                )}
            </div>
          </div>
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
                    <div className="text-center py-4"><p className="text-slate-400 mb-3">Get an AI-powered summary of this director's performance.</p><button onClick={handleGenerateSnapshot} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2"><Icon name="sparkles" className="w-5 h-5" />Generate Snapshot</button></div>
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

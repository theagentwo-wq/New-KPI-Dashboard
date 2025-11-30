
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DirectorProfile, Deployment, Store, Goal, Period } from '../types';
import { DirectorInfo, RegionStores, GoalsAndPerformance, AIPerformanceSnapshot } from './DirectorProfileSubComponents';
import { DeploymentTimeline } from './DeploymentTimeline';
import { DeploymentBudget } from './DeploymentBudget';
import { DeploymentMap } from './DeploymentMap';
import { DeploymentPlannerModal } from './DeploymentPlannerModal';
import { getDeploymentsForDirector, createDeployment, updateDeployment, deleteDeployment, getPerformanceData, getGoals } from '../services/firebaseService';
import { getDirectorPerformanceSnapshot } from '../services/geminiService';

interface DirectorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  director: DirectorProfile | null;
}

export const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ isOpen, onClose, director }) => {
  const [activeTab, setActiveTab] = useState('map');
  const [isPlannerOpen, setPlannerOpen] = useState(false);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [deploymentToEdit, setDeploymentToEdit] = useState<Deployment | null>(null);
  const [topStore, setTopStore] = useState<Store | null>(null);
  const [topStoreMetrics, setTopStoreMetrics] = useState<{ sales: number; primeCost: number; sop: number } | null>(null);
  const [directorGoals, setDirectorGoals] = useState<Goal[]>([]);
  const [aiSnapshot, setAiSnapshot] = useState<string | null>(null);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false);
  const [localDirector, setLocalDirector] = useState<DirectorProfile | null>(director);

  // Update local director when prop changes
  useEffect(() => {
    setLocalDirector(director);
  }, [director]);

  const handleDirectorUpdate = (updates: Partial<DirectorProfile>) => {
    if (localDirector) {
      setLocalDirector({ ...localDirector, ...updates });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!localDirector) {
        setDeployments([]);
        setTopStore(null);
        setDirectorGoals([]);
        return;
      }

      console.log('[DirectorProfile] Fetching data for:', localDirector.id);

      // Fetch deployments
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Deployment fetch timed out after 5 seconds')), 5000);
        });
        const fetchPromise = getDeploymentsForDirector(localDirector.id);
        const deploymentsData = await Promise.race([fetchPromise, timeoutPromise]);
        console.log('[DirectorProfile] Deployments fetched:', deploymentsData.length);
        setDeployments(deploymentsData);
      } catch (error) {
        console.error('[DirectorProfile] Error fetching deployments:', error);
        setDeployments([]);
      }

      // Fetch top performing store and calculate metrics
      try {
        const storePerformanceData = await getPerformanceData();
        const directorStores = storePerformanceData.filter(d =>
          localDirector.stores.includes(d.storeId)
        );

        // Calculate totals per store
        const storesData = directorStores.reduce((acc, d) => {
          if (!acc[d.storeId]) {
            acc[d.storeId] = { sales: 0, primeCost: 0, sop: 0, count: 0 };
          }
          acc[d.storeId].sales += d.data.Sales || 0;
          acc[d.storeId].primeCost += (d.data['Prime Cost'] || 0);
          acc[d.storeId].sop += (d.data['SOP%'] || 0);
          acc[d.storeId].count += 1;
          return acc;
        }, {} as Record<string, { sales: number; primeCost: number; sop: number; count: number }>);

        // Find top store by sales and calculate averages
        const topStoreEntry = Object.entries(storesData).sort(([,a], [,b]) => b.sales - a.sales)[0];
        if (topStoreEntry) {
          const [topStoreId, metrics] = topStoreEntry;
          setTopStore({ id: topStoreId, name: topStoreId });
          setTopStoreMetrics({
            sales: metrics.sales,
            primeCost: metrics.primeCost / metrics.count, // Average
            sop: metrics.sop / metrics.count, // Average
          });
          console.log('[DirectorProfile] Top store:', topStoreId, metrics);
        }
      } catch (error) {
        console.error('[DirectorProfile] Error fetching top store:', error);
      }

      // Fetch goals
      try {
        const goals = await getGoals(localDirector.id);
        setDirectorGoals(goals);
        console.log('[DirectorProfile] Goals fetched:', goals.length);
      } catch (error) {
        console.error('[DirectorProfile] Error fetching goals:', error);
      }
    };

    fetchData();
  }, [localDirector]);

  if (!isOpen || !localDirector) return null;

  const handleOpenPlanner = (deployment?: Deployment) => {
    setDeploymentToEdit(deployment || null);
    setPlannerOpen(true);
  };

  const handleClosePlanner = () => {
    setPlannerOpen(false);
    setDeploymentToEdit(null);
  };

  const handleSaveDeployment = async (deploymentData: Partial<Deployment>, deploymentId?: string) => {
    console.log('[DirectorProfile] handleSaveDeployment called with:', deploymentData, deploymentId);
    try {
      if (deploymentId) {
        // Update existing deployment
        console.log('[DirectorProfile] Updating deployment...');
        await updateDeployment(deploymentId, deploymentData);
        console.log('[DirectorProfile] Update complete!');
      } else {
        // Create new deployment
        console.log('[DirectorProfile] Creating new deployment...');
        const result = await createDeployment(deploymentData as Omit<Deployment, 'id'>);
        console.log('[DirectorProfile] Create complete! Result:', result);
      }

      console.log('[DirectorProfile] Closing modal without refresh...');
      handleClosePlanner();

      // Refresh deployments list AFTER closing modal
      if (localDirector) {
        console.log('[DirectorProfile] Refreshing deployments list in background...');
        try {
          const deploymentsData = await getDeploymentsForDirector(localDirector.id);
          console.log('[DirectorProfile] Got deployments:', deploymentsData.length);
          setDeployments(deploymentsData);
          console.log('[DirectorProfile] Deployments refreshed!');
        } catch (refreshError) {
          console.error('[DirectorProfile] Error refreshing deployments:', refreshError);
          // Don't show alert since deployment was saved successfully
        }
      }

      console.log('[DirectorProfile] Deployment saved successfully!');
    } catch (error) {
      console.error('[DirectorProfile] Error saving deployment:', error);
      console.error('[DirectorProfile] Error details:', error);
      alert('Failed to save deployment. Please try again.');
    }
  };

  const handleDeleteDeployment = async (deploymentId: string) => {
    if(window.confirm('Are you sure you want to delete this deployment?')) {
      try {
        await deleteDeployment(deploymentId);

        // Refresh deployments list
        if (director) {
          const deploymentsData = await getDeploymentsForDirector(localDirector.id);
          setDeployments(deploymentsData);
        }
      } catch (error) {
        console.error('Error deleting deployment:', error);
        alert('Failed to delete deployment. Please try again.');
      }
    }
  };

  const handleGenerateSnapshot = async () => {
    if (!director) return;

    setIsLoadingSnapshot(true);
    setAiSnapshot(null);

    try {
      // Use current week period - W48 FY2025
      const period: Period = {
        label: `W48 FY2025`,
        type: 'weekly',
        startDate: new Date(2024, 10, 24), // Nov 24, 2024
        endDate: new Date(2024, 10, 30),   // Nov 30, 2024
        year: 2025,
        quarter: 4,
      };

      console.log('[DirectorProfile] Generating AI snapshot for:', localDirector.id);
      const response = await getDirectorPerformanceSnapshot(localDirector.id, period);

      console.log('[DirectorProfile] AI snapshot received:', response);
      setAiSnapshot(response.data);
    } catch (error) {
      console.error('[DirectorProfile] Error generating AI snapshot:', error);
      setAiSnapshot('Failed to generate performance snapshot. Please try again.');
    } finally {
      setIsLoadingSnapshot(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <DeploymentMap deployments={deployments} director={localDirector!} />;
      case 'timeline':
        return <DeploymentTimeline 
                    deployments={deployments} 
                    onEdit={handleOpenPlanner} 
                    onDelete={handleDeleteDeployment} 
                />;
      case 'budget':
        return <DeploymentBudget deployments={deployments} director={localDirector!} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-20 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl h-[75vh] flex flex-col relative border border-slate-700" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 left-3 text-slate-400 hover:text-white z-10 bg-slate-900/50 hover:bg-slate-900 rounded-full p-2 transition-colors" title="Close"><X size={20} /></button>

        <div className="grid grid-cols-1 md:grid-cols-3 h-full overflow-hidden">
          {/* LEFT PANEL - Director Info */}
          <div className="md:col-span-1 bg-slate-900/50 p-6 overflow-y-auto custom-scrollbar flex flex-col">
            <DirectorInfo director={localDirector} onUpdate={handleDirectorUpdate} />
            <RegionStores stores={localDirector.stores.map(s => ({id: s, name: s}))} />
            <GoalsAndPerformance
              director={localDirector}
              topStore={topStore}
              directorGoals={directorGoals}
              kpiData={null}
              topStoreMetrics={topStoreMetrics}
            />
          </div>

          {/* RIGHT PANEL - Deployments & AI Snapshot */}
          <div className="md:col-span-2 p-6 flex flex-col bg-slate-800 space-y-4">
            {/* Deployments Section */}
            <div className="flex flex-col flex-grow min-h-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Deployments</h2>
                <button onClick={() => handleOpenPlanner()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">
                  + Plan New
                </button>
              </div>

              <div className="border-b border-slate-700 mb-4">
                <nav className="-mb-px flex space-x-6">
                  <TabButton title="Map" isActive={activeTab === 'map'} onClick={() => setActiveTab('map')} />
                  <TabButton title="Timeline" isActive={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
                  <TabButton title="Budget" isActive={activeTab === 'budget'} onClick={() => setActiveTab('budget')} />
                </nav>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 flex-grow overflow-auto">
                {renderContent()}
              </div>
            </div>

            {/* AI Performance Snapshot Section */}
            <div className="flex-shrink-0">
              <AIPerformanceSnapshot
                director={director}
                topStore={topStore}
                directorGoals={directorGoals}
                kpiData={null}
                topStoreMetrics={topStoreMetrics}
                onGenerate={handleGenerateSnapshot}
                isLoading={isLoadingSnapshot}
                snapshotData={aiSnapshot}
              />
            </div>
          </div>
        </div>
      </div>

      {isPlannerOpen && (
        <DeploymentPlannerModal
          isOpen={isPlannerOpen}
          onClose={handleClosePlanner}
          director={localDirector!}
          onSave={handleSaveDeployment}
          deploymentToEdit={deploymentToEdit}
        />
      )}
    </div>
  );
};


const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
            ${isActive
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-300'
            }`}
    >
        {title}
    </button>
);
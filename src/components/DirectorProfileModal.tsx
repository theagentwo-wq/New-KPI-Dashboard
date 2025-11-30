
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DirectorProfile, Deployment } from '../types';
import DirectorSummary from './DirectorSummary';
import { DeploymentTimeline } from './DeploymentTimeline';
import { DeploymentBudget } from './DeploymentBudget';
import { DeploymentMap } from './DeploymentMap';
import { DeploymentPlannerModal } from './DeploymentPlannerModal';
import { getDeploymentsForDirector, createDeployment, updateDeployment, deleteDeployment } from '../services/firebaseService';

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

  useEffect(() => {
    const fetchDeployments = async () => {
      if (director) {
        console.log('[DirectorProfile] Starting to fetch deployments for:', director.id);
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Deployment fetch timed out after 5 seconds')), 5000);
          });

          const fetchPromise = getDeploymentsForDirector(director.id);
          const deploymentsData = await Promise.race([fetchPromise, timeoutPromise]);

          console.log('[DirectorProfile] Deployments fetched:', deploymentsData.length);
          setDeployments(deploymentsData);
        } catch (error) {
          console.error('[DirectorProfile] Error fetching deployments:', error);
          setDeployments([]);
        }
      } else {
        setDeployments([]);
      }
    };

    // Fetch in background, don't block modal opening
    fetchDeployments();
  }, [director]);

  if (!isOpen || !director) return null;

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
      if (director) {
        console.log('[DirectorProfile] Refreshing deployments list in background...');
        try {
          const deploymentsData = await getDeploymentsForDirector(director.id);
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
          const deploymentsData = await getDeploymentsForDirector(director.id);
          setDeployments(deploymentsData);
        }
      } catch (error) {
        console.error('Error deleting deployment:', error);
        alert('Failed to delete deployment. Please try again.');
      }
    }
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <DeploymentMap deployments={deployments} director={director} />;
      case 'timeline':
        return <DeploymentTimeline 
                    deployments={deployments} 
                    onEdit={handleOpenPlanner} 
                    onDelete={handleDeleteDeployment} 
                />;
      case 'budget':
        return <DeploymentBudget deployments={deployments} director={director} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-20 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col relative border border-slate-700" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white z-10"><X size={24} /></button>

        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          <div className="md:col-span-1 bg-slate-900/50 p-6 overflow-y-auto custom-scrollbar">
            <DirectorSummary director={director} />
          </div>

          <div className="md:col-span-2 p-6 flex flex-col bg-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Deployments</h2>
              <button onClick={() => handleOpenPlanner()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">
                + Plan New
              </button>
            </div>

            <div className="flex-grow flex flex-col">
                <div className="border-b border-slate-700 mb-4">
                    <nav className="-mb-px flex space-x-6">
                        <TabButton title="Map" isActive={activeTab === 'map'} onClick={() => setActiveTab('map')} />
                        <TabButton title="Timeline" isActive={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
                        <TabButton title="Budget" isActive={activeTab === 'budget'} onClick={() => setActiveTab('budget')} />
                    </nav>
                </div>
                <div className="flex-grow bg-slate-900/50 rounded-lg p-4">
                    {renderContent()}
                </div>
            </div>

          </div>
        </div>
      </div>

      {isPlannerOpen && (
        <DeploymentPlannerModal
          isOpen={isPlannerOpen}
          onClose={handleClosePlanner}
          director={director}
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
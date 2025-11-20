import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { DirectorProfile, Deployment } from '../types';

interface DeploymentPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  director: DirectorProfile;
  existingDeployment: Deployment | null;
  onAddDeployment: (deploymentData: Omit<Deployment, 'id' | 'createdAt'>) => void;
  onUpdateDeployment: (deploymentId: string, updates: Partial<Omit<Deployment, 'id' | 'createdAt'>>) => void;
}

export const DeploymentPlannerModal: React.FC<DeploymentPlannerModalProps> = ({ 
  isOpen, onClose, director, existingDeployment, onAddDeployment, onUpdateDeployment 
}) => {
  const [deployedPersonType, setDeployedPersonType] = useState<'Director' | 'Strike Team'>('Director');
  const [strikeTeamName, setStrikeTeamName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!existingDeployment;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // Pre-fill form for editing
        const isDirector = existingDeployment.deployedPerson === 'Director';
        setDeployedPersonType(isDirector ? 'Director' : 'Strike Team');
        setStrikeTeamName(isDirector ? '' : existingDeployment.deployedPerson);
        setDestination(existingDeployment.destination);
        setStartDate(existingDeployment.startDate.split('T')[0]);
        setEndDate(existingDeployment.endDate.split('T')[0]);
        setPurpose(existingDeployment.purpose);
        setEstimatedBudget(String(existingDeployment.estimatedBudget));
      } else {
        // Reset form for creating
        setDeployedPersonType('Director');
        setStrikeTeamName('');
        setDestination(director.stores[0] || '');
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        setPurpose('');
        setEstimatedBudget('');
      }
      setError(null);
    }
  }, [isOpen, existingDeployment, director]);

  const handleSubmit = () => {
    setError(null);
    if (!destination || !startDate || !endDate || !purpose || !estimatedBudget) {
      setError('All fields are required.');
      return;
    }
    const deployedPerson = deployedPersonType === 'Director' ? 'Director' : strikeTeamName;
    if (deployedPersonType === 'Strike Team' && !strikeTeamName.trim()) {
        setError("Please enter the Strike Team member's name.");
        return;
    }

    const deploymentData = {
      directorId: director.id,
      deployedPerson,
      destination,
      startDate,
      endDate,
      purpose,
      estimatedBudget: parseFloat(estimatedBudget) || 0,
    };

    if (isEditMode) {
      onUpdateDeployment(existingDeployment.id, deploymentData);
    } else {
      onAddDeployment(deploymentData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Deployment Plan' : `New Deployment for ${director.name}'s Region`}>
      <div className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Who is being deployed?</label>
          <select value={deployedPersonType} onChange={e => setDeployedPersonType(e.target.value as any)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
            <option value="Director">{director.name} {director.lastName}</option>
            <option value="Strike Team">Strike Team Member</option>
          </select>
        </div>
        {deployedPersonType === 'Strike Team' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Team Member Name(s)</label>
            <input type="text" value={strikeTeamName} onChange={e => setStrikeTeamName(e.target.value)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., John Doe" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Destination</label>
          <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
            {director.stores.map(store => <option key={store} value={store}>{store}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Purpose</label>
          <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., Manager shift cover" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Estimated Budget</label>
          <input type="number" value={estimatedBudget} onChange={e => setEstimatedBudget(e.target.value)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 1500" />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
          <button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">
            {isEditMode ? 'Save Changes' : 'Save Deployment Plan'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
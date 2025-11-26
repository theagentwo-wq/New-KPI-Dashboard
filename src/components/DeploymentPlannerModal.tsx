
import React, { useState, useEffect } from 'react';
import { DirectorProfile, Deployment, DeploymentType } from '../types';
import { X, MapPin, Calendar, DollarSign, Briefcase, Info } from 'lucide-react';
import { MultiSelect } from 'react-multi-select-component';

interface DeploymentPlannerModalProps {
  isOpen: boolean;
  director: DirectorProfile | null;
  onClose: () => void;
  onSave: (deployment: Omit<Deployment, 'id' | 'createdAt' | 'deployedPerson' | 'destination' | 'purpose'>) => void;
}

const deploymentTypes = Object.values(DeploymentType);

export const DeploymentPlannerModal: React.FC<DeploymentPlannerModalProps> = ({ isOpen, director, onClose, onSave }) => {
    const [type, setType] = useState<DeploymentType>(DeploymentType.Training);
    const [selectedStores, setSelectedStores] = useState<{ label: string; value: string; }[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [estimatedBudget, setEstimatedBudget] = useState(0);
    
    useEffect(() => {
        if (director) {
            // Reset form when director changes or modal opens
            setType(DeploymentType.Training);
            setSelectedStores([]);
            setStartDate('');
            setEndDate('');
            setDescription('');
            setEstimatedBudget(0);
        }
    }, [director, isOpen]);

    if (!isOpen || !director) return null;
    
    const storeOptions = director.stores.map(s => ({ label: s, value: s }));

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const newDeployment: Omit<Deployment, 'id' | 'createdAt' | 'deployedPerson' | 'destination' | 'purpose'> = {
            directorId: director.id,
            type,
            stores: selectedStores.map(s => s.value),
            startDate,
            endDate,
            description,
            estimatedBudget,
            status: 'Planned'
        };
        onSave(newDeployment);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
            <form onSubmit={handleSave} className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white">New Deployment Plan</h2>
                        <p className="text-sm text-slate-400">For {director.name} {director.lastName}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>
                
                <div className="p-6 space-y-5 overflow-y-auto">
                    <div className="flex items-center gap-4">
                        <Briefcase className="text-cyan-400" size={20}/>
                        <div className="flex-1">
                             <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-1">Deployment Type</label>
                             <select id="type" value={type} onChange={e => setType(e.target.value as DeploymentType)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white">
                                {deploymentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <MapPin className="text-cyan-400 mt-2" size={20}/>
                        <div className="flex-1">
                             <label className="block text-sm font-medium text-slate-300 mb-1">Affected Stores</label>
                             <MultiSelect
                                options={storeOptions}
                                value={selectedStores}
                                onChange={setSelectedStores}
                                labelledBy="Select Stores"
                                className="text-white"
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="flex items-center gap-4">
                            <Calendar className="text-cyan-400" size={20}/>
                            <div className="flex-1">
                                <label htmlFor="startDate" className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                                <input id="startDate" type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2"/>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <Calendar className="text-cyan-400" size={20}/>
                             <div className="flex-1">
                                <label htmlFor="endDate" className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                                <input id="endDate" type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2"/>
                             </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <DollarSign className="text-cyan-400" size={20}/>
                        <div className="flex-1">
                            <label htmlFor="budget" className="block text-sm font-medium text-slate-300 mb-1">Estimated Budget</label>
                            <input id="budget" type="number" value={estimatedBudget} onChange={e => setEstimatedBudget(Number(e.target.value))} className="w-full bg-slate-700 border-slate-600 rounded-md p-2" placeholder="e.g., 5000"/>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <Info className="text-cyan-400 mt-2" size={20}/>
                        <div className="flex-1">
                            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Mission & Description</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2" rows={4} placeholder="Describe the goals and expected outcomes of this deployment..."></textarea>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3 sticky bottom-0 z-10">
                    <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">
                        Save Deployment Plan
                    </button>
                </div>
            </form>
        </div>
    );
};

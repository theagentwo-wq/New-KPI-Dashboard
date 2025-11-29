
import React, { useState, useEffect, Fragment } from 'react';
import DatePicker from 'react-datepicker';
import { Listbox, Transition } from '@headlessui/react';
import { DirectorProfile, Deployment, DeploymentType } from '../types';
import { X, Check, ChevronsUpDown, Calendar as CalendarIcon } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

interface DeploymentPlannerModalProps {
  isOpen: boolean;
  director: DirectorProfile | null;
  onClose: () => void;
  onSave: (deployment: Partial<Deployment>, deploymentId?: string) => void;
  deploymentToEdit: Deployment | null;
}

const DEPLOYMENT_PERSON_OPTIONS = [
    { id: 'director', name: 'Director' },
    { id: 'strikeTeam', name: 'Strike Team Member' },
];

const DEPLOYMENT_TYPE_OPTIONS = [
    { id: DeploymentType.Training, name: 'Training' },
    { id: DeploymentType.Mentorship, name: 'Mentorship' },
    { id: DeploymentType.PerformanceTurnaround, name: 'Performance Turnaround' },
];

export const DeploymentPlannerModal: React.FC<DeploymentPlannerModalProps> = ({ isOpen, director, onClose, onSave, deploymentToEdit }) => {
    const [deploymentPersonType, setDeploymentPersonType] = useState(DEPLOYMENT_PERSON_OPTIONS[0]);
    const [deploymentType, setDeploymentType] = useState(DEPLOYMENT_TYPE_OPTIONS[0]);
    const [strikeTeamMember, setStrikeTeamMember] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [purpose, setPurpose] = useState('');
    const [estimatedBudget, setEstimatedBudget] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (deploymentToEdit) {
                const isDirectorDeployed = deploymentToEdit.deployedPerson === director?.name;
                setDeploymentPersonType(isDirectorDeployed ? DEPLOYMENT_PERSON_OPTIONS[0] : DEPLOYMENT_PERSON_OPTIONS[1]);
                const typeOption = DEPLOYMENT_TYPE_OPTIONS.find(opt => opt.id === deploymentToEdit.type) || DEPLOYMENT_TYPE_OPTIONS[0];
                setDeploymentType(typeOption);
                setStrikeTeamMember(isDirectorDeployed ? '' : deploymentToEdit.deployedPerson);
                setDestination(deploymentToEdit.destination);
                setStartDate(new Date(deploymentToEdit.startDate));
                setEndDate(new Date(deploymentToEdit.endDate));
                setPurpose(deploymentToEdit.purpose);
                setEstimatedBudget(String(deploymentToEdit.estimatedBudget));
            } else if (director) {
                // Reset to default for new deployment
                setDeploymentPersonType(DEPLOYMENT_PERSON_OPTIONS[0]);
                setDeploymentType(DEPLOYMENT_TYPE_OPTIONS[0]);
                setStrikeTeamMember('');
                setDestination(director.stores[0] || '');
                setStartDate(undefined);
                setEndDate(undefined);
                setPurpose('');
                setEstimatedBudget('');
            }
        }
    }, [deploymentToEdit, director, isOpen]);

    if (!isOpen || !director) return null;

    const storeOptions = director.stores;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[DeploymentPlanner] handleSave called');
        const deployedPerson = deploymentPersonType.id === 'director' ? director.name : strikeTeamMember;

        if (deploymentPersonType.id === 'strikeTeam' && !strikeTeamMember) {
            alert('Please enter the name of the Strike Team Member.');
            return;
        }
        if (!startDate || !endDate) {
            alert('Please select a start and end date.');
            return;
        }

        const deploymentData: Partial<Deployment> = {
            directorId: director.id,
            type: deploymentType.id,
            deployedPerson,
            destination,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            purpose,
            estimatedBudget: Number(estimatedBudget),
            stores: [destination],
            description: purpose,
        };

        console.log('[DeploymentPlanner] Calling onSave with data:', deploymentData);
        onSave(deploymentData, deploymentToEdit?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">New Deployment for {director.firstName}'s Region</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                    {/* Deployed Person Dropdown */}
                    <div>
                        <Listbox value={deploymentPersonType} onChange={setDeploymentPersonType}>
                            <div className="relative">
                                <Listbox.Label className="block text-sm font-medium text-slate-300 mb-1">Who is being deployed?</Listbox.Label>
                                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-slate-700 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span className="block truncate text-white">{deploymentPersonType.id === 'director' ? director.name : 'Strike Team Member'}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                        <Listbox.Option key="director" value={{id: 'director'}} className={({ active }) =>`relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>
                                            {({ selected }) => (
                                                <><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{director.name}</span>{selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400"><Check className="h-5 w-5" aria-hidden="true" /></span> : null}</>
                                            )}
                                        </Listbox.Option>
                                        <Listbox.Option key="strikeTeam" value={{id: 'strikeTeam'}} className={({ active }) =>`relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>
                                            {({ selected }) => (
                                                <><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                    Strike Team Member</span>{selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400"><Check className="h-5 w-5" aria-hidden="true" /></span> : null}</>
                                            )}
                                        </Listbox.Option>
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>

                    {deploymentPersonType.id === 'strikeTeam' && (
                        <div>
                            <label htmlFor="strikeTeamMember" className="block text-sm font-medium text-slate-300 mb-1">Strike Team Member Name</label>
                            <input id="strikeTeamMember" type="text" required value={strikeTeamMember} onChange={e => setStrikeTeamMember(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white" placeholder="Enter name" />
                        </div>
                    )}

                    {/* Deployment Type Dropdown */}
                    <div>
                        <Listbox value={deploymentType} onChange={setDeploymentType}>
                            <div className="relative">
                                <Listbox.Label className="block text-sm font-medium text-slate-300 mb-1">Deployment Type</Listbox.Label>
                                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-slate-700 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span className="block truncate text-white">{deploymentType.name}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                        {DEPLOYMENT_TYPE_OPTIONS.map((option) => (
                                            <Listbox.Option key={option.id} value={option} className={({ active }) =>`relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>
                                                {({ selected }) => (
                                                    <><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.name}</span>{selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400"><Check className="h-5 w-5" aria-hidden="true" /></span> : null}</>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>

                    {/* Destination Dropdown */}
                    <div>
                         <Listbox value={destination} onChange={setDestination}>
                            <div className="relative">
                                <Listbox.Label className="block text-sm font-medium text-slate-300 mb-1">Destination</Listbox.Label>
                                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-slate-700 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span className="block truncate text-white">{destination}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                        {storeOptions.map((store, storeIdx) => (
                                            <Listbox.Option key={storeIdx} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-cyan-600 text-white' : 'text-slate-300'}`} value={store}>
                                                {({ selected }) => (
                                                    <><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{store}</span>{selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400"><Check className="h-5 w-5" aria-hidden="true" /></span> : null}</>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>

                    {/* Date Pickers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                            <div className="relative">
                               <DatePicker
                                    selected={startDate}
                                    onChange={(date: Date | null) => setStartDate(date || undefined)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white"
                                    calendarClassName="bg-slate-700 text-white"
                                    wrapperClassName="w-full"
                                    popperClassName="z-30"
                                    customInput={<CustomDateInput />}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                             <div className="relative">
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date: Date | null) => setEndDate(date || undefined)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white"
                                    calendarClassName="bg-slate-700 text-white"
                                    wrapperClassName="w-full"
                                    popperClassName="z-30"
                                    customInput={<CustomDateInput />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Other fields */}
                    <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-slate-300 mb-1">Purpose</label>
                        <textarea id="purpose" required value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white" rows={3} placeholder="e.g., Manager shift cover"></textarea>
                    </div>
                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-slate-300 mb-1">Estimated Budget</label>
                        <input id="budget" type="number" required value={estimatedBudget} onChange={e => setEstimatedBudget(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white" placeholder="e.g., 1500" />
                    </div>

                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3 sticky bottom-0 z-10 -m-6 mt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">
                            {deploymentToEdit ? 'Update' : 'Save'} Deployment Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CustomDateInput = React.forwardRef(({ value, onClick }: any, ref: any) => (
    <button type="button" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white text-left flex justify-between items-center" onClick={onClick} ref={ref}>
        {value || <span className="text-slate-400">Select date</span>}
        <CalendarIcon className="h-5 w-5 text-slate-400" />
    </button>
));

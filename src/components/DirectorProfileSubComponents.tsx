
import React, { useState, useRef } from 'react';
import { DirectorProfile, Store, Goal, Kpi } from '../types';
import { Trophy, TrendingUp, Edit2, Save, X, Upload } from 'lucide-react';
import { updateDirectorProfile, uploadFile } from '../services/firebaseService';
import { KPI_CONFIG } from '../constants';

// Re-exporting DirectorProfileModalProps to avoid circular dependencies
// A better long-term solution would be to define this in a shared types file.
interface DirectorProfileModalProps {
    director: DirectorProfile | null;
    topStore: Store | null;
    directorGoals: Goal[];
    kpiData: any;
    topStoreMetrics?: {
        sales: number;
        primeCost: number;
        sop: number;
    } | null;
}

export const DirectorInfo: React.FC<{ director: DirectorProfile; onUpdate: (updates: Partial<DirectorProfile>) => void }> = ({ director, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        email: director.email,
        phone: director.phone,
    });
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        try {
            await updateDirectorProfile(director.id, editedData);
            onUpdate(editedData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating director profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleCancel = () => {
        setEditedData({
            email: director.email,
            phone: director.phone,
        });
        setIsEditing(false);
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be smaller than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadFile(file, (progress) => {
                console.log('Upload progress:', progress);
            });
            await updateDirectorProfile(director.id, { photo: result.fileUrl });
            onUpdate({ photo: result.fileUrl });
            setIsUploading(false);
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Failed to upload photo. Please try again.');
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 w-32 h-32 -m-2">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-400 opacity-20 blur-md"></div>
                </div>
                {/* Director photo */}
                <img
                    src={director.photo}
                    alt={director.name}
                    className="relative w-28 h-28 rounded-full border-4 border-cyan-400 object-cover shadow-lg z-10"
                />
                {/* Photo edit button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 z-20 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                    title="Upload new photo"
                >
                    {isUploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Upload size={16} />
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                />
            </div>
            <h2 className="text-2xl font-bold text-white">{director.name}</h2>
            <p className="text-md text-cyan-300">{director.title}</p>
            <div className="mt-4 text-left bg-slate-900/50 p-4 rounded-lg w-full text-sm">
                <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                    <h3 className="font-semibold text-slate-300 text-base">Details</h3>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-cyan-400 hover:text-cyan-300 p-1"
                            title="Edit details"
                        >
                            <Edit2 size={16} />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="text-green-400 hover:text-green-300 p-1"
                                title="Save changes"
                            >
                                <Save size={16} />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Cancel"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>
                {isEditing ? (
                    <>
                        <div className="mb-2">
                            <label className="text-slate-300 font-medium text-xs">Email:</label>
                            <input
                                type="email"
                                value={editedData.email}
                                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-cyan-400 text-sm mt-1"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="text-slate-300 font-medium text-xs">Phone:</label>
                            <input
                                type="tel"
                                value={editedData.phone}
                                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-300 text-sm mt-1"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-slate-400 mb-1">
                            <strong className="font-medium text-slate-300">Email:</strong>{' '}
                            <a href={`mailto:${director.email}`} className='text-cyan-400 hover:underline'>{director.email}</a>
                        </p>
                        <p className="text-slate-400 mb-1">
                            <strong className="font-medium text-slate-300">Phone:</strong> {director.phone}
                        </p>
                    </>
                )}
                <p className="text-slate-400">
                    <strong className="font-medium text-slate-300">Home:</strong> {director.homeLocation}
                </p>
            </div>
        </div>
    );
};

export const RegionStores: React.FC<{ stores: {id: string, name: string}[] }> = ({ stores }) => (
    <div className="mb-6 bg-slate-900/50 p-4 rounded-lg w-full text-sm">
        <h3 className="font-semibold text-slate-300 text-base mb-3 border-b border-slate-700 pb-2">Region Stores</h3>
        <div className="max-h-24 overflow-y-auto custom-scrollbar pr-2">
            {stores.map(store => (
                <p key={store.id} className="text-slate-400 py-1">{store.name}</p>
            ))}
        </div>
    </div>
);

export const GoalsAndPerformance: React.FC<DirectorProfileModalProps> = ({ topStore, directorGoals, topStoreMetrics }) => {
    const formatGoalValue = (kpi: Kpi, value: number) => {
        const config = KPI_CONFIG[kpi];
        if (!config) return value.toFixed(1);

        if (config.format === 'percent') {
            return `${(value * 100).toFixed(1)}%`;
        } else if (config.format === 'currency') {
            return `$${(value / 1000).toFixed(0)}k`;
        } else {
            return value.toFixed(1);
        }
    };

    // Group goals by quarter
    const currentYear = new Date().getFullYear();
    const goalsByQuarter = directorGoals.reduce((acc, goal) => {
        if (goal.year === currentYear) {
            const key = `Q${goal.quarter}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(goal);
        }
        return acc;
    }, {} as Record<string, Goal[]>);

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg w-full text-sm flex-grow">
            <h3 className="font-semibold text-slate-300 text-base mb-3 border-b border-slate-700 pb-2">Goals & Performance</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-slate-400 mb-2 flex items-center"><Trophy size={16} className="mr-2 text-yellow-400"/>Top Performing Store (by Sales)</h4>
                    <div className="bg-slate-800 p-3 rounded-md">
                        {topStore ? (
                            <>
                                <p className='font-bold text-cyan-400 text-center text-lg mb-2'>{topStore.name}</p>
                                {topStoreMetrics && (
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div>
                                            <p className="text-slate-500">Sales</p>
                                            <p className="text-green-400 font-semibold">${(topStoreMetrics.sales / 1000).toFixed(0)}k</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Prime Cost</p>
                                            <p className="text-blue-400 font-semibold">{(topStoreMetrics.primeCost * 100).toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">SOP%</p>
                                            <p className="text-yellow-400 font-semibold">{(topStoreMetrics.sop * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className='text-slate-500 text-center text-xs'>Data unavailable</p>
                        )}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-400 mb-2">Active {currentYear} Goals</h4>
                    <div className="space-y-2">
                        {Object.keys(goalsByQuarter).length > 0 ? (
                            Object.keys(goalsByQuarter).sort().map(quarter => (
                                <div key={quarter} className="bg-slate-800 p-2 rounded-md">
                                    <p className="text-cyan-400 font-semibold text-xs mb-1">{quarter}</p>
                                    {goalsByQuarter[quarter].map(goal => (
                                        <div key={goal.id} className="text-xs text-slate-300 ml-2">
                                            - {goal.kpi}: <span className="text-cyan-400 font-semibold">{formatGoalValue(goal.kpi, goal.target)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-slate-500 p-3 bg-slate-800 rounded-md text-center">No goals set for {currentYear}.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface AIPerformanceSnapshotProps extends DirectorProfileModalProps {
    onGenerate?: () => void;
    isLoading?: boolean;
    snapshotData?: string | null;
}

export const AIPerformanceSnapshot: React.FC<AIPerformanceSnapshotProps> = ({
    onGenerate,
    isLoading = false,
    snapshotData = null
}) => (
    <div className="bg-slate-900/50 p-6 rounded-lg w-full">
        <h3 className="font-semibold text-cyan-400 text-lg mb-3">AI Performance Snapshot</h3>

        {!snapshotData && !isLoading && (
            <>
                <p className="text-slate-400 text-center mb-4 text-sm">
                    Get an AI-powered summary of this director's performance for W48 FY2025 (Nov 24).
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={onGenerate}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md text-sm flex items-center transition-colors"
                    >
                        <TrendingUp size={16} className="mr-2"/> Generate Snapshot
                    </button>
                </div>
            </>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
                <p className="text-slate-400 text-sm">Generating AI snapshot...</p>
            </div>
        )}

        {snapshotData && !isLoading && (
            <div className="mt-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                            {snapshotData}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mt-4">
                    <button
                        onClick={onGenerate}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm flex items-center transition-colors"
                    >
                        <TrendingUp size={16} className="mr-2"/> Regenerate
                    </button>
                </div>
            </div>
        )}
    </div>
);

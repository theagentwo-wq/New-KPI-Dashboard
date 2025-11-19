import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { ActiveAnalysisJob } from './StrategyHubModal';

interface AnalysisStatusIndicatorProps {
  job: ActiveAnalysisJob;
  onExpand: () => void;
  onDismiss: () => void;
}

export const AnalysisStatusIndicator: React.FC<AnalysisStatusIndicatorProps> = ({ job, onExpand, onDismiss }) => {
    const isFinished = job.status === 'complete' || job.status === 'error';
    const hasErrors = job.status === 'error';

    let statusText = 'Analysis in progress...';
    if (isFinished) {
        statusText = hasErrors ? 'Analysis failed' : 'Analysis complete';
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
        >
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl text-slate-200 w-80 overflow-hidden">
                <div className="p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {!isFinished ? (
                                <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : hasErrors ? (
                                <Icon name="info" className="w-5 h-5 text-red-400 flex-shrink-0" />
                            ) : (
                                <Icon name="brain" className="w-5 h-5 text-green-400 flex-shrink-0" />
                            )}
                            <div>
                                <p className="font-semibold text-sm">{statusText}</p>
                                <p className="text-xs text-slate-400 truncate max-w-40">{job.fileName || 'Strategy Hub Analysis'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={onExpand} className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white text-sm font-semibold">
                                Details
                            </button>
                            {isFinished && (
                                <button onClick={onDismiss} className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white">
                                    <Icon name="x" className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {(!isFinished) && (
                    <div className="w-full bg-slate-700 h-1 relative overflow-hidden">
                      <div className="bg-cyan-500 h-1 absolute top-0 left-0 w-1/2 animate-pulse" style={{ animation: 'indeterminate-progress 1.5s infinite ease-in-out' }}></div>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes indeterminate-progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </motion.div>
    );
};
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import { Icon } from './Icon';
import { Kpi, View, DataItem, StrategicAnalysisData } from '../types';
import { KPI_CONFIG } from '../constants';
import { getStrategicRankingsAnalysis } from '../services/geminiService';

interface PerformanceMatrixProps {
    periodLabel: string;
    currentView: View;
    allStoresData: { [storeId: string]: DataItem };
    directorAggregates: { [directorName: string]: DataItem };
}

const formatValue = (value: number, kpi: Kpi) => {
    const config = KPI_CONFIG[kpi];
    switch(config.format) {
        case 'currency':
            return value >= 1000 || value <= -1000 ? `${(value/1000).toFixed(1)}k` : `$${value.toFixed(0)}`;
        case 'percent':
            return `${(value * 100).toFixed(1)}%`;
        case 'number':
            return value.toFixed(2);
        default:
            return value.toString();
    }
};

const getColorForMetric = (value: number, kpi: Kpi, variance?: number) => {
    // If variance is provided, use that for coloring (Green/Red based on goodness)
    if (variance !== undefined) {
        const { higherIsBetter } = KPI_CONFIG[kpi];
        const isGood = higherIsBetter ? variance >= 0 : variance <= 0;
        // Return colors suitable for the glass effect
        return isGood 
            ? 'linear-gradient(90deg, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0.4) 100%)' // Cyan/Greenish
            : 'linear-gradient(90deg, rgba(248, 113, 113, 0.1) 0%, rgba(248, 113, 113, 0.4) 100%)'; // Red
    }
    return 'linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0.4) 100%)'; // Default Blue
};

export const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({ periodLabel, currentView, allStoresData, directorAggregates }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    // Renamed state to match the new "Rankings" mental model
    const [primaryKpi, setPrimaryKpi] = useState<Kpi>(Kpi.Sales); // Determines Order & Bar Length
    const [secondaryKpi, setSecondaryKpi] = useState<Kpi>(Kpi.SOP); // Determines Color/Context

    const chartData = useMemo(() => {
        const sourceData = currentView === 'Total Company' ? directorAggregates : allStoresData;
        
        const data = (Object.entries(sourceData) as [string, DataItem][]).map(([name, item]) => {
            const actual = 'aggregated' in item ? item.aggregated : item.actual;
            const comparison = item.comparison;
            const variance = item.variance;

            if (!actual) return null;

            const primaryVal = actual[primaryKpi] || 0;
            const secondaryVal = actual[secondaryKpi] || 0;
            const secondaryVar = variance?.[secondaryKpi]; // Use variance for coloring if available

            return {
                name,
                primary: primaryVal,
                secondary: secondaryVal,
                secondaryVariance: secondaryVar
            };
        }).filter((item): item is { name: string, primary: number, secondary: number, secondaryVariance?: number } => item !== null);

        // Sort by Primary KPI
        const { higherIsBetter } = KPI_CONFIG[primaryKpi];
        return data.sort((a, b) => higherIsBetter ? b.primary - a.primary : a.primary - b.primary);

    }, [currentView, directorAggregates, allStoresData, primaryKpi, secondaryKpi]);

    // Calculate max value for bar width scaling
    const maxValue = useMemo(() => Math.max(...chartData.map(d => d.primary), 0.01), [chartData]);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis('');
        
        // Prepare simplified data for AI to reduce token usage and improve focus
        const top3 = chartData.slice(0, 3);
        const bottom3 = chartData.slice(-3);
        const aiPayload: StrategicAnalysisData[] = [...top3, ...bottom3].map((d, i) => ({
            location: d.name,
            primaryMetric: d.primary,
            secondaryMetric: d.secondary,
            rank: i + 1 // Rough rank, inaccurate for bottom 3 but gives context
        }));

        const result = await getStrategicRankingsAnalysis(
            aiPayload, 
            periodLabel, 
            { primary: primaryKpi, secondary: secondaryKpi }
        );
        
        const html = await marked.parse(result);
        setAnalysis(html);
        setIsLoading(false);
    };

    const containerClass = isFullScreen
        ? "fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl p-8 flex flex-col overflow-hidden"
        : "bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col h-[500px]"; // Fixed height for scrolling

    const renderContent = () => (
        <div className={containerClass}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
                <div>
                    <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Strategic Analysis Hub</h3>
                    <p className="text-xs text-slate-400">{currentView} • {periodLabel}</p>
                </div>
                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 text-slate-400 hover:text-white transition-colors">
                    <Icon name={isFullScreen ? 'compress' : 'expand'} className="w-5 h-5" />
                </button>
            </div>
            
            {/* Controls */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-4 flex-shrink-0 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Rank By (Bar Length)</label>
                    <select value={primaryKpi} onChange={(e) => setPrimaryKpi(e.target.value as Kpi)} className="w-full bg-slate-800 text-white border border-slate-600 rounded p-1.5 focus:ring-cyan-500 focus:border-cyan-500 text-sm font-medium">
                         {Object.values(Kpi).map(kpi => <option key={kpi} value={kpi}>{kpi}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Context (Color/Variance)</label>
                    <select value={secondaryKpi} onChange={(e) => setSecondaryKpi(e.target.value as Kpi)} className="w-full bg-slate-800 text-white border border-slate-600 rounded p-1.5 focus:ring-cyan-500 focus:border-cyan-500 text-sm font-medium">
                        {Object.values(Kpi).map(kpi => <option key={kpi} value={kpi}>{kpi}</option>)}
                    </select>
                </div>
            </div>
            
            {/* Dynamic Bar Chart */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
                 <div className="space-y-3">
                    <AnimatePresence>
                        {chartData.map((item, index) => (
                            <motion.div 
                                key={item.name}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
                                className="relative group"
                            >
                                {/* 3D-ish Bar Container */}
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-32 flex-shrink-0 text-right">
                                        <p className="text-xs font-bold text-slate-300 truncate" title={item.name}>{item.name}</p>
                                        <p className="text-[10px] text-slate-500">{formatValue(item.secondary, secondaryKpi)} <span className="text-[9px] uppercase text-slate-600">({secondaryKpi})</span></p>
                                    </div>
                                    
                                    <div className="flex-1 h-8 bg-slate-900/50 rounded-r-md relative border-l border-slate-700">
                                        {/* The Bar Itself */}
                                        <motion.div 
                                            className="h-full rounded-r-sm relative shadow-[2px_2px_5px_rgba(0,0,0,0.3)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.primary / maxValue) * 100}%` }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                            style={{ 
                                                background: getColorForMetric(item.secondary, secondaryKpi, item.secondaryVariance),
                                                borderRight: '1px solid rgba(255,255,255,0.1)',
                                                borderTop: '1px solid rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            {/* Shine Effect */}
                                            <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                            
                                            {/* Value Label inside bar or pushed out */}
                                            <div className={`absolute top-1/2 -translate-y-1/2 px-2 text-xs font-bold text-shadow-sm whitespace-nowrap ${ (item.primary / maxValue) < 0.2 ? 'left-full text-slate-300 pl-2' : 'right-0 text-white/90'}`}>
                                                {formatValue(item.primary, primaryKpi)}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                 </div>
            </div>

            {/* AI Action */}
            <div className="mt-4 pt-4 border-t border-slate-700 flex-shrink-0">
                <button 
                    onClick={handleAnalyze} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg border border-slate-600 hover:border-cyan-400 group"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Analyzing Strategy...</span>
                        </>
                    ) : (
                        <>
                            <Icon name="brain" className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
                            <span>Generate Strategic Insights</span>
                        </>
                    )}
                </button>
            </div>
            
            {/* AI Output Area */}
            <AnimatePresence>
                {analysis && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 p-4 bg-slate-900/80 border border-slate-700 rounded-lg max-h-64 overflow-y-auto custom-scrollbar shadow-inner"
                    >
                         <div 
                            className="prose prose-sm prose-invert max-w-none text-slate-300" 
                            dangerouslySetInnerHTML={{ __html: analysis }}
                          ></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    if (isFullScreen) {
        return createPortal(renderContent(), document.body);
    }
    return renderContent();
};
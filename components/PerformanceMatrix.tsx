
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import { Icon } from './Icon';
import { Kpi, View, DataItem } from '../types';
import { KPI_CONFIG, KPI_ICON_MAP } from '../constants';
import { getStrategicExecutiveAnalysis } from '../services/geminiService';

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

// Primary KPIs for C-Suite level view
const STRATEGIC_KPIS = [Kpi.Sales, Kpi.SOP, Kpi.PrimeCost];

export const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({ periodLabel, allStoresData, directorAggregates }) => {
    const [activeKpi, setActiveKpi] = useState<Kpi>(Kpi.Sales);
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Reset analysis when KPI changes
    useEffect(() => {
        setAnalysis('');
    }, [activeKpi]);

    // 1. Calculate Company Total for active KPI
    const companyTotal = useMemo(() => {
        if (!directorAggregates) return 0;
        const values = Object.values(directorAggregates).map(d => {
            const actual = 'aggregated' in d ? d.aggregated : d.actual;
            return actual[activeKpi] || 0;
        });
        
        if (KPI_CONFIG[activeKpi].format === 'currency') {
            return values.reduce((a, b) => a + b, 0);
        } else {
            return values.reduce((a, b) => a + b, 0) / (values.length || 1);
        }
    }, [directorAggregates, activeKpi]);

    // 2. Sort Directors for active KPI
    const sortedDirectors = useMemo(() => {
        return Object.entries(directorAggregates).map(([name, item]) => {
            const actual = 'aggregated' in item ? item.aggregated : item.actual;
            return { name, value: actual[activeKpi] || 0 };
        }).sort((a, b) => KPI_CONFIG[activeKpi].higherIsBetter ? b.value - a.value : a.value - b.value);
    }, [directorAggregates, activeKpi]);

    // 3. Identify "Anchors" (Bottom 3 Stores) for active KPI
    const anchors = useMemo(() => {
        return Object.entries(allStoresData).map(([name, item]) => {
            const actual = 'actual' in item ? item.actual : item.aggregated;
            return { name, value: actual[activeKpi] || 0 };
        })
        .sort((a, b) => KPI_CONFIG[activeKpi].higherIsBetter ? a.value - b.value : b.value - a.value) // Sort ascending (worst first) for HigherIsBetter
        .slice(0, 3);
    }, [allStoresData, activeKpi]);

    const handleAnalyze = async () => {
        setIsLoading(true);
        
        // Prepare concise payload for AI
        const directorPayload = sortedDirectors.map(d => ({ name: d.name, value: formatValue(d.value, activeKpi) }));
        const anchorPayload = anchors.map(a => ({ store: a.name, value: formatValue(a.value, activeKpi) }));
        const totalFormatted = formatValue(companyTotal, activeKpi);

        const result = await getStrategicExecutiveAnalysis(
            activeKpi,
            periodLabel,
            totalFormatted as any, // Cast as any to pass string, backend expects formatted string is fine for context
            directorPayload,
            anchorPayload
        );
        
        const html = await marked.parse(result);
        setAnalysis(html);
        setIsLoading(false);
    };

    const containerClass = isFullScreen
        ? "fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl p-8 flex flex-col overflow-hidden"
        : "bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col h-[600px]"; 

    const renderContent = () => (
        <div className={containerClass}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
                <div>
                    <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Strategic Control Tower</h3>
                    <p className="text-xs text-slate-400">Total Company Insights • {periodLabel}</p>
                </div>
                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 text-slate-400 hover:text-white transition-colors">
                    <Icon name={isFullScreen ? 'compress' : 'expand'} className="w-5 h-5" />
                </button>
            </div>
            
            {/* KPI Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6 flex-shrink-0">
                {STRATEGIC_KPIS.map(kpi => (
                    <button
                        key={kpi}
                        onClick={() => setActiveKpi(kpi)}
                        className={`p-3 rounded-lg border transition-all text-left relative overflow-hidden group ${
                            activeKpi === kpi 
                            ? 'bg-slate-700 border-cyan-500 shadow-lg shadow-cyan-900/20' 
                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wider ${activeKpi === kpi ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'}`}>{kpi}</span>
                            <Icon name={KPI_ICON_MAP[kpi]} className={`w-4 h-4 ${activeKpi === kpi ? 'text-cyan-400' : 'text-slate-600'}`} />
                        </div>
                        {/* For Total Company View, we might want to calculate the total here too, but using the pre-calc total for now */}
                         {/* Note: This total changes based on the active KPI selected above, giving immediate feedback */}
                         {activeKpi === kpi && (
                             <motion.span 
                                {...({
                                    initial: { opacity: 0, y: 5 },
                                    animate: { opacity: 1, y: 0 }
                                } as any)}
                                className="text-lg font-bold text-white block"
                             >
                                 {formatValue(companyTotal, kpi)}
                             </motion.span>
                         )}
                    </button>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 lg:grid-cols-2 gap-6 content-start">
                
                {/* Left Col: Regional Breakdown */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Icon name="dashboard" className="w-4 h-4 text-slate-500" />
                        Regional Performance
                    </h4>
                    <div className="space-y-2">
                        {sortedDirectors.map((d, i) => {
                            // Calculate percentage of max for bar width
                            const maxVal = sortedDirectors[0].value;
                            const percent = (d.value / maxVal) * 100;
                            
                            return (
                                <div key={d.name} className="bg-slate-900/50 p-2 rounded border border-slate-700/50 flex items-center gap-3 relative overflow-hidden">
                                    <div className="w-6 text-center text-xs font-mono text-slate-500">{i + 1}</div>
                                    <div className="flex-1 relative z-10">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-sm font-semibold text-slate-200">{d.name}</span>
                                            <span className="text-xs font-mono text-cyan-400">{formatValue(d.value, activeKpi)}</span>
                                        </div>
                                        {/* Simple Bar */}
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                {...({
                                                    initial: { width: 0 },
                                                    animate: { width: `${percent}%` },
                                                    transition: { duration: 0.5, delay: i * 0.1 }
                                                } as any)}
                                                className="h-full bg-cyan-600 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Col: The Anchors */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Icon name="warning" className="w-4 h-4 text-red-400" />
                        The "Anchors" <span className="text-xs font-normal text-slate-500">(Bottom 3 Performers)</span>
                    </h4>
                    <div className="space-y-2">
                        {anchors.map((store) => (
                            <div key={store.name} className="bg-red-900/10 p-3 rounded border border-red-900/30 flex items-center justify-between">
                                <span className="text-sm text-slate-300 font-medium truncate max-w-[140px]" title={store.name}>{store.name}</span>
                                <span className="text-sm font-bold text-red-400 font-mono">{formatValue(store.value, activeKpi)}</span>
                            </div>
                        ))}
                        <div className="p-3 bg-slate-800/50 rounded border border-slate-700 text-xs text-slate-400 italic text-center">
                            These 3 locations are currently dragging the company average down the most.
                        </div>
                    </div>
                </div>

            </div>

            {/* AI Action Area */}
            <div className="mt-4 pt-4 border-t border-slate-700 flex-shrink-0">
                {!analysis ? (
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg border border-slate-600 hover:border-cyan-400 group"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Analyzing Financials...</span>
                            </>
                        ) : (
                            <>
                                <Icon name="brain" className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
                                <span>Generate Executive Briefing: {activeKpi}</span>
                            </>
                        )}
                    </button>
                ) : (
                    <motion.div 
                        {...({
                            initial: { height: 0, opacity: 0 },
                            animate: { height: 'auto', opacity: 1 }
                        } as any)}
                        className="bg-slate-900/80 border border-slate-700 rounded-lg max-h-48 overflow-y-auto custom-scrollbar p-4 relative"
                    >
                        <button onClick={() => setAnalysis('')} className="absolute top-2 right-2 text-slate-500 hover:text-white">
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                        <div 
                            className="prose prose-sm prose-invert max-w-none text-slate-300" 
                            dangerouslySetInnerHTML={{ __html: analysis }}
                        ></div>
                    </motion.div>
                )}
            </div>
        </div>
    );

    if (isFullScreen) {
        return createPortal(renderContent(), document.body);
    }
    return renderContent();
};
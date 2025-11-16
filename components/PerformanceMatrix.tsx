import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { getQuadrantAnalysis } from '../services/geminiService';
import { marked } from 'marked';
import { Icon } from './Icon';
import { Kpi, View, DirectorProfile, PerformanceData } from '../types';
import { KPI_CONFIG } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

type ChartDataPoint = {
    name: string;
    x: number;
    y: number;
    z: number;
};

type DataItem = {
    actual: PerformanceData;
    comparison?: PerformanceData;
    variance: PerformanceData;
} | {
    aggregated: PerformanceData;
    comparison?: PerformanceData;
    variance: PerformanceData;
};

interface PerformanceMatrixProps {
    periodLabel: string;
    currentView: View;
    allStoresData: { [storeId: string]: DataItem };
    directorAggregates: { [directorName: string]: DataItem };
}

const CustomTooltipContent = ({ active, payload, kpiLabels }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-md shadow-lg text-sm">
                <p className="font-bold text-slate-200 mb-1">{data.name}</p>
                <p className="text-cyan-400">{kpiLabels.y}: <span className="font-semibold">{(data.y * 100).toFixed(1)}%</span></p>
                <p className="text-cyan-400">{kpiLabels.x}: <span className="font-semibold">{(data.x * 100).toFixed(1)}%</span></p>
                <p className="text-cyan-400">{kpiLabels.z}: <span className="font-semibold">{data.z.toFixed(2)}</span></p>
            </div>
        );
    }
    return null;
};

const getQuadrantColor = (x: number, y: number) => {
    if (x > 0 && y > 0) return '#4ade80'; // Green (Stars)
    if (x < 0 && y > 0) return '#facc15'; // Yellow (Growth Focus)
    if (x > 0 && y < 0) return '#60a5fa'; // Blue (Profit Focus)
    return '#f87171'; // Red (Needs Attention)
};

const valueKpis = [Kpi.Sales, Kpi.AvgReviews, Kpi.CulinaryAuditScore];
const costKpis = [Kpi.SOP, Kpi.PrimeCost, Kpi.FoodCost, Kpi.LaborCost, Kpi.VariableLabor];

export const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({ periodLabel, currentView, allStoresData, directorAggregates }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const [chartType, setChartType] = useState<'matrix' | 'bar'>('matrix');
    const [yAxisKpi, setYAxisKpi] = useState<Kpi>(Kpi.Sales);
    const [xAxisKpi, setXAxisKpi] = useState<Kpi>(Kpi.SOP);
    const [zAxisKpi, setZAxisKpi] = useState<Kpi>(Kpi.AvgReviews);

    const data = useMemo((): ChartDataPoint[] => {
        const sourceData = currentView === 'Total Company' ? directorAggregates : allStoresData;
        
        return Object.entries(sourceData).map(([name, item]) => {
            const actual = 'aggregated' in item ? item.aggregated : item.actual;
            const comparison = item.comparison;

            if (!actual || !comparison) return null;

            const getValue = (kpi: Kpi): number => {
                const actualValue = actual[kpi] || 0;
                const comparisonValue = comparison[kpi] || 0;
                const config = KPI_CONFIG[kpi];
                
                // For variance, calculate percentage change unless it's already a percentage
                if (config.format === 'percent' || config.format === 'number') {
                    return actualValue - comparisonValue;
                }
                // For currency, calculate % variance
                if (comparisonValue !== 0) {
                    return (actualValue - comparisonValue) / Math.abs(comparisonValue);
                }
                return 0;
            };

            return {
                name: name,
                y: getValue(yAxisKpi),
                x: getValue(xAxisKpi),
                z: actual[zAxisKpi] || 0
            };
        }).filter((item): item is ChartDataPoint => item !== null);
    }, [currentView, directorAggregates, allStoresData, xAxisKpi, yAxisKpi, zAxisKpi]);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis('');
        const result = await getQuadrantAnalysis(data, periodLabel, { x: xAxisKpi, y: yAxisKpi, z: zAxisKpi });
        const html = await marked.parse(result);
        setAnalysis(html);
        setIsLoading(false);
    };

    const domain = useMemo(() => {
        if (data.length === 0) return [-0.1, 0.1];
        const values = data.flatMap(d => [Math.abs(d.x), Math.abs(d.y)]);
        const max = Math.max(...values, 0.05);
        return [-max * 1.1, max * 1.1];
    }, [data]);
    
    const reviewDomain = useMemo(() => {
        if (data.length === 0) return [1, 5];
        const reviews = data.map(d => d.z);
        return [Math.min(...reviews), Math.max(...reviews)];
    }, [data]);
    
    const kpiLabels = { x: xAxisKpi, y: yAxisKpi, z: zAxisKpi };

    const renderMatrixChart = () => (
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" dataKey="x" name={xAxisKpi} unit="%" domain={domain} tickFormatter={(val) => `${(val * 100).toFixed(0)}`} stroke="#9ca3af" />
            <YAxis type="number" dataKey="y" name={yAxisKpi} unit="%" domain={domain} tickFormatter={(val) => `${(val * 100).toFixed(0)}`} stroke="#9ca3af" />
            <ZAxis type="number" dataKey="z" name={zAxisKpi} range={[50, 500]} domain={reviewDomain} />
            <Tooltip content={<CustomTooltipContent kpiLabels={kpiLabels} />} cursor={{ strokeDasharray: '3 3' }} />
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
            <ReferenceLine x={0} stroke="#64748b" strokeDasharray="4 4" />
            <Scatter name="Locations" data={data} >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.x, entry.y)} className="opacity-70" />
                ))}
            </Scatter>
        </ScatterChart>
    );
    
    const renderBarChart = () => (
         <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, bottom: 20, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={60} tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
            <Bar dataKey="y" name={yAxisKpi} >
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.y > 0 ? '#4ade80' : '#f87171'} />
                ))}
            </Bar>
         </BarChart>
    );

    const containerClass = isFullScreen
        ? "fixed inset-0 z-50 bg-slate-800 p-8 flex flex-col"
        : "bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col";

    return (
        <div className={containerClass}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-cyan-400 mb-1">Strategic Analysis Hub</h3>
                    <p className="text-xs text-slate-400 mb-4">{chartType === 'matrix' ? `${yAxisKpi} Growth vs. ${xAxisKpi} Growth` : `${yAxisKpi} Performance Ranking`}</p>
                </div>
                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 text-slate-400 hover:text-white">
                    <Icon name={isFullScreen ? 'compress' : 'expand'} className="w-5 h-5" />
                </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs mb-4">
                 <select value={chartType} onChange={(e) => setChartType(e.target.value as 'matrix' | 'bar')} className="bg-slate-700 text-white border border-slate-600 rounded p-1 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="matrix">Matrix View</option>
                    <option value="bar">Bar Chart View</option>
                </select>
                <select value={yAxisKpi} onChange={(e) => setYAxisKpi(e.target.value as Kpi)} className="bg-slate-700 text-white border border-slate-600 rounded p-1 focus:ring-cyan-500 focus:border-cyan-500">
                     {valueKpis.map(kpi => <option key={kpi} value={kpi}>{kpi} (Y-Axis)</option>)}
                </select>
                <select value={xAxisKpi} onChange={(e) => setXAxisKpi(e.target.value as Kpi)} className="bg-slate-700 text-white border border-slate-600 rounded p-1 focus:ring-cyan-500 focus:border-cyan-500" disabled={chartType === 'bar'}>
                    {costKpis.map(kpi => <option key={kpi} value={kpi}>{kpi} (X-Axis)</option>)}
                </select>
                <select value={zAxisKpi} onChange={(e) => setZAxisKpi(e.target.value as Kpi)} className="bg-slate-700 text-white border border-slate-600 rounded p-1 focus:ring-cyan-500 focus:border-cyan-500" disabled={chartType === 'bar'}>
                    {valueKpis.map(kpi => <option key={kpi} value={kpi}>{kpi} (Size)</option>)}
                </select>
            </div>
            
            <div className={isFullScreen ? 'flex-1' : 'h-[250px]'}>
                <ResponsiveContainer width="100%" height="100%">
                    <AnimatePresence mode="wait">
                         <motion.div
                            key={chartType}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                        >
                            {chartType === 'matrix' ? renderMatrixChart() : renderBarChart()}
                        </motion.div>
                    </AnimatePresence>
                </ResponsiveContainer>
            </div>

            <div className="mt-4">
                <button 
                    onClick={handleAnalyze} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-cyan-600 text-slate-200 font-semibold rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <Icon name="sparkles" className="w-5 h-5" />
                    {isLoading ? 'Analyzing...' : `Analyze ${chartType === 'matrix' ? 'Quadrants' : 'Performance'}`}
                </button>
            </div>
            {analysis && (
                <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-md max-h-48 overflow-y-auto custom-scrollbar">
                     <div 
                        className="prose prose-sm prose-invert max-w-none text-slate-200" 
                        dangerouslySetInnerHTML={{ __html: analysis }}
                      ></div>
                </div>
            )}
        </div>
    );
};
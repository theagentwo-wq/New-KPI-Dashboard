import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { getQuadrantAnalysis } from '../services/geminiService';
import { marked } from 'marked';
import { Icon } from './Icon';
import { Kpi, View, PerformanceData } from '../types';
import { KPI_CONFIG } from '../constants';

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

const formatAxisTick = (value: number, kpi: Kpi) => {
    const config = KPI_CONFIG[kpi];
    switch(config.format) {
        case 'currency':
            return value >= 1000 || value <= -1000 ? `${(value/1000).toFixed(0)}k` : `$${value.toFixed(0)}`;
        case 'percent':
            return `${(value * 100).toFixed(1)}%`;
        case 'number':
            return value.toFixed(2);
        default:
            return value.toString();
    }
};

const CustomTooltipContent = ({ active, payload, kpiLabels }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-md shadow-lg text-sm">
                <p className="font-bold text-slate-200 mb-1">{data.name}</p>
                <p className="text-cyan-400">{kpiLabels.y} Var: <span className="font-semibold">{formatAxisTick(data.y, kpiLabels.y)}</span></p>
                <p className="text-cyan-400">{kpiLabels.x} Var: <span className="font-semibold">{formatAxisTick(data.x, kpiLabels.x)}</span></p>
                <p className="text-cyan-400">{kpiLabels.z} Actual: <span className="font-semibold">{formatAxisTick(data.z, kpiLabels.z)}</span></p>
            </div>
        );
    }
    return null;
};

const getQuadrantColor = (x: number, y: number, xKpi: Kpi) => {
    const isXCostKpi = KPI_CONFIG[xKpi].higherIsBetter === false;
    const xIsGood = isXCostKpi ? x < 0 : x > 0;
    const yIsGood = y > 0;

    if (xIsGood && yIsGood) return '#4ade80'; // Green (Stars)
    if (!xIsGood && yIsGood) return '#facc15'; // Yellow (Growth Focus)
    if (xIsGood && !yIsGood) return '#60a5fa'; // Blue (Profit Focus)
    return '#f87171'; // Red (Needs Attention)
};

const growthKpis = [Kpi.Sales, Kpi.AvgReviews, Kpi.CulinaryAuditScore];
const efficiencyKpis = [Kpi.SOP, Kpi.PrimeCost, Kpi.FoodCost, Kpi.LaborCost, Kpi.VariableLabor];
const contextKpis = [Kpi.Sales, Kpi.AvgReviews, Kpi.CulinaryAuditScore];

export const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({ periodLabel, currentView, allStoresData, directorAggregates }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const [yAxisKpi, setYAxisKpi] = useState<Kpi>(Kpi.Sales);
    const [xAxisKpi, setXAxisKpi] = useState<Kpi>(Kpi.SOP);
    const [zAxisKpi, setZAxisKpi] = useState<Kpi>(Kpi.AvgReviews);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

    useEffect(() => {
        const sourceData = currentView === 'Total Company' ? directorAggregates : allStoresData;
        
        const dataPoints = Object.entries(sourceData).map(([name, item]) => {
            const actual = 'aggregated' in item ? item.aggregated : item.actual;
            const comparison = item.comparison;

            if (!actual || !comparison) return null;

            const yVar = (actual[yAxisKpi] || 0) - (comparison[yAxisKpi] || 0);
            const xVar = (actual[xAxisKpi] || 0) - (comparison[xAxisKpi] || 0);

            return {
                name: name,
                y: yVar,
                x: xVar,
                z: actual[zAxisKpi] || 0
            };
        }).filter((item): item is ChartDataPoint => item !== null && !isNaN(item.x) && !isNaN(item.y) && !isNaN(item.z));

        setChartData(dataPoints);
    }, [currentView, directorAggregates, allStoresData, xAxisKpi, yAxisKpi, zAxisKpi]);


    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis('');
        const result = await getQuadrantAnalysis(chartData, periodLabel, { x: xAxisKpi, y: yAxisKpi, z: zAxisKpi });
        const html = await marked.parse(result);
        setAnalysis(html);
        setIsLoading(false);
    };
    
    const zDomain = useMemo(() => {
        if (chartData.length === 0) return [1, 5];
        const zValues = chartData.map(d => d.z);
        return [Math.min(...zValues, 0), Math.max(...zValues, 1)];
    }, [chartData]);
    
    const kpiLabels = { x: xAxisKpi, y: yAxisKpi, z: zAxisKpi };

    const containerClass = isFullScreen
        ? "fixed inset-0 z-50 bg-slate-800 p-8 flex flex-col"
        : "bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col";

    const matrixContent = (
         <div className={containerClass}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Strategic Analysis Hub</h3>
                    <p className="text-xs text-slate-400 mb-1">{`Displaying: ${currentView} for ${periodLabel}`}</p>
                    <p className="text-xs text-slate-400 mb-4">{`${yAxisKpi} Var. vs. ${xAxisKpi} Var.`}</p>
                </div>
                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 text-slate-400 hover:text-white">
                    <Icon name={isFullScreen ? 'compress' : 'expand'} className="w-5 h-5" />
                </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                <select value={yAxisKpi} onChange={(e) => setYAxisKpi(e.target.value as Kpi)} className="bg-slate-700 text-white border border-slate-600 rounded p-1 focus:ring-cyan-500 focus:border-cyan-500">
                     {growthKpis.map(kpi => <option key={kpi} value={kpi}>{kpi} (Y)</option>)}
                </select>
                <select value={xAxisKpi} onChange={(e) => setXAxisKpi(e.target.value as Kpi)} className="bg-slate-700 text-white border border-slate-600 rounded p-1 focus:ring-cyan-500 focus:border-cyan-500">
                    {efficiencyKpis.map(kpi => <option key={kpi} value={kpi}>{kpi} (X)</option>)}
                </select>
                <select value={zAxisKpi} onChange={(e) => setZAxisKpi(e.target.value as Kpi)} className="bg-slate-700 text-white border border-slate-600 rounded p-1 focus:ring-cyan-500 focus:border-cyan-500">
                    {contextKpis.map(kpi => <option key={kpi} value={kpi}>{kpi} (Size)</option>)}
                </select>
            </div>
            
            <div className={isFullScreen ? 'flex-1' : 'h-[250px]'}>
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" dataKey="x" name={xAxisKpi} domain={['auto', 'auto']} tickFormatter={(val) => formatAxisTick(val, xAxisKpi)} stroke="#9ca3af" />
                        <YAxis type="number" dataKey="y" name={yAxisKpi} domain={['auto', 'auto']} tickFormatter={(val) => formatAxisTick(val, yAxisKpi)} stroke="#9ca3af" />
                        <ZAxis type="number" dataKey="z" name={zAxisKpi} range={[50, 500]} domain={zDomain} />
                        <Tooltip content={<CustomTooltipContent kpiLabels={kpiLabels} />} cursor={{ strokeDasharray: '3 3' }} />
                        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
                        <ReferenceLine x={0} stroke="#64748b" strokeDasharray="4 4" />
                        <Scatter name="Locations" data={chartData} >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.x, entry.y, xAxisKpi)} className="opacity-70 transition-colors" />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4">
                <button 
                    onClick={handleAnalyze} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-cyan-600 text-slate-200 font-semibold rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <Icon name="sparkles" className="w-5 h-5" />
                    {isLoading ? 'Analyzing...' : `Analyze Quadrants`}
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

    if (isFullScreen) {
        return createPortal(matrixContent, document.body);
    }
    return matrixContent;
};

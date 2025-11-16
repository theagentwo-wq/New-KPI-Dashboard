import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getQuadrantAnalysis } from '../services/geminiService';
import { marked } from 'marked';
import { Icon } from './Icon';

interface MatrixDataPoint {
    name: string;
    x: number; // SOP variance
    y: number; // Sales variance
    z: number; // Avg. Reviews
}

interface PerformanceMatrixProps {
  data: MatrixDataPoint[];
  periodLabel: string;
}

const CustomTooltipContent = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-md shadow-lg text-sm">
        <p className="font-bold text-slate-200 mb-1">{data.name}</p>
        <p className="text-cyan-400">Sales Var: <span className="font-semibold">{(data.y * 100).toFixed(1)}%</span></p>
        <p className="text-cyan-400">SOP Var: <span className="font-semibold">{(data.x * 100).toFixed(1)}%</span></p>
        <p className="text-cyan-400">Avg. Reviews: <span className="font-semibold">{data.z.toFixed(2)}</span></p>
      </div>
    );
  }
  return null;
};

export const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({ data, periodLabel }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis('');
        const result = await getQuadrantAnalysis(data, periodLabel);
        const html = await marked.parse(result);
        setAnalysis(html);
        setIsLoading(false);
    };

    const domain = useMemo(() => {
        const values = data.flatMap(d => [Math.abs(d.x), Math.abs(d.y)]);
        const max = Math.max(...values, 0.05); // Ensure a minimum domain
        return [-max * 1.1, max * 1.1];
    }, [data]);
    
    const reviewDomain = useMemo(() => {
        const reviews = data.map(d => d.z);
        return [Math.min(...reviews, 1), Math.max(...reviews, 5)];
    }, [data]);

    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col">
            <h3 className="text-lg font-bold text-cyan-400 mb-1">Performance Matrix</h3>
            <p className="text-xs text-slate-400 mb-4">Sales Growth vs. Profit Growth</p>
            <ResponsiveContainer width="100%" height={250}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    
                    <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="Profit Growth (SOP Var)" 
                        unit="%" 
                        domain={domain} 
                        tickFormatter={(val) => `${(val * 100).toFixed(0)}`}
                        stroke="#9ca3af"
                    />
                    <YAxis 
                        type="number" 
                        dataKey="y" 
                        name="Sales Growth (Sales Var)" 
                        unit="%" 
                        domain={domain} 
                        tickFormatter={(val) => `${(val * 100).toFixed(0)}`}
                        stroke="#9ca3af"
                    />
                    <ZAxis type="number" dataKey="z" name="Avg. Reviews" range={[50, 400]} domain={reviewDomain} />
                    
                    <Tooltip content={<CustomTooltipContent />} cursor={{ strokeDasharray: '3 3' }} />

                    <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
                    <ReferenceLine x={0} stroke="#64748b" strokeDasharray="4 4" />

                    <Scatter name="Locations" data={data} fill="#22d3ee" className="opacity-70" />
                </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4">
                <button 
                    onClick={handleAnalyze} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-cyan-600 text-slate-200 font-semibold rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <Icon name="sparkles" className="w-5 h-5" />
                    {isLoading ? 'Analyzing...' : 'Analyze Quadrants'}
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
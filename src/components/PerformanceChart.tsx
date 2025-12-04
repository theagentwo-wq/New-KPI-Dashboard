import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Kpi, PerformanceData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KPI_CONFIG } from '../constants';

interface PerformanceChartProps {
    activeKpi: Kpi;
    data: { date: string, data: PerformanceData }[]; // This should be an array of data points for the chart
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ activeKpi, data }) => {
    const kpiConfig = KPI_CONFIG[activeKpi];
    const [animationComplete, setAnimationComplete] = useState(false);

    // Reset animation when KPI changes
    useEffect(() => {
        setAnimationComplete(false);
        const timer = setTimeout(() => setAnimationComplete(true), 100);
        return () => clearTimeout(timer);
    }, [activeKpi]);

    if (!kpiConfig) {
        return (
            <div className="bg-slate-800 rounded-lg p-4 h-full flex items-center justify-center">
                <p className="text-slate-400">Invalid KPI selected.</p>
            </div>
        );
    }

    const chartData = data.map(d => ({ ...d.data, date: d.date }));

    const formatYAxis = (value: number) => {
         if (kpiConfig.format === 'currency') {
            return `$${(value / 1000)}k`;
        } else if (kpiConfig.format === 'percent') {
            return `${value}%`;
        }
        return value.toLocaleString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-slate-800 rounded-lg p-4 h-full flex flex-col"
        >
            <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="font-bold text-white mb-4"
            >
                Performance: {kpiConfig.label}
            </motion.h3>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex-grow"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 20,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12}/>
                        <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={formatYAxis}/>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            labelStyle={{ color: '#cbd5e1'}}
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '14px'}}/>
                        <Line
                            type="monotone"
                            dataKey={activeKpi}
                            stroke="#22d3ee"
                            strokeWidth={3}
                            name={kpiConfig.label}
                            dot={{ fill: '#22d3ee', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#22d3ee' }}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                            isAnimationActive={!animationComplete}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
        </motion.div>
    );
};

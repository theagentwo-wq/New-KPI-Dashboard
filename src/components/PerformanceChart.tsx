
import { Kpi, Period, View, PerformanceData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KPI_CONFIG } from '../constants';

interface PerformanceChartProps {
    activeKpi: Kpi;
    period: Period;
    view: View;
    data: PerformanceData[]; // This should be an array of data points for the chart
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ activeKpi, period, view, data }) => {
    const kpiConfig = KPI_CONFIG[activeKpi];

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
        <div className="bg-slate-800 rounded-lg p-4 h-full flex flex-col">
            <h3 className="font-bold text-white mb-4">Performance: {kpiConfig.label}</h3>
            <div className="flex-grow">
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12}/>
                        <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={formatYAxis}/>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151'}} 
                            labelStyle={{ color: '#cbd5e1'}}
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '14px'}}/>
                        <Line type="monotone" dataKey={activeKpi} stroke="#22d3ee" strokeWidth={2} name={kpiConfig.label} dot={false}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

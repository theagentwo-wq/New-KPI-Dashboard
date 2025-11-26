
import { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Briefcase, TrendingUp, BarChart } from 'lucide-react';
import { Period, View } from '../types';
import { getInsights } from '../services/geminiService';

interface AIAssistantProps {
  data: any;
  historicalData: any[];
  view: View;
  period: Period;
  userLocation: { latitude: number; longitude: number } | null;
}

const insightCategories = [
  { key: 'summary', label: 'Summary', icon: MessageSquare },
  { key: 'trends', label: 'Trends', icon: TrendingUp },
  { key: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { key: 'forecast', label: 'Forecast', icon: BarChart },
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ data, view, period, userLocation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('summary');

  useEffect(() => {
    const hasData = data && Object.keys(data).length > 0;

    if (!hasData) {
      setInsights(null);
      return;
    }

    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const prompt = `Analyze the performance for ${view} during the period: ${period.label}. Provide a concise "summary", identify key positive and negative "trends", suggest actionable "opportunities" for improvement, and generate a brief "forecast".`;
        
        const result = await getInsights(
          data,
          view,
          period.label,
          prompt
        );
        setInsights(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch insights.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [view, period, data, userLocation]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4">Generating AI insights...</p>
        </div>
      );
    }
    if (error) {
      return <div className="p-6 text-center text-red-400">Error: {error}</div>;
    }
    if (!insights) {
      return <div className="p-6 text-center text-slate-500">No data available to generate insights for the selected period.</div>;
    }
    const contentHtml = insights[activeCategory] 
      ? insights[activeCategory].replace(/\n/g, '<br />')
      : `<p>No ${activeCategory} insights available.</p>`;

    return <div className="p-4 prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />;
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="text-cyan-400 mr-2" size={20}/>
          <h3 className="font-bold text-white">AI Assistant</h3>
        </div>
      </div>
      <div className="border-b border-slate-700 flex justify-around">
        {insightCategories.map(({ key, label, icon: Icon }) => (
          <button 
            key={key} 
            onClick={() => setActiveCategory(key)}
            className={`flex-1 p-2 text-xs font-semibold flex items-center justify-center transition-colors ${activeCategory === key ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:bg-slate-700/50'}`}>
            <Icon size={14} className="mr-1.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

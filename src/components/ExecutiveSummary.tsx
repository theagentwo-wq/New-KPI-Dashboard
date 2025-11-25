
import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ExecutiveSummaryProps {
  summary: string | null;
  onGenerate: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary, onGenerate, isLoading, lastUpdated }) => {

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'never';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FileText className="text-cyan-400 mr-3" size={24} />
          <h3 className="font-bold text-white text-lg">Executive Summary</h3>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">
              Last updated: {formatTimeAgo(lastUpdated)}
            </span>
            <button 
              onClick={onGenerate} 
              disabled={isLoading}
              className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Regenerate Summary"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-slate-300 overflow-y-auto flex-grow pr-2">
        {isLoading && !summary ? (
            <div className="flex items-center justify-center h-full">
                <p>Generating summary...</p>
            </div>
        ) : summary ? (
          <ReactMarkdown>{summary}</ReactMarkdown>
        ) : (
          <div className="text-center text-slate-500 py-8">
            <p>No summary available.</p>
            <p>Click the refresh button to generate one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

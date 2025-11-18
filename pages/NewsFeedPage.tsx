import React from 'react';
import { NewsFeed } from '../components/NewsFeed';

export const NewsFeedPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-cyan-400 mb-4">Industry News Feed</h1>
        <p className="text-slate-400 mb-6">Stay up-to-date with the latest trends, news, and insights from across the restaurant industry.</p>
        <NewsFeed />
      </div>
    </div>
  );
};

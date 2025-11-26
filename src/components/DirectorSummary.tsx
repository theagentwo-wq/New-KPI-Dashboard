
import React from 'react';
import { DirectorProfile } from '../types';

interface DirectorSummaryProps {
  director: DirectorProfile;
}

const DirectorSummary: React.FC<DirectorSummaryProps> = ({ director }) => {
  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h2 className="text-xl font-bold">{director.name}</h2>
      <p className="text-slate-400">{director.title}</p>
    </div>
  );
};

export default DirectorSummary;

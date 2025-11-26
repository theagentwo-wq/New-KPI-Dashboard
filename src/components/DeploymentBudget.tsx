
import React from 'react';
import { DirectorProfile, Deployment } from '../types';

interface DeploymentBudgetProps {
  director: DirectorProfile;
  deployments: Deployment[];
}

export const DeploymentBudget: React.FC<DeploymentBudgetProps> = ({ director, deployments }) => {
  const totalBudget = director.yearlyTravelBudget;
  const spentBudget = deployments.reduce((acc, deployment) => acc + deployment.estimatedBudget, 0);
  const remainingBudget = totalBudget - spentBudget;
  const budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Travel Budget FY2025</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">Spent</p>
          <p className="text-2xl font-bold text-white">${spentBudget.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">Remaining</p>
          <p className="text-2xl font-bold text-green-400">${remainingBudget.toLocaleString()}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-400 mb-2">Budget Utilization ({budgetUtilization.toFixed(1)}%)</p>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div 
            className="bg-cyan-600 h-4 rounded-full"
            style={{ width: `${budgetUtilization}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 text-right mt-1">Total Budget: ${totalBudget.toLocaleString()}</p>
      </div>
    </div>
  );
};

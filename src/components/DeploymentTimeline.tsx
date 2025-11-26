
import React from 'react';
import { Deployment } from '../types';
import { Icon } from './Icon';

interface DeploymentTimelineProps {
  deployments: Deployment[];
  onEdit: (deployment: Deployment) => void;
  onDelete: (deploymentId: string) => void;
}

export const DeploymentTimeline: React.FC<DeploymentTimelineProps> = ({ deployments, onEdit, onDelete }) => {
  if (deployments.length === 0) {
    return (
      <div className="text-center text-slate-500 py-10">
        <p>No deployments scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deployments.map((deployment) => (
        <div key={deployment.id} className="bg-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">{deployment.deployedPerson} to {deployment.destination}</p>
            <p className="text-sm text-slate-400">{new Date(deployment.startDate).toLocaleDateString()} - {new Date(deployment.endDate).toLocaleDateString()}</p>
            <p className="text-xs text-slate-500">Purpose: {deployment.purpose}</p>
          </div>
          <div className="flex items-center">
            <p className="text-white font-semibold mr-4">${deployment.estimatedBudget.toLocaleString()}</p>
            <button onClick={() => onEdit(deployment)} className="text-slate-400 hover:text-white mr-2">
              <Icon name="edit" className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(deployment.id)} className="text-red-500 hover:text-red-400">
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

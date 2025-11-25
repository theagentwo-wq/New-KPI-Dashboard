import React, { useState, useMemo } from 'react';
import { Deployment, DirectorProfile } from '@/types';
import { DIRECTORS } from '@/constants';

interface GoogleWindow extends Window {
  google: any;
}

declare let window: GoogleWindow;

// A mock function to simulate fetching geocodes
const getGeocode = (storeId: string) => {
  // In a real app, this would use a geocoding service.
  // For this mock, we'll use a simple hash to generate positions.
  const hash = storeId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const lat = 34.0522 + (hash % 1000) / 10000;
  const lng = -118.2437 + (hash % 2000) / 10000;
  return { lat, lng };
};

interface DeploymentMapProps {
  deployments: Deployment[];
  directors: DirectorProfile[];
}

export const DeploymentMap: React.FC<DeploymentMapProps> = ({ deployments, directors }) => {
  const [activeDeployment, setActiveDeployment] = useState<Deployment | null>(null);

  const directorMap = useMemo(() => {
    const map = new Map<string, DirectorProfile>();
    directors.forEach(d => map.set(d.id, d));
    return map;
  }, [directors]);

  // This effect would handle the map initialization
  React.useEffect(() => {
    if (window.google) {
      const map = new window.google.maps.Map(document.getElementById('deployment-map'), {
        center: { lat: 34.0522, lng: -118.2437 }, // Centered on Los Angeles
        zoom: 10,
      });

      // Add markers for each store in deployments
      deployments.forEach(deployment => {
        deployment.stores.forEach(storeId => {
          const position = getGeocode(storeId);
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: `Store: ${storeId}`,
          });
          marker.addListener('click', () => {
            setActiveDeployment(deployment);
          });
        });
      });
    }
  }, [deployments]);


  return (
    <div className="h-full w-full relative">
      <div id="deployment-map" className="h-full w-full bg-slate-800"></div>
      {activeDeployment && (
        <div className="absolute top-2 left-2 bg-slate-900 p-4 rounded-lg shadow-lg border border-slate-700 max-w-sm">
          <h3 className="font-bold text-cyan-400">{activeDeployment.type}</h3>
          <p className="text-sm text-slate-300">Director: {directorMap.get(activeDeployment.directorId)?.name}</p>
          <p className="text-xs text-slate-400">Dates: {activeDeployment.startDate} to {activeDeployment.endDate}</p>
          <p className="text-xs text-slate-400">Stores: {activeDeployment.stores.join(', ')}</p>
          <p className="text-sm mt-2">{activeDeployment.description}</p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { Deployment, DirectorProfile, StoreDetails } from '../types';
import { STORE_DETAILS, DIRECTORS } from '../constants';

interface GoogleWindow extends Window {
  google: any;
}

declare let window: GoogleWindow;

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

interface DeploymentMapProps {
  deployments: Deployment[];
}

export const DeploymentMap: React.FC<DeploymentMapProps> = ({ deployments }) => {
  const [activeDeployment, setActiveDeployment] = useState<Deployment | null>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);

  const directorMap = useMemo(() => {
    const map = new Map<string, DirectorProfile>();
    DIRECTORS.forEach(d => map.set(d.id, d));
    return map;
  }, []);

  useEffect(() => {
    if (window.google && mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasMarkers = false;

      deployments.forEach(deployment => {
        deployment.stores.forEach(storeId => {
          const storeInfo: StoreDetails = STORE_DETAILS[storeId];
          if (storeInfo) {
            bounds.extend({ lat: storeInfo.lat, lng: storeInfo.lon });
            hasMarkers = true;
          }
        });
      });

      const map = new window.google.maps.Map(mapRef.current, {
        center: hasMarkers ? bounds.getCenter() : { lat: 39.8283, lng: -98.5795 }, // Center of US
        zoom: hasMarkers ? undefined : 4,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      });

      if(hasMarkers) {
        map.fitBounds(bounds);
      }

      deployments.forEach(deployment => {
        deployment.stores.forEach(storeId => {
          const storeInfo = STORE_DETAILS[storeId];
          if (storeInfo) {
            const marker = new window.google.maps.Marker({
              position: { lat: storeInfo.lat, lng: storeInfo.lon },
              map,
              title: `Store: ${storeId}`,
              // TODO: Add custom icons based on deployment type or status
            });
            marker.addListener('click', () => {
              setActiveDeployment(deployment);
              map.panTo(marker.getPosition());
            });
          }
        });
      });
    }
  }, [deployments]);

  const activeDirector = activeDeployment ? directorMap.get(activeDeployment.directorId) : null;

  return (
    <div className="h-full w-full relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
      <div ref={mapRef} className="h-full w-full" />
      {activeDeployment && (
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-700 max-w-sm animate-fade-in">
            <button onClick={() => setActiveDeployment(null)} className="absolute top-2 right-2 text-slate-400 hover:text-white">&times;</button>
          <h3 className="font-bold text-cyan-400 text-lg">{activeDeployment.type}</h3>
          {activeDirector && (
             <p className="text-sm font-semibold text-slate-300">Director: {activeDirector.name} {activeDirector.lastName}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">Dates: {activeDeployment.startDate} to {activeDeployment.endDate}</p>
          <p className="text-sm mt-3 text-slate-200">{activeDeployment.description}</p>
           <div className="mt-3 pt-3 border-t border-slate-700">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Affected Stores</h4>
                <div className="text-sm text-slate-300 space-y-1">
                    {activeDeployment.stores.map(s => <p key={s}>- {s}</p>)}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

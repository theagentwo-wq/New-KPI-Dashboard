
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Deployment, DirectorProfile, StoreDetails } from '../types';
import { STORE_DETAILS, DIRECTORS } from '../constants';

interface GoogleWindow extends Window {
  google: any;
}

declare let window: GoogleWindow;

// --- Map Configuration ---
const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

const ICONS = {
    HOME: {
        path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', // Material Icons home
        fillColor: '#4ade80', // green-400
        fillOpacity: 1,
        strokeWeight: 0,
        rotation: 0,
        scale: 1.2,
        anchor: { x: 12, y: 12 },
    },
    DIRECTOR_SUITCASE: {
        path: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z', // Material Icons business_center
        fillColor: '#22d3ee', // cyan-400
        fillOpacity: 1,
        strokeWeight: 0,
        rotation: 0,
        scale: 1.1,
        anchor: { x: 12, y: 12 },
    },
    STRIKE_TEAM_SUITCASE: {
        path: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z', // Material Icons business_center
        fillColor: '#f472b6', // pink-400
        fillOpacity: 1,
        strokeWeight: 0,
        rotation: 0,
        scale: 1.1,
        anchor: { x: 12, y: 12 },
    }
};

// --- Component --- 

interface DeploymentMapProps {
  deployments: Deployment[];
  director: DirectorProfile | null;
}

export const DeploymentMap: React.FC<DeploymentMapProps> = ({ deployments, director }) => {
  const [activeDeployment, setActiveDeployment] = useState<Deployment | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.google && mapRef.current && director) {
      const bounds = new window.google.maps.LatLngBounds();
      
      const map = new window.google.maps.Map(mapRef.current, {
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // Add Director's Home Base
      const homePosition = { lat: director.homeLat, lng: director.homeLon };
      new window.google.maps.Marker({
        position: homePosition,
        map,
        title: `Home Base: ${director.homeLocation}`,
        icon: ICONS.HOME
      });
      bounds.extend(homePosition);

      // Add Deployment Markers
      deployments.forEach(deployment => {
        const storeInfo = STORE_DETAILS[deployment.destination];
        if (storeInfo) {
          const position = { lat: storeInfo.lat, lng: storeInfo.lon };
          const isDirector = deployment.deployedPerson === director.name;
          
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: `${deployment.purpose} @ ${deployment.destination}`,
            icon: isDirector ? ICONS.DIRECTOR_SUITCASE : ICONS.STRIKE_TEAM_SUITCASE,
            label: isDirector ? undefined : {
                text: deployment.deployedPerson.split(' ')[0], // First name
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                className: 'marker-label' // for potential styling
            }
          });
          bounds.extend(position);

          marker.addListener('click', () => {
            setActiveDeployment(deployment);
            map.panTo(marker.getPosition());
          });
        }
      });

      // Fit map to bounds
      if (deployments.length > 0 || director) {
        map.fitBounds(bounds);
      } else {
        map.setCenter({ lat: 39.8283, lng: -98.5795 });
        map.setZoom(4);
      }
    }
  }, [deployments, director]);

  return (
    <div className="h-full w-full relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <style>{`
            .marker-label {
                transform: translateY(22px);
            }
        `}</style>
      <div ref={mapRef} className="h-full w-full" />
      {activeDeployment && (
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-700 max-w-sm animate-fade-in">
            <button onClick={() => setActiveDeployment(null)} className="absolute top-2 right-2 text-slate-400 hover:text-white">&times;</button>
            <h3 className="font-bold text-cyan-400 text-lg">{activeDeployment.purpose}</h3>
            {director && (
             <p className="text-sm font-semibold text-slate-300">Person Deployed: {activeDeployment.deployedPerson}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">Dates: {activeDeployment.startDate} to {activeDeployment.endDate}</p>
            <p className="text-sm mt-3 text-slate-200">Status: {activeDeployment.status || 'Planned'}</p>
             <div className="mt-3 pt-3 border-t border-slate-700">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Destination</h4>
                <p className="text-sm text-slate-300">{activeDeployment.destination}</p>
            </div>
        </div>
      )}
    </div>
  );
};

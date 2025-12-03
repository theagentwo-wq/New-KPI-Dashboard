
import React, { useState, useEffect, useRef } from 'react';
import { Deployment, DirectorProfile } from '../types';
import { getStoreInfo } from '../constants';

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

// Pin/marker icon path - teardrop shape pointing down
const PIN_PATH = 'M12 0C7.31 0 3.5 3.81 3.5 8.5C3.5 14.88 12 24 12 24S20.5 14.88 20.5 8.5C20.5 3.81 16.69 0 12 0Z';

// Helper function to create pin icon
// Used for both home location (green) and deployments (blue/violet)
// Note: This must be called inside useEffect where window.google is available
const createPinIcon = (fillColor: string, strokeColor: string, scale: number): google.maps.Symbol => ({
    path: PIN_PATH,
    fillColor,
    fillOpacity: 0.95,
    strokeWeight: 2,
    strokeColor,
    rotation: 0,
    scale,
    anchor: new window.google.maps.Point(12, 24), // Bottom point of pin
} as google.maps.Symbol);

// --- Helper Functions ---

/**
 * Check if a deployment is currently active (happening right now)
 */
const isDeploymentActive = (deployment: Deployment): boolean => {
    const now = new Date();
    const start = new Date(deployment.startDate);
    const end = new Date(deployment.endDate);

    // Check if current date is between start and end dates
    return now >= start && now <= end;
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
        center: { lat: 39.8283, lng: -98.5795 }, // Center of US
        zoom: 4, // Show entire United States
      });

      // Filter to only active (current) deployments
      const activeDeployments = deployments.filter(isDeploymentActive);

      // Check if director has an active deployment
      // Match by exact name only - avoid false positives from partial matches
      const directorActiveDeployment = activeDeployments.find(d => {
        const deployed = d.deployedPerson;
        const matches =
          deployed === director.name ||
          deployed === `${director.firstName} ${director.lastName}` ||
          deployed === `${director.lastName}, ${director.firstName}`;

        console.log('[DeploymentMap] Checking deployment:', deployed, 'against director:', director.name, 'Match:', matches);
        return matches;
      });

      console.log('[DeploymentMap] Director:', director.name, 'Active deployment:', directorActiveDeployment);
      console.log('[DeploymentMap] Director coords:', director.homeLat, director.homeLon);

      // Only show home pin if director is NOT currently deployed
      if (!directorActiveDeployment) {
        const homePosition = { lat: director.homeLat, lng: director.homeLon };
        console.log('[DeploymentMap] Creating home pin at', homePosition);

        new window.google.maps.Marker({
          position: homePosition,
          map,
          title: `Home Base: ${director.homeLocation}`,
          icon: createPinIcon('#10b981', '#059669', 1.2), // green pin for home
          label: {
            text: director.firstName || director.name.split(' ')[0],
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 'bold',
            className: 'marker-label-home'
          }
        });
        bounds.extend(homePosition);
      }

      // Add markers for ACTIVE deployments only
      activeDeployments.forEach(deployment => {
        // Get store info - supports both "Columbus" and "Columbus, OH" formats
        const storeInfo = getStoreInfo(deployment.destination);
        if (storeInfo) {
          const position = { lat: storeInfo.lat, lng: storeInfo.lon };
          const isDirector = deployment.deployedPerson === director.name;

          const marker = new window.google.maps.Marker({
            position,
            map,
            title: `${deployment.purpose} @ ${deployment.destination}`,
            icon: isDirector
              ? createPinIcon('#0ea5e9', '#0369a1', 1.3) // sky blue pin for director
              : createPinIcon('#8b5cf6', '#6d28d9', 1.2), // violet pin for team
            label: {
                text: deployment.deployedPerson.split(' ')[0], // First name
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 'bold',
                className: 'marker-label-deployment'
            }
          });
          bounds.extend(position);

          marker.addListener('click', () => {
            setActiveDeployment(deployment);
            map.panTo(marker.getPosition());
          });
        }
      });

      // Keep map zoomed out to show entire US
      // Users can zoom in manually to see specific deployments
      // Don't use fitBounds - it auto-zooms which defeats the purpose
    }
  }, [deployments, director]);

  return (
    <div className="h-full w-full relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <style>{`
            .marker-label-home,
            .marker-label-deployment {
                margin-top: 32px !important;
                text-shadow:
                    -1px -1px 2px rgba(0, 0, 0, 0.9),
                    1px -1px 2px rgba(0, 0, 0, 0.9),
                    -1px 1px 2px rgba(0, 0, 0, 0.9),
                    1px 1px 2px rgba(0, 0, 0, 0.9),
                    0 0 4px rgba(0, 0, 0, 0.8) !important;
                font-family: system-ui, -apple-system, sans-serif !important;
                letter-spacing: 0.5px !important;
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

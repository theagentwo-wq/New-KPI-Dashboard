// FIX: Add Google Maps type definitions to resolve namespace and type errors.
// By declaring the necessary parts of the google.maps namespace, we can provide type safety
// and satisfy the TypeScript compiler without needing the @types/google.maps package.
declare namespace google.maps {
  class LatLngBounds {
    constructor();
    extend(point: { lat: number; lng: number }): void;
    getCenter(): any;
  }
  class Map {
    constructor(mapDiv: HTMLElement, opts?: any);
    fitBounds(bounds: LatLngBounds): void;
    setZoom(zoom: number): void;
  }
  class Marker {
    constructor(opts?: any);
    setMap(map: Map | null): void;
  }
  class Point {
    constructor(x: number, y: number);
  }
  class Size {
    constructor(width: number, height: number);
  }
  interface MarkerLabel {
    text: string;
    className?: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  }
}

import React, { useEffect, useRef, useState } from 'react';
// FIX: Corrected the import to use a default import instead of a named import.
import useGoogleMaps from '../hooks/useGoogleMaps';
import { Deployment, DirectorProfile } from '../types';
import { STORE_DETAILS } from '../constants';

interface DeploymentMapProps {
  activeDeployments: Deployment[];
  director: DirectorProfile;
}

const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const createHomeIcon = (): string => {
    const svg = `
        <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4ade80" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
        </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createDeploymentIcon = (initials?: string): string => {
    const initialsText = initials ? `<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="white">${initials}</text>` : '';
    const svg = `
        <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#22d3ee" d="M20 6h-3V4c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z"/>
            ${initialsText}
        </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// FIX: Changed component to correctly wait for the google object to be defined.
// The `google` object is available on `window`, but only after the script is loaded.
// This change ensures that we only try to access `window.google.maps` *after* the
// `isLoaded` flag from the `useGoogleMaps` hook is true.
export const DeploymentMap: React.FC<DeploymentMapProps> = ({ activeDeployments, director }) => {
  const { isLoaded, error } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null); // Use `any` to avoid type conflicts with the declared namespace
  const [markers, setMarkers] = useState<any[]>([]); // Use `any` for markers

  useEffect(() => {
    // Only proceed if the script is loaded, the map ref is available, and the map hasn't been created yet.
    if (isLoaded && mapRef.current && !map && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      director.stores.forEach(storeId => {
        const details = STORE_DETAILS[storeId];
        if (details) {
          bounds.extend({ lat: details.lat, lng: details.lon });
        }
      });

      const newMap = new window.google.maps.Map(mapRef.current, {
        center: bounds.getCenter(),
        zoom: 6,
        disableDefaultUI: true,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
            { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#2c5282' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#262f3e' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4a5568' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
        ]
      });
      if (director.stores.length > 1) newMap.fitBounds(bounds);
      else newMap.setZoom(10);
      setMap(newMap);
    }
  }, [isLoaded, director.stores, map]);

  useEffect(() => {
    // Only proceed if the map object exists and the google object is on the window
    if (map && window.google) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: any[] = [];

      if (activeDeployments.length > 0) {
        activeDeployments.forEach(deployment => {
          const storeDetails = STORE_DETAILS[deployment.destination];
          if (!storeDetails) return;

          const isDirector = deployment.deployedPerson === 'Director';
          const name = isDirector ? director.name : deployment.deployedPerson;
          const initials = isDirector ? undefined : getInitials(name);
          
          const marker = new window.google.maps.Marker({
            position: { lat: storeDetails.lat, lng: storeDetails.lon },
            map,
            icon: {
                url: createDeploymentIcon(initials),
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 40),
            },
            label: {
                text: name,
                color: '#e2e8f0',
                fontSize: '11px',
                fontWeight: 'bold',
                className: 'map-marker-label'
            },
            title: `${name} deployed to ${deployment.destination}`
          });
          newMarkers.push(marker);
        });
      } else {
        const homeStoreDetails = STORE_DETAILS[director.homeLocation];
        if (homeStoreDetails) {
            const marker = new window.google.maps.Marker({
                position: { lat: homeStoreDetails.lat, lng: homeStoreDetails.lon },
                map,
                icon: {
                    url: createHomeIcon(),
                    scaledSize: new window.google.maps.Size(40, 40),
                    anchor: new window.google.maps.Point(20, 40),
                },
                label: {
                    text: director.name,
                    color: '#e2e8f0',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    className: 'map-marker-label'
                },
                title: `${director.name} at Home Base: ${director.homeLocation}`
            });
            newMarkers.push(marker);
        }
      }
      setMarkers(newMarkers);
    }
     // Cleanup function to remove markers when the component unmounts or dependencies change
     return () => { markers.forEach(marker => marker.setMap(null)); };
  }, [map, activeDeployments, director]);

  if (error) return <div className="text-center text-red-400 text-xs p-4">Error loading map: {error.message}</div>;
  
  // The loading indicator will show until the script is loaded AND the map is initialized.
  if (!isLoaded) return <div className="text-center text-slate-400 text-xs p-4">Loading Map...</div>;

  return (
    <>
      <div ref={mapRef} style={{ height: '250px', width: '100%', borderRadius: '0.5rem' }} />
      <style>{`
        .map-marker-label {
          text-shadow: 0 0 2px #0f172a, 0 0 2px #0f172a, 0 0 2px #0f172a;
        }
      `}</style>
    </>
  );
};

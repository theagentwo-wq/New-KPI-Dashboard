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
    addListener(eventName: string, handler: Function): any;
  }
  class InfoWindow {
    constructor(opts?: any);
    close(): void;
    open(map?: Map, anchor?: Marker): void;
    setContent(content: string | Element | Node): void;
  }
  class Point {
    constructor(x: number, y: number);
  }
  class Size {
    constructor(width: number, height: number);
  }
}

import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { Deployment, DirectorProfile } from '../types';
import { STORE_DETAILS } from '../constants';

interface DeploymentMapProps {
  activeDeployments: Deployment[];
  director: DirectorProfile;
}

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const generateStrikeTeamIcon = (initials: string) => {
    const svg = `
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="19" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="white">${initials}</text>
        </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};


export const DeploymentMap: React.FC<DeploymentMapProps> = ({ activeDeployments, director }) => {
  const { isLoaded, error } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const bounds = new google.maps.LatLngBounds();
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
      
      if (!infoWindowRef.current) {
        infoWindowRef.current = new google.maps.InfoWindow({ content: '', pixelOffset: new google.maps.Size(0, -45) });
      }
    }
  }, [isLoaded, director.stores, map]);

  useEffect(() => {
    if (map) {
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: google.maps.Marker[] = [];

      if (activeDeployments.length > 0) {
        activeDeployments.forEach(deployment => {
          const storeDetails = STORE_DETAILS[deployment.destination];
          if (!storeDetails) return;

          const isDirector = deployment.deployedPerson === 'Director';
          const iconUrl = isDirector ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="clip"><circle cx="20" cy="20" r="18"/></clipPath></defs><image href="${director.photo}" x="2" y="2" width="36" height="36" clip-path="url(#clip)"/><circle cx="20" cy="20" r="19" fill="none" stroke="#22d3ee" stroke-width="2"/></svg>`)}` : generateStrikeTeamIcon(getInitials(deployment.deployedPerson));

          const marker = new google.maps.Marker({
            position: { lat: storeDetails.lat, lng: storeDetails.lon },
            map,
            icon: { url: iconUrl, anchor: new google.maps.Point(20, 20) },
            title: deployment.destination
          });
          
          const infoContent = `<div class="bg-slate-800 text-white p-2 rounded-md font-sans text-sm"><p class="font-bold mb-1">${isDirector ? `${director.name} ${director.lastName}` : deployment.deployedPerson}</p><p class="text-xs text-slate-300">Purpose: ${deployment.purpose}</p><p class="text-xs text-slate-400 mt-1">Until: ${new Date(deployment.endDate).toLocaleDateString()}</p></div>`;

          marker.addListener('mouseover', () => { if (infoWindowRef.current) { infoWindowRef.current.setContent(infoContent); infoWindowRef.current.open(map, marker); } });
          marker.addListener('mouseout', () => { if (infoWindowRef.current) infoWindowRef.current.close(); });
          newMarkers.push(marker);
        });
      } else {
        const homeStoreDetails = STORE_DETAILS[director.homeLocation];
        if (homeStoreDetails) {
            const marker = new google.maps.Marker({
                position: { lat: homeStoreDetails.lat, lng: homeStoreDetails.lon },
                map,
                icon: {
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="clip"><circle cx="20" cy="20" r="18"/></clipPath></defs><image href="${director.photo}" x="2" y="2" width="36" height="36" clip-path="url(#clip)"/><circle cx="20" cy="20" r="19" fill="none" stroke="#4ade80" stroke-width="2" stroke-dasharray="4 2"/></svg>`)}`,
                    anchor: new google.maps.Point(20, 20),
                },
                title: `Home Base: ${director.homeLocation}`
            });

            const infoContent = `<div class="bg-slate-800 text-white p-2 rounded-md font-sans text-sm"><p class="font-bold mb-1">${director.name} ${director.lastName}</p><p class="text-xs text-slate-300 italic">At Home Base: ${director.homeLocation}</p></div>`;

            marker.addListener('mouseover', () => { if (infoWindowRef.current) { infoWindowRef.current.setContent(infoContent); infoWindowRef.current.open(map, marker); }});
            marker.addListener('mouseout', () => { if (infoWindowRef.current) infoWindowRef.current.close(); });
            newMarkers.push(marker);
        }
      }
      setMarkers(newMarkers);
    }
     return () => { markers.forEach(marker => marker.setMap(null)); };
  }, [map, activeDeployments, director]);

  if (error) return <div className="text-center text-red-400 text-xs p-4">Error loading map: {error.message}</div>;
  if (!isLoaded) return <div className="text-center text-slate-400 text-xs p-4">Loading Map...</div>;

  return <div ref={mapRef} style={{ height: '250px', width: '100%', borderRadius: '0.5rem' }} />;
};
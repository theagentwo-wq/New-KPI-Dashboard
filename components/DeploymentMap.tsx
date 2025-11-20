// FIX: Add Google Maps type definitions to resolve namespace and type errors.
/// <reference types="google.maps" />

import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { Deployment, DirectorProfile } from '../types';
import { STORE_DETAILS, STRIKE_TEAM_ICON_URL } from '../constants';

interface DeploymentMapProps {
  activeDeployments: Deployment[];
  director: DirectorProfile;
}

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
        styles: [ /* Dark mode styles */
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
        ]
      });
      newMap.fitBounds(bounds);
      setMap(newMap);
      
      if (!infoWindowRef.current) {
        infoWindowRef.current = new google.maps.InfoWindow({
            content: '',
            pixelOffset: new google.maps.Size(0, -40)
        });
      }
    }
  }, [isLoaded, director.stores, map]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: google.maps.Marker[] = [];

      activeDeployments.forEach(deployment => {
        const storeDetails = STORE_DETAILS[deployment.destination];
        if (!storeDetails) return;

        const isDirector = deployment.deployedPerson === 'Director';
        const iconUrl = isDirector ? director.photo : STRIKE_TEAM_ICON_URL;

        const marker = new google.maps.Marker({
          position: { lat: storeDetails.lat, lng: storeDetails.lon },
          map,
          icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(35, 35),
            anchor: new google.maps.Point(17.5, 17.5),
          },
          title: deployment.destination
        });
        
        const infoContent = `
            <div style="color: #333; font-family: sans-serif; font-size: 14px; padding: 5px;">
                <p style="font-weight: bold; margin: 0 0 4px 0;">${isDirector ? `${director.name} ${director.lastName}` : deployment.deployedPerson}</p>
                <p style="margin: 0;">Purpose: ${deployment.purpose}</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">Until: ${new Date(deployment.endDate).toLocaleDateString()}</p>
            </div>`;

        marker.addListener('mouseover', () => {
            if (infoWindowRef.current) {
                infoWindowRef.current.setContent(infoContent);
                infoWindowRef.current.open(map, marker);
            }
        });
        marker.addListener('mouseout', () => {
             if (infoWindowRef.current) {
                infoWindowRef.current.close();
            }
        });

        newMarkers.push(marker);
      });
      setMarkers(newMarkers);
    }
     return () => { markers.forEach(marker => marker.setMap(null)); }; // Cleanup on unmount
  }, [map, activeDeployments, director]);

  if (error) {
    return <div className="text-center text-red-400 text-xs p-4">Error loading map: {error.message}</div>;
  }
  
  if (!isLoaded) {
    return <div className="text-center text-slate-400 text-xs p-4">Loading Map...</div>;
  }

  return <div ref={mapRef} style={{ height: '250px', width: '100%', borderRadius: '0.5rem' }} />;
};

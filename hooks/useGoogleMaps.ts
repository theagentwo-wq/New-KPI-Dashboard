// FIX: Add Google Maps type definitions to resolve type errors for the 'google' object on the window.
// By declaring the `google` object on the `Window` interface, we inform TypeScript that it may exist globally,
// resolving the type error without needing external @types packages.
declare global {
  interface Window {
    google?: {
      maps: any; // Using `any` as this hook is generic and doesn't need detailed map types.
    };
  }
}

import { useState, useEffect } from 'react';
import { getMapsApiKey } from '../services/geminiService';

const SCRIPT_ID = 'google-maps-script';
let isScriptLoading = false;
let loadingPromise: Promise<void> | null = null;

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadScript = async () => {
      // Check if the script is already loaded by looking for the script tag
      if (document.getElementById(SCRIPT_ID)) {
        // If the script tag exists but maybe the window.google object isn't ready yet
        if (window.google && window.google.maps) {
          setIsLoaded(true);
        } else {
          // If the script tag is there but not ready, wait for the existing promise
          if (loadingPromise) {
            try {
              await loadingPromise;
              setIsLoaded(true);
            } catch (e) {
              setError(e as Error);
            }
          }
        }
        return;
      }
      
      if (isScriptLoading && loadingPromise) {
        try {
          await loadingPromise;
          setIsLoaded(true);
        } catch (e) {
          setError(e as Error);
        }
        return;
      }

      isScriptLoading = true;

      loadingPromise = new Promise(async (resolve, reject) => {
        try {
          const apiKey = await getMapsApiKey();
          const script = document.createElement('script');
          script.id = SCRIPT_ID;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
          script.async = true;
          script.defer = true;

          script.onload = () => {
            setIsLoaded(true);
            isScriptLoading = false;
            resolve();
          };
          script.onerror = () => {
            const err = new Error('Failed to load Google Maps script.');
            setError(err);
            isScriptLoading = false;
            reject(err);
          };

          document.head.appendChild(script);
        } catch (e) {
          const err = e instanceof Error ? e : new Error('An unknown error occurred while setting up Google Maps.');
          setError(err);
          isScriptLoading = false;
          reject(err);
        }
      });
    };

    loadScript();

  }, []);

  return { isLoaded, error };
};

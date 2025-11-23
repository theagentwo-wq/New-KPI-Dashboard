import { useState, useEffect } from 'react';
import { API_KEY } from '../lib/ai-client';

declare global {
  interface Window {
    google?: {
      maps: any;
    };
  }
}

const SCRIPT_ID = 'google-maps-script';
let isScriptLoading = false;
let loadingPromise: Promise<void> | null = null;

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadScript = async () => {
      if (document.getElementById(SCRIPT_ID)) {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
        } else if (loadingPromise) {
          try {
            await loadingPromise;
            setIsLoaded(true);
          } catch (e) {
            setError(e as Error);
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

      loadingPromise = new Promise((resolve, reject) => {
        try {
          const script = document.createElement('script');
          script.id = SCRIPT_ID;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
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

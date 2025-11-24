
import { useState, useEffect } from 'react';

// --- Constants ---
const SCRIPT_ID = 'google-maps-script';

// --- TypeScript Interfaces ---
interface UseGoogleMapsOptions {
  apiKey: string;
}

interface UseGoogleMapsResult {
  isLoaded: boolean;
  error?: Error;
}

// --- Global State ---
// These are kept outside the component to prevent re-loading on re-renders.
let isScriptLoading = false;
let loadingPromise: Promise<void> | null = null;


/**
 * A hook to robustly load the Google Maps JavaScript API script.
 * It ensures the script is loaded only once, even if the hook is used in multiple components.
 * 
 * @param {UseGoogleMapsOptions} options - The options for loading the script, including the API key.
 * @returns {UseGoogleMapsResult} - An object indicating if the script is loaded and any potential error.
 */
const useGoogleMaps = (): UseGoogleMapsResult => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<Error | undefined>(undefined);
  
    useEffect(() => {
        const loadScript = async () => {
          // If the script is already on the page, don't re-load it.
          if (document.getElementById(SCRIPT_ID)) {
            setIsLoaded(true);
            return;
          }
    
          // If another component is already loading the script, wait for it to finish.
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
                    // FIX: Changed to VITE_MAPS_KEY to align with Vite's environment variable requirements.
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_MAPS_KEY}`;
                    script.async = true;
                    script.defer = true;
          
                    script.onload = () => {
                      setIsLoaded(true);
                      isScriptLoading = false;
                      resolve();
                    };
          
                    script.onerror = () => {
                      const err = new Error('Failed to load the Google Maps script.');
                      setError(err);
                      isScriptLoading = false;
                      reject(err);
                    };
          
                    document.head.appendChild(script);
                  } catch (e) {
                    const err = e as Error;
                    setError(err);
                    isScriptLoading = false;
                    reject(err);
                  }
                });
              };
        
            loadScript();
        
            // No cleanup needed, as we want the script to stay on the page.
            return () => {};
          }, []);
        
          return { isLoaded, error };
        };

export default useGoogleMaps;

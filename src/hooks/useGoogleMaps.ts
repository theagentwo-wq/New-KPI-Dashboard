import { useState, useEffect } from 'react';

const SCRIPT_ID = 'google-maps-script';

interface UseGoogleMapsResult {
  isLoaded: boolean;
  error?: Error;
}

let isScriptLoading = false;
let loadingPromise: Promise<void> | null = null;

const useGoogleMaps = (): UseGoogleMapsResult => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<Error | undefined>(undefined);
  
    useEffect(() => {
        const loadScript = async () => {
          if (document.getElementById(SCRIPT_ID)) {
            setIsLoaded(true);
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
              // Replace with your actual Google Maps API key
              const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; 
              script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
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
        
        return () => {};
      }, []);
    
      return { isLoaded, error };
    };

export default useGoogleMaps;

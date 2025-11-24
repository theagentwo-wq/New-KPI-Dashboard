
// This file is the single, secure interface for communicating with backend and Google APIs.

const API_BASE_URL = "/api"; // Use a relative path to leverage Firebase Hosting rewrites

/**
 * A secure proxy function to call the backend's Gemini API (Cloud Function).
 * @param action The specific AI task to be performed (e.g., "getReviewSummary").
 * @param payload The data required for the task.
 * @returns The AI-generated content.
 */
export const callGeminiAPI = async (action: string, payload: any) => {
  const response = await fetch(`${API_BASE_URL}/gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `API request failed with status ${response.status}` }));
    // Surface the specific, user-friendly error message from the backend.
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.content;
};

/**
 * Uses the client-side Google Maps SDK to get location details.
 * This function now communicates directly with the Google Maps API from the browser.
 * @param searchQuery The name or address of the location to search for.
 * @returns Detailed information about the place.
 */
export const getPlaceDetails = async (searchQuery: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if the Google Maps script is loaded and ready
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return reject(new Error("Google Maps script is not loaded yet."));
    }

    // Use a dummy div element for the PlacesService, as it requires one.
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    const request = {
      query: searchQuery,
      fields: ['name', 'rating', 'reviews', 'website', 'url', 'photos', 'formatted_address', 'geometry'],
    };

    service.findPlaceFromQuery(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const place = results[0];
        // The photo URLs from the API need to be processed to be usable.
        const photoUrls = place.photos?.map(photo => photo.getUrl({ maxWidth: 400 })) || [];
        
        resolve({ ...place, photoUrls });

      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        reject(new Error(`No location details found for "${searchQuery}". Please check the spelling or provide a more specific name.`));
      } else {
        reject(new Error(`Failed to fetch place details from Google Maps. Status: ${status}`));
      }
    });
  });
};


// This file is the single, secure interface for communicating with the backend API.

/**
 * A secure proxy function to call the backend API (Cloud Function).
 * @param action The specific task to be performed (e.g., "getReviewSummary").
 * @param payload The data required for the task.
 * @returns The result from the backend.
 */
export const callGeminiAPI = async (action: string, payload: any): Promise<any> => {
  try {
    const response = await fetch(`/api/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: payload }),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      } catch (e) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`Failed to call API action \"${action}\":`, error);
    throw error;
  }
};

interface GoogleWindow extends Window {
  google: any;
}

declare let window: GoogleWindow;


/**
 * Uses the client-side Google Maps SDK to get location details.
 * This function now communicates directly with the Google Maps API from the browser.
 * Uses a two-step approach: first finds the place ID, then gets full details.
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

    // Step 1: Find the place to get its place_id
    // Only use fields supported by findPlaceFromQuery
    const findRequest = {
      query: searchQuery,
      fields: ['place_id', 'name', 'formatted_address', 'geometry'],
    };

    service.findPlaceFromQuery(findRequest, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const placeId = results[0].place_id;

        // Step 2: Get full details using the place_id
        const detailsRequest = {
          placeId: placeId,
          fields: ['name', 'rating', 'reviews', 'website', 'url', 'photos', 'formatted_address', 'geometry', 'plus_code'],
        };

        service.getDetails(detailsRequest, (place: any, detailsStatus: any) => {
          if (detailsStatus === window.google.maps.places.PlacesServiceStatus.OK && place) {
            // The photo URLs from the API need to be processed to be usable.
            const photoUrls = place.photos?.map((photo: any) => photo.getUrl({ maxWidth: 400 })) || [];

            // Explicitly extract place_id and ensure it's included in the result
            resolve({
              ...place,
              photoUrls,
              place_id: placeId // Ensure place_id is included
            });
          } else {
            reject(new Error(`Failed to fetch full place details. Status: ${detailsStatus}`));
          }
        });

      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        reject(new Error(`No location found for "${searchQuery}". Please check the spelling or try a different search.`));
      } else {
        reject(new Error(`Failed to find place. Status: ${status}`));
      }
    });
  });
};

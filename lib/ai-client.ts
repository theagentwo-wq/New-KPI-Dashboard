
// This file is the single, secure interface for communicating with the backend APIs.
// It does NOT contain any API keys.

interface GeminiPayload {
  action: string;
  payload: any;
}

/**
 * A secure proxy function to call the backend's Gemini API.
 * @param action The specific AI task to be performed (e.g., "getReviewSummary").
 * @param payload The data required for the task.
 * @returns The AI-generated content.
 */
export const callGeminiAPI = async (action: string, payload: any) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Surface the specific, user-friendly error message from the backend.
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.content;
};

/**
 * A secure proxy function to get location details from the backend's Maps API.
 * @param searchQuery The name or address of the location to search for.
 * @returns Detailed information about the place.
 */
export const getPlaceDetails = async (searchQuery: string) => {
    const response = await fetch('/api/maps/place-details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchQuery }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Maps request failed with status ${response.status}`);
    }

    return response.json();
};

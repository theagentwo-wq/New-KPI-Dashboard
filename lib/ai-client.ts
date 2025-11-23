
// This file is the single, secure interface for communicating with the backend APIs.
// It does NOT contain any API keys.

const API_BASE_URL = "/api"; // Use a relative path to leverage Firebase Hosting rewrites

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
 * A secure proxy function to get location details from the backend's Maps API.
 * @param searchQuery The name or address of the location to search for.
 * @returns Detailed information about the place.
 */
export const getPlaceDetails = async (searchQuery: string) => {
    const response = await fetch(`${API_BASE_URL}/maps/place-details`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchQuery }),
    });

    if (!response.ok) {
        // Handle cases where the response is not JSON (like the HTML error page)
        const text = await response.text();
        try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.error || `Maps request failed with status ${response.status}`);
        } catch (e) {
            // If parsing fails, it's likely the HTML error, so we show a snippet
            const errorDetail = text.substring(0, 100); 
            throw new Error(`Could not load location details. Unexpected response from server: "${errorDetail}..."`);
        }
    }

    return response.json();
};

import { WeatherCondition } from '../types';

/**
 * Maps an NWS API icon URL to a simplified weather condition string.
 * This helps in selecting the correct animated icon to display.
 * E.g., https://api.weather.gov/icons/land/day/sct?size=medium -> 'cloudy'
 * @param iconUrl The full icon URL from the NWS API response.
 * @returns A WeatherCondition string.
 */
export const mapNwsIconToCondition = (iconUrl: string): WeatherCondition => {
    if (!iconUrl) return 'sunny'; // Default to sunny if no icon
    
    const lowerIcon = iconUrl.toLowerCase();

    if (lowerIcon.includes('tsra')) return 'thunderstorm';
    if (lowerIcon.includes('snow') || lowerIcon.includes('ip') || lowerIcon.includes('fzra')) return 'snow';
    if (lowerIcon.includes('rain') || lowerIcon.includes('shwrs')) return 'rain';
    if (lowerIcon.includes('wind')) return 'windy';
    if (lowerIcon.includes('sct') || lowerIcon.includes('bkn') || lowerIcon.includes('ovc')) return 'cloudy';
    if (lowerIcon.includes('few') || lowerIcon.includes('skc')) return 'sunny';
    if (lowerIcon.includes('cold') || lowerIcon.includes('hot')) return 'sunny';
    
    // Default for fog, haze, etc.
    return 'cloudy';
};
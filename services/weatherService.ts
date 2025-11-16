import { WeatherInfo, DailyForecast } from '../types';
import { mapNwsIconToCondition } from '../utils/weatherUtils';

// Simple in-memory cache to avoid redundant API calls
const weatherCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes

// Hardcoded coordinates to avoid needing a geocoding API
const locationCoordinates: { [key: string]: { lat: number, lon: number } } = {
    'Denver, CO': { lat: 39.7392, lon: -104.9903 },
    'Las Colinas, TX': { lat: 32.8943, lon: -96.9547 },
    'Omaha, NB': { lat: 41.2565, lon: -95.9345 },
    'Lenexa, KS': { lat: 38.9543, lon: -94.7333 },
    'Boise, ID': { lat: 43.6150, lon: -116.2023 },
    'Frisco, TX': { lat: 33.1507, lon: -96.8236 },
    'Des Moines, IA': { lat: 41.6005, lon: -93.6091 },
    'Knoxville, TN': { lat: 35.9606, lon: -83.9207 },
    'Farragut, TN': { lat: 35.8751, lon: -84.1755 },
    'Chattanooga, TN': { lat: 35.0456, lon: -85.3097 },
    'Huntsville, AL': { lat: 34.7304, lon: -86.5861 },
    'Downtown Asheville, NC': { lat: 35.5951, lon: -82.5515 },
    'Gainesville, GA': { lat: 34.2979, lon: -83.8241 },
    'Raleigh, NC': { lat: 35.7796, lon: -78.6382 },
    'Indianapolis, IN': { lat: 39.7684, lon: -86.1581 },
    'Grand Rapids, MI': { lat: 42.9634, lon: -85.6681 },
    'Pittsburgh, PA': { lat: 40.4406, lon: -79.9959 },
    'Franklin, TN': { lat: 35.9251, lon: -86.8689 },
    'Milwaukee, WI': { lat: 43.0389, lon: -87.9065 },
    'Columbus, OH': { lat: 39.9612, lon: -82.9988 },
    'Greenville, SC': { lat: 34.8526, lon: -82.3940 },
    'Columbia, SC': { lat: 34.0007, lon: -81.0348 },
    'Virginia Beach, VA': { lat: 36.8529, lon: -75.9780 },
    'Charlotte, NC': { lat: 35.2271, lon: -80.8431 },
    'South Asheville, NC': { lat: 35.5034, lon: -82.5393 },
    'Myrtle Beach, SC': { lat: 33.6891, lon: -78.8867 },
    'Arlington, VA': { lat: 38.8783, lon: -77.1007 },
};

const getFromCache = (key: string) => {
    const cached = weatherCache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
        return cached.data;
    }
    return null;
}

const setInCache = (key: string, data: any) => {
    weatherCache.set(key, { data, timestamp: Date.now() });
}

async function fetchNWS(url: string, cacheKey: string) {
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`NWS API Error for ${url}: ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        setInCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Failed to fetch from NWS API for ${url}:`, error);
        return null;
    }
}

async function getPointMetadata(lat: number, lon: number) {
    return fetchNWS(`https://api.weather.gov/points/${lat},${lon}`, `metadata-${lat}-${lon}`);
}

export const getWeatherForLocation = async (location: string): Promise<WeatherInfo | null> => {
    const coords = locationCoordinates[location];
    if (!coords) return null;

    const metadata = await getPointMetadata(coords.lat, coords.lon);
    if (!metadata) return null;

    const forecastUrl = metadata.properties.forecastHourly;
    const forecastData = await fetchNWS(forecastUrl, `hourly-${location}`);
    if (!forecastData || !forecastData.properties?.periods?.[0]) return null;

    const currentPeriod = forecastData.properties.periods[0];
    return {
        condition: mapNwsIconToCondition(currentPeriod.icon),
        temperature: currentPeriod.temperature,
        shortForecast: currentPeriod.shortForecast,
        detailedForecast: currentPeriod.detailedForecast
    };
};

export const get7DayForecastForLocation = async (location: string): Promise<DailyForecast[] | null> => {
    const coords = locationCoordinates[location];
    if (!coords) return null;

    const metadata = await getPointMetadata(coords.lat, coords.lon);
    if (!metadata) return null;
    
    const forecastUrl = metadata.properties.forecast;
    const forecastData = await fetchNWS(forecastUrl, `daily-${location}`);
    if (!forecastData || !forecastData.properties?.periods) return null;

    const dailyPeriods = forecastData.properties.periods
      .filter((p: any) => p.isDaytime || forecastData.properties.periods.length <= 7)
      .slice(0, 7);

    return dailyPeriods.map((period: any) => ({
        date: new Date(period.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        condition: mapNwsIconToCondition(period.icon),
        temperature: period.temperature,
        shortForecast: period.shortForecast
    }));
};
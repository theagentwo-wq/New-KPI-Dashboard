import { WeatherInfo, DailyForecast } from '../types';
import { mapNwsIconToCondition } from '../utils/weatherUtils';
import { STORE_DETAILS } from '../constants';

// Simple in-memory cache to avoid redundant API calls
const weatherCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes

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
    const coords = STORE_DETAILS[location];
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
    const coords = STORE_DETAILS[location];
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
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
            console.error(`NWS API Error for ${url}: ${response.status} ${response.statusText}`);
            // Do not cache errors
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
    if (!metadata?.properties?.forecastHourly) {
        console.warn(`Could not get hourly forecast URL from metadata for ${location}`);
        return null;
    }

    const forecastUrl = metadata.properties.forecastHourly;
    const forecastData = await fetchNWS(forecastUrl, `hourly-${location}`);
    if (!forecastData || !forecastData.properties?.periods?.[0]) {
        console.warn(`No hourly forecast periods found for ${location}`);
        return null;
    }

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
    if (!metadata?.properties?.forecast) {
        console.warn(`Could not get daily forecast URL from metadata for ${location}`);
        return null;
    }
    
    const forecastUrl = metadata.properties.forecast;
    const forecastData = await fetchNWS(forecastUrl, `daily-${location}`);
    if (!forecastData || !forecastData.properties?.periods) {
        console.warn(`No daily forecast periods found for ${location}`);
        return null;
    }

    // NWS often returns pairs of day/night forecasts. We want one item per day.
    // We filter for daytime forecasts, but if there are none (e.g., only nightly), we take what we can get.
    const daytimePeriods = forecastData.properties.periods.filter((p: any) => p.isDaytime);
    const relevantPeriods = daytimePeriods.length > 0 ? daytimePeriods : forecastData.properties.periods;

    // Take the first 7 unique days
    const dailyForecasts: DailyForecast[] = [];
    const seenDays = new Set<string>();

    for (const period of relevantPeriods) {
        if (dailyForecasts.length >= 7) break;
        const dateStr = new Date(period.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        if (!seenDays.has(dateStr)) {
            dailyForecasts.push({
                date: dateStr,
                condition: mapNwsIconToCondition(period.icon),
                temperature: period.temperature,
                shortForecast: period.shortForecast
            });
            seenDays.add(dateStr);
        }
    }

    return dailyForecasts;
};

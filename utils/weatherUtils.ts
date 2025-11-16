export interface Weather {
    condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Snow';
    icon: string;
}

const conditions: Weather[] = [
    { condition: 'Sunny', icon: '☀️' },
    { condition: 'Cloudy', icon: '☁️' },
    { condition: 'Rain', icon: '🌧️' },
    { condition: 'Snow', icon: '❄️' }
];

// Simple hash function to get a deterministic "random" number from a string
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

export const getMockWeather = (city: string): Weather => {
    const hash = simpleHash(city);
    const index = hash % conditions.length;
    return conditions[index];
};
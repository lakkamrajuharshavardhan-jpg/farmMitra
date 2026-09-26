export interface GeocodeResult {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  isFallback?: boolean;
}

export interface WeatherData {
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  precipitation_sum: number;
  temperature_2m_max?: number;
  wind_speed_10m?: number;
  precipitation_probability_max?: number;
  rain?: number;
  isFallback?: boolean;
}

// Default fallback location (Warangal, Telangana, India)
const DEFAULT_GEOCODE: GeocodeResult = {
  latitude: 17.9784,
  longitude: 79.5941,
  name: 'Warangal',
  country: 'India',
  isFallback: true,
};

// Default fallback weather
const DEFAULT_WEATHER: WeatherData = {
  temperature_2m: 29.5,
  relative_humidity_2m: 62.0,
  precipitation: 0.0,
  precipitation_sum: 1.2,
  temperature_2m_max: 34.0,
  wind_speed_10m: 12.5,
  precipitation_probability_max: 15,
  rain: 0.0,
  isFallback: true,
};

/**
 * Geocodes a city/location name using Open-Meteo Geocoding API with resilient fallback.
 */
export async function geocodeLocation(location: string): Promise<GeocodeResult> {
  if (!location || !location.trim()) {
    return DEFAULT_GEOCODE;
  }

  try {
    const encodedCity = encodeURIComponent(location.trim());
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodedCity}&count=1`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Geocoding API responded with status ${res.status} for location "${location}". Using fallback.`);
      return { ...DEFAULT_GEOCODE, name: location };
    }

    const data = (await res.json()) as any;

    if (data.results && data.results.length > 0) {
      const match = data.results[0];
      return {
        latitude: Number(match.latitude),
        longitude: Number(match.longitude),
        name: match.name || location,
        country: match.country || '',
        isFallback: false,
      };
    }

    console.warn(`No geocoding matches found for "${location}". Using fallback coordinates.`);
    return { ...DEFAULT_GEOCODE, name: location };
  } catch (error) {
    console.warn(`Geocoding request failed for "${location}":`, (error as Error).message);
    return { ...DEFAULT_GEOCODE, name: location };
  }
}

/**
 * Fetches current weather, wind speed, daily max temp, and precipitation forecast using Open-Meteo Forecast API.
 */
export async function getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&daily=temperature_2m_max,precipitation_sum,precipitation_probability_max&timezone=auto`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Open-Meteo Forecast API status ${res.status}. Returning fallback weather.`);
      return DEFAULT_WEATHER;
    }

    const data = (await res.json()) as any;

    const currentTemp = data.current?.temperature_2m ?? DEFAULT_WEATHER.temperature_2m;
    const currentHumidity = data.current?.relative_humidity_2m ?? DEFAULT_WEATHER.relative_humidity_2m;
    const currentPrecip = data.current?.precipitation ?? DEFAULT_WEATHER.precipitation;
    const currentRain = data.current?.rain ?? DEFAULT_WEATHER.rain;
    const windSpeed = data.current?.wind_speed_10m ?? DEFAULT_WEATHER.wind_speed_10m;

    const maxTemp = data.daily?.temperature_2m_max?.[0] ?? DEFAULT_WEATHER.temperature_2m_max;
    const dailyPrecipSum = data.daily?.precipitation_sum?.[0] ?? DEFAULT_WEATHER.precipitation_sum;
    const precipProbMax = data.daily?.precipitation_probability_max?.[0] ?? DEFAULT_WEATHER.precipitation_probability_max;

    return {
      temperature_2m: currentTemp,
      relative_humidity_2m: currentHumidity,
      precipitation: currentPrecip,
      precipitation_sum: dailyPrecipSum,
      temperature_2m_max: maxTemp,
      wind_speed_10m: windSpeed,
      precipitation_probability_max: precipProbMax,
      rain: currentRain,
      isFallback: false,
    };
  } catch (error) {
    console.warn(`Weather service fetch error for (${latitude}, ${longitude}):`, (error as Error).message);
    return DEFAULT_WEATHER;
  }
}

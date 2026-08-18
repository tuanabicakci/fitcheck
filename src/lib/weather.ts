import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from 'lucide-react-native';

export interface WeatherSnapshot {
  temperature: number;
  condition: string;
  icon: LucideIcon;
  place: string;
}

interface WeatherCode {
  label: string;
  icon: LucideIcon;
}

// WMO weather interpretation codes, as returned by Open-Meteo.
const WEATHER_CODES: Record<number, WeatherCode> = {
  0: { label: 'Clear sky', icon: Sun },
  1: { label: 'Mostly clear', icon: Sun },
  2: { label: 'Partly cloudy', icon: CloudSun },
  3: { label: 'Overcast', icon: Cloud },
  45: { label: 'Fog', icon: CloudFog },
  48: { label: 'Fog', icon: CloudFog },
  51: { label: 'Light drizzle', icon: CloudDrizzle },
  53: { label: 'Drizzle', icon: CloudDrizzle },
  55: { label: 'Dense drizzle', icon: CloudDrizzle },
  56: { label: 'Freezing drizzle', icon: CloudDrizzle },
  57: { label: 'Freezing drizzle', icon: CloudDrizzle },
  61: { label: 'Light rain', icon: CloudRain },
  63: { label: 'Rain', icon: CloudRain },
  65: { label: 'Heavy rain', icon: CloudRain },
  66: { label: 'Freezing rain', icon: CloudRain },
  67: { label: 'Freezing rain', icon: CloudRain },
  71: { label: 'Light snow', icon: CloudSnow },
  73: { label: 'Snow', icon: CloudSnow },
  75: { label: 'Heavy snow', icon: CloudSnow },
  77: { label: 'Snow grains', icon: CloudSnow },
  80: { label: 'Rain showers', icon: CloudRain },
  81: { label: 'Rain showers', icon: CloudRain },
  82: { label: 'Violent showers', icon: CloudRain },
  85: { label: 'Snow showers', icon: CloudSnow },
  86: { label: 'Snow showers', icon: CloudSnow },
  95: { label: 'Thunderstorm', icon: CloudLightning },
  96: { label: 'Thunderstorm', icon: CloudLightning },
  99: { label: 'Thunderstorm', icon: CloudLightning },
};

function describeCode(code: number): WeatherCode {
  return WEATHER_CODES[code] ?? { label: 'Clear', icon: Sun };
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    );
    if (!res.ok) throw new Error('reverse geocode failed');
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || 'Your Location';
  } catch {
    return 'Your Location';
  }
}

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherSnapshot> {
  const [weatherRes, place] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`,
    ),
    reverseGeocode(latitude, longitude),
  ]);
  if (!weatherRes.ok) throw new Error('weather request failed');
  const data = await weatherRes.json();
  const code = describeCode(data.current.weather_code);
  return {
    temperature: Math.round(data.current.temperature_2m),
    condition: code.label,
    icon: code.icon,
    place,
  };
}

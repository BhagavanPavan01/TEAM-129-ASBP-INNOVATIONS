// src/services/weatherService.ts
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  windSpeed: number;
  feelsLike: number;
}

export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city},IN&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) throw new Error('City not found');
    
    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      city: data.name,
      country: data.sys.country,
      windSpeed: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like)
    };
  } catch (error) {
    console.error('Weather API error:', error);
    throw error;
  }
};

// Get weather for multiple major Indian cities
export const fetchIndianCitiesWeather = async (): Promise<WeatherData[]> => {
  const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
  
  const promises = cities.map(city => fetchWeatherByCity(city));
  return Promise.all(promises);
};
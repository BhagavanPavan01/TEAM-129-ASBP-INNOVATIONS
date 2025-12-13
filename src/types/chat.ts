export interface MessageType {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  location?: {
    lat: number;
    lon: number;
    city: string;
  };
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  city: string;
  alertLevel: 'none' | 'low' | 'medium' | 'high';
}

export interface DisasterPrediction {
  type: 'flood' | 'cyclone' | 'heatwave' | 'landslide' | 'none';
  probability: number;
  timeframe: string;
  affectedAreas: string[];
  recommendations: string[];
}
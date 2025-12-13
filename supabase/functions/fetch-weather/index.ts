import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherRequest {
  city: string;
  apiKey?: string; // Optional - user can add their own OpenWeather API key
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, apiKey }: WeatherRequest = await req.json();
    
    console.log("Fetching weather for:", city);

    // Check if user provided their own API key, otherwise use stored secret
    const weatherApiKey = apiKey || Deno.env.get("OPENWEATHER_API_KEY");
    
    if (!weatherApiKey) {
      // Return mock data if no API key is configured
      console.log("No API key configured, returning simulated data");
      const mockData = generateMockWeatherData(city);
      return new Response(JSON.stringify(mockData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch real weather data from OpenWeather API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${weatherApiKey}&units=metric`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenWeather API error:", response.status, errorText);
      
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "Invalid API key" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Return mock data on API error
      const mockData = generateMockWeatherData(city);
      return new Response(JSON.stringify(mockData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    const weatherData = {
      city: data.name,
      country: data.sys?.country || "Unknown",
      temperature: Math.round(data.main?.temp || 0),
      humidity: data.main?.humidity || 0,
      windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // Convert m/s to km/h
      visibility: (data.visibility || 10000) / 1000, // Convert meters to km
      condition: data.weather?.[0]?.main || "Unknown",
      description: data.weather?.[0]?.description || "",
      icon: data.weather?.[0]?.icon || "01d",
      latitude: data.coord?.lat,
      longitude: data.coord?.lon,
      raw: data,
    };

    // Store weather data in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("weather_data").insert({
      city: weatherData.city,
      country: weatherData.country,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      wind_speed: weatherData.windSpeed,
      visibility: weatherData.visibility,
      condition: weatherData.condition,
      raw_data: data,
    });

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in fetch-weather function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateMockWeatherData(city: string) {
  // Generate realistic mock data for demo purposes
  const conditions = ["Clear", "Clouds", "Rain", "Thunderstorm", "Mist"];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  // Base temperature varies by "region" (based on city name hash)
  const hash = city.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const baseTemp = 20 + (hash % 25);
  
  return {
    city: city,
    country: "Demo",
    temperature: baseTemp + Math.round(Math.random() * 10 - 5),
    humidity: 40 + Math.round(Math.random() * 50),
    windSpeed: 5 + Math.round(Math.random() * 40),
    visibility: 5 + Math.round(Math.random() * 10),
    condition: randomCondition,
    description: randomCondition.toLowerCase(),
    latitude: (hash % 180) - 90,
    longitude: (hash % 360) - 180,
    isMock: true,
  };
}

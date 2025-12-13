import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall?: number;
  visibility?: number;
  condition?: string;
}

interface PredictionRequest {
  location: string;
  weatherData: WeatherData;
  latitude?: number;
  longitude?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, weatherData, latitude, longitude }: PredictionRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing prediction request for:", location);
    console.log("Weather data:", JSON.stringify(weatherData));

    // Build AI prompt for disaster risk prediction
    const systemPrompt = `You are an AI disaster risk assessment system. Analyze the provided weather data and predict potential natural disaster risks.

Your response MUST be a valid JSON object with this exact structure:
{
  "disasterType": "flood" | "cyclone" | "heatwave" | "earthquake" | "wildfire" | "none",
  "riskLevel": "low" | "medium" | "high" | "critical",
  "confidence": number between 0 and 100,
  "message": "Brief description of the risk assessment",
  "factors": ["list", "of", "contributing", "factors"]
}

Risk assessment criteria:
- FLOOD: High humidity (>80%) + heavy rainfall or low visibility with rain conditions
- CYCLONE: Very high wind speeds (>60 km/h) + low visibility + stormy conditions
- HEATWAVE: Temperature >40°C + low humidity (<30%)
- WILDFIRE: High temperature (>35°C) + low humidity (<25%) + dry conditions
- Earthquakes cannot be predicted from weather, mark as "none" for weather-based analysis

Always provide actionable insights in the message.`;

    const userPrompt = `Analyze this weather data for ${location}:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Wind Speed: ${weatherData.windSpeed} km/h
- Visibility: ${weatherData.visibility || 'N/A'} km
- Condition: ${weatherData.condition || 'Unknown'}
${weatherData.rainfall ? `- Rainfall: ${weatherData.rainfall} mm` : ''}

Provide a disaster risk prediction.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    console.log("AI Response:", content);

    // Parse the JSON response from AI
    let prediction;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      prediction = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback prediction based on simple threshold logic
      prediction = generateFallbackPrediction(weatherData);
    }

    // Store prediction in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("risk_predictions").insert({
      location,
      disaster_type: prediction.disasterType,
      risk_level: prediction.riskLevel,
      confidence: prediction.confidence,
      prediction_data: prediction,
    });

    // If risk is medium or higher, create an alert
    if (prediction.riskLevel !== "low" && prediction.disasterType !== "none") {
      await supabase.from("alerts").insert({
        location,
        disaster_type: prediction.disasterType,
        risk_level: prediction.riskLevel,
        message: prediction.message,
        latitude,
        longitude,
        weather_data: weatherData,
        ai_prediction: prediction,
        is_active: true,
      });
    }

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-predict function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateFallbackPrediction(weather: WeatherData) {
  let disasterType = "none";
  let riskLevel = "low";
  let confidence = 70;
  let message = "No immediate disaster risk detected.";
  const factors: string[] = [];

  // Flood detection
  if (weather.humidity > 85 && weather.visibility && weather.visibility < 5) {
    disasterType = "flood";
    riskLevel = weather.humidity > 90 ? "high" : "medium";
    message = "High humidity and low visibility indicate potential flooding.";
    factors.push("High humidity", "Poor visibility");
    confidence = 75;
  }
  // Cyclone detection
  else if (weather.windSpeed > 60) {
    disasterType = "cyclone";
    riskLevel = weather.windSpeed > 100 ? "critical" : weather.windSpeed > 80 ? "high" : "medium";
    message = "High wind speeds detected. Cyclone conditions possible.";
    factors.push("Extreme wind speeds");
    confidence = 80;
  }
  // Heatwave detection
  else if (weather.temperature > 40 && weather.humidity < 30) {
    disasterType = "heatwave";
    riskLevel = weather.temperature > 45 ? "critical" : "high";
    message = "Extreme heat conditions detected. Heatwave warning.";
    factors.push("Extreme temperature", "Low humidity");
    confidence = 85;
  }
  // Wildfire risk
  else if (weather.temperature > 35 && weather.humidity < 25 && weather.windSpeed > 20) {
    disasterType = "wildfire";
    riskLevel = "high";
    message = "Hot, dry, and windy conditions. Wildfire risk elevated.";
    factors.push("High temperature", "Low humidity", "Wind");
    confidence = 70;
  }

  return { disasterType, riskLevel, confidence, message, factors };
}

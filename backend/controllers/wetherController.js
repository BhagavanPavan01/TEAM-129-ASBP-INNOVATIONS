const axios = require('axios');
const WeatherData = require('../models/WeatherData');
const DisasterAlert = require('../models/DisasterAlert');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

class WeatherController {
  
  // Get weather for specific Indian city
  async getWeatherByCity(req, res) {
    try {
      const { city } = req.params;
      
      // Fetch from OpenWeatherMap
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&units=metric&appid=${WEATHER_API_KEY}`
      );
      
      const weatherData = this.processWeatherData(response.data);
      
      // Check for disaster conditions
      const alerts = this.checkDisasterConditions(weatherData);
      weatherData.alerts = alerts;
      
      // Calculate risk score
      weatherData.risk_score = this.calculateRiskScore(weatherData, alerts);
      
      // Save to database
      const savedData = await WeatherData.create(weatherData);
      
      // If alerts exist, create DisasterAlert records
      if (alerts.length > 0) {
        await this.createDisasterAlerts(city, alerts, weatherData);
        
        // Send real-time alert via Socket.IO
        req.app.get('io').to(city.toLowerCase()).emit('disaster-alert', {
          city,
          alerts,
          risk_score: weatherData.risk_score,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        success: true,
        data: savedData,
        alerts: alerts.length > 0 ? alerts : null,
        risk_level: this.getRiskLevel(weatherData.risk_score)
      });
      
    } catch (error) {
      console.error('Weather API error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch weather data',
        details: error.message 
      });
    }
  }
  
  // Process raw weather data
  processWeatherData(rawData) {
    return {
      city: rawData.name,
      state: this.getIndianState(rawData.name),
      temperature: Math.round(rawData.main.temp),
      feels_like: Math.round(rawData.main.feels_like),
      humidity: rawData.main.humidity,
      pressure: rawData.main.pressure,
      wind_speed: rawData.wind.speed,
      wind_deg: rawData.wind.deg,
      description: rawData.weather[0].description,
      icon: rawData.weather[0].icon,
      visibility: rawData.visibility / 1000, // Convert to km
      sunrise: new Date(rawData.sys.sunrise * 1000),
      sunset: new Date(rawData.sys.sunset * 1000),
      rain_last_3h: rawData.rain ? rawData.rain['3h'] || 0 : 0,
      coordinates: {
        lat: rawData.coord.lat,
        lon: rawData.coord.lon
      },
      last_updated: new Date()
    };
  }
  
  // Check for disaster conditions
  checkDisasterConditions(weatherData) {
    const alerts = [];
    
    // HEATWAVE: Temp > 40°C
    if (weatherData.temperature > 40) {
      alerts.push({
        type: 'heatwave',
        severity: weatherData.temperature > 45 ? 'severe' : 
                 weatherData.temperature > 42 ? 'high' : 'medium',
        message: `Heatwave alert! Temperature is ${weatherData.temperature}°C`,
        timestamp: new Date()
      });
    }
    
    // HEAVY RAIN / FLOOD RISK
    if (weatherData.rain_last_3h > 50) {
      alerts.push({
        type: 'flood',
        severity: weatherData.rain_last_3h > 100 ? 'severe' : 'high',
        message: `Heavy rainfall: ${weatherData.rain_last_3h}mm in 3 hours - Flood risk`,
        timestamp: new Date()
      });
    }
    
    // HIGH WIND (Cyclone risk)
    if (weatherData.wind_speed > 60) {
      alerts.push({
        type: 'cyclone',
        severity: weatherData.wind_speed > 80 ? 'severe' : 'high',
        message: `High wind warning: ${weatherData.wind_speed} km/h`,
        timestamp: new Date()
      });
    }
    
    // LOW VISIBILITY
    if (weatherData.visibility < 1) {
      alerts.push({
        type: 'other',
        severity: 'medium',
        message: `Low visibility: ${weatherData.visibility} km`,
        timestamp: new Date()
      });
    }
    
    // HIGH HUMIDITY with high temp
    if (weatherData.humidity > 85 && weatherData.temperature > 35) {
      alerts.push({
        type: 'heatwave',
        severity: 'medium',
        message: 'High heat index due to humidity',
        timestamp: new Date()
      });
    }
    
    return alerts;
  }
  
  // Calculate risk score (0-100)
  calculateRiskScore(weatherData, alerts) {
    let score = 0;
    
    // Temperature contribution (max 30 points)
    if (weatherData.temperature > 45) score += 30;
    else if (weatherData.temperature > 42) score += 25;
    else if (weatherData.temperature > 40) score += 20;
    else if (weatherData.temperature > 38) score += 10;
    
    // Rainfall contribution (max 30 points)
    if (weatherData.rain_last_3h > 100) score += 30;
    else if (weatherData.rain_last_3h > 50) score += 20;
    else if (weatherData.rain_last_3h > 20) score += 10;
    
    // Wind contribution (max 20 points)
    if (weatherData.wind_speed > 80) score += 20;
    else if (weatherData.wind_speed > 60) score += 15;
    else if (weatherData.wind_speed > 40) score += 5;
    
    // Alert severity contribution (max 20 points)
    const severeAlerts = alerts.filter(a => a.severity === 'severe').length;
    const highAlerts = alerts.filter(a => a.severity === 'high').length;
    
    score += (severeAlerts * 20) + (highAlerts * 10);
    
    return Math.min(score, 100);
  }
  
  // Get risk level from score
  getRiskLevel(score) {
    if (score >= 80) return 'severe';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'very-low';
  }
  
  // Create disaster alert records
  async createDisasterAlerts(city, alerts, weatherData) {
    const alertPromises = alerts.map(async (alert) => {
      const disasterAlert = new DisasterAlert({
        city: city,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        source: 'weather_api',
        affected_area: city,
        coordinates: weatherData.coordinates,
        valid_from: new Date(),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        instructions: this.getInstructionsForAlert(alert.type, alert.severity),
        status: 'active',
        confirmed_by_system: true,
        ai_confidence: 85
      });
      
      return await disasterAlert.save();
    });
    
    return Promise.all(alertPromises);
  }
  
  // Get instructions based on alert type
  getInstructionsForAlert(type, severity) {
    const instructions = {
      heatwave: [
        'Stay indoors during peak heat hours (12 PM - 4 PM)',
        'Drink plenty of water and stay hydrated',
        'Avoid strenuous outdoor activities',
        'Check on elderly and vulnerable people',
        'Use fans or air conditioning if available'
      ],
      flood: [
        'Move to higher ground immediately',
        'Avoid walking or driving through flood water',
        'Turn off electricity at main switch',
        'Keep important documents in waterproof bags',
        'Follow evacuation orders if issued'
      ],
      cyclone: [
        'Stay indoors and away from windows',
        'Secure loose objects outside',
        'Keep emergency kit ready',
        'Monitor official weather updates',
        'Evacuate if ordered by authorities'
      ]
    };
    
    const baseInstructions = instructions[type] || [
      'Stay alert and monitor weather updates',
      'Follow local authority instructions',
      'Keep emergency contacts handy'
    ];
    
    if (severity === 'severe') {
      baseInstructions.unshift('⚠️ IMMEDIATE ACTION REQUIRED');
      baseInstructions.push('Contact emergency services if needed');
    }
    
    return baseInstructions;
  }
  
  // Map Indian cities to states
  getIndianState(city) {
    const cityToState = {
      'Delhi': 'Delhi',
      'Mumbai': 'Maharashtra',
      'Chennai': 'Tamil Nadu',
      'Bangalore': 'Karnataka',
      'Kolkata': 'West Bengal',
      'Hyderabad': 'Telangana',
      'Pune': 'Maharashtra',
      'Ahmedabad': 'Gujarat',
      'Jaipur': 'Rajasthan',
      'Lucknow': 'Uttar Pradesh',
      'Bhopal': 'Madhya Pradesh',
      'Patna': 'Bihar',
      'Chandigarh': 'Chandigarh',
      'Bhubaneswar': 'Odisha',
      'Guwahati': 'Assam'
    };
    
    return cityToState[city] || 'Unknown';
  }
  
  // Get multiple cities weather
  async getMultipleCities(req, res) {
    try {
      const cities = req.query.cities ? req.query.cities.split(',') : 
        ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
      
      const promises = cities.map(city => 
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&units=metric&appid=${WEATHER_API_KEY}`)
      );
      
      const responses = await Promise.all(promises);
      
      const weatherData = responses.map(response => {
        const processed = this.processWeatherData(response.data);
        const alerts = this.checkDisasterConditions(processed);
        processed.alerts = alerts;
        processed.risk_score = this.calculateRiskScore(processed, alerts);
        return processed;
      });
      
      // Save all to database
      await WeatherData.insertMany(weatherData);
      
      res.json({
        success: true,
        count: weatherData.length,
        data: weatherData,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get weather forecast
  async getForecast(req, res) {
    try {
      const { city } = req.params;
      
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city},IN&units=metric&appid=${WEATHER_API_KEY}`
      );
      
      // Process 5-day forecast
      const forecast = response.data.list
        .filter((item, index) => index % 8 === 0) // Get once per day
        .map(item => ({
          date: new Date(item.dt * 1000),
          temperature: Math.round(item.main.temp),
          feels_like: Math.round(item.main.feels_like),
          humidity: item.main.humidity,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          wind_speed: item.wind.speed,
          rain: item.rain ? item.rain['3h'] || 0 : 0,
          pressure: item.main.pressure
        }));
      
      // Check future alerts
      const futureAlerts = forecast.filter(day => 
        day.rain > 50 || day.temperature > 40 || day.wind_speed > 60
      ).map(day => ({
        date: day.date,
        risk: day.rain > 50 ? 'flood' : day.temperature > 40 ? 'heatwave' : 'high_wind',
        severity: 'medium'
      }));
      
      res.json({
        success: true,
        city: response.data.city.name,
        forecast,
        future_alerts: futureAlerts,
        alert_count: futureAlerts.length
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get cities with active alerts
  async getAlertedCities(req, res) {
    try {
      const alertedCities = await WeatherData.aggregate([
        { $match: { 'alerts.0': { $exists: true } } },
        { $sort: { last_updated: -1 } },
        { $group: {
          _id: '$city',
          latest: { $first: '$$ROOT' },
          alert_count: { $sum: { $size: '$alerts' } }
        }},
        { $project: {
          city: '$_id',
          temperature: '$latest.temperature',
          alerts: '$latest.alerts',
          risk_score: '$latest.risk_score',
          alert_count: 1,
          last_updated: '$latest.last_updated'
        }}
      ]);
      
      res.json({
        success: true,
        count: alertedCities.length,
        cities: alertedCities,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Manual alert check
  async manualAlertCheck(req, res) {
    try {
      const { cities } = req.body;
      
      const citiesToCheck = cities || ['Delhi', 'Mumbai', 'Chennai', 'Bangalore'];
      const results = [];
      
      for (const city of citiesToCheck) {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&units=metric&appid=${WEATHER_API_KEY}`
        );
        
        const weatherData = this.processWeatherData(response.data);
        const alerts = this.checkDisasterConditions(weatherData);
        
        results.push({
          city,
          has_alerts: alerts.length > 0,
          alert_count: alerts.length,
          alerts,
          risk_score: this.calculateRiskScore(weatherData, alerts)
        });
        
        // Send real-time alert if exists
        if (alerts.length > 0) {
          req.app.get('io').emit('disaster-scan', {
            city,
            alerts,
            scan_type: 'manual',
            timestamp: new Date().toISOString()
          });
        }
      }
      
      res.json({
        success: true,
        scan_completed: new Date().toISOString(),
        results,
        total_alerts: results.reduce((sum, r) => sum + r.alert_count, 0)
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new WeatherController();
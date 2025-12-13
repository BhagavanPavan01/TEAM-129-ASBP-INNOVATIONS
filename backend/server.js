const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    status: 'active',
    message: 'Disaster Warning Backend is running!',
    time: new Date().toISOString()
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Risk Report API - For your frontend form
app.post('/api/risks/report', (req, res) => {
  console.log('📝 Risk Report Received:', req.body);
  
  // Create response
  const response = {
    success: true,
    report_id: `REPORT_${Date.now()}`,
    message: 'Risk report submitted successfully!',
    timestamp: new Date().toISOString(),
    data: req.body
  };
  
  console.log('📤 Sending response:', response);
  res.json(response);
});

// Weather API endpoint
app.get('/api/weather/:city', (req, res) => {
  const city = req.params.city;
  console.log(`🌤️ Weather request for: ${city}`);
  
  // Mock weather data (replace with real API call)
  const weatherData = {
    city: city,
    temperature: Math.floor(Math.random() * 15) + 25,
    feels_like: Math.floor(Math.random() * 10) + 25,
    humidity: Math.floor(Math.random() * 30) + 60,
    pressure: 1013,
    description: "Partly cloudy",
    icon: "04d",
    wind_speed: Math.floor(Math.random() * 20) + 5,
    visibility: "10 km",
    sunrise: "06:30 AM",
    sunset: "06:30 PM",
    last_updated: new Date().toISOString()
  };
  
  // Check for alerts
  const alerts = [];
  if (weatherData.temperature > 35) {
    alerts.push({
      type: 'heatwave',
      severity: 'medium',
      message: `High temperature: ${weatherData.temperature}°C`
    });
  }
  
  res.json({
    success: true,
    city: city,
    data: weatherData,
    alerts: alerts,
    risk_level: alerts.length > 0 ? 'medium' : 'low'
  });
});

// Get all alerts
app.get('/api/alerts', (req, res) => {
  res.json({
    success: true,
    alerts: [
      {
        id: 1,
        city: 'Delhi',
        type: 'heatwave',
        severity: 'high',
        message: 'Heatwave warning: Temperature above 40°C',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        city: 'Mumbai',
        type: 'flood',
        severity: 'medium',
        message: 'Heavy rainfall expected',
        timestamp: new Date().toISOString()
      }
    ]
  });
});

// Simple database simulation
const reports = [];

// Get all reports
app.get('/api/reports', (req, res) => {
  res.json({
    success: true,
    count: reports.length,
    reports: reports
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 BACKEND SERVER STARTED`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('\n📡 Available Endpoints:');
  console.log(`   GET  /                    - Health check`);
  console.log(`   GET  /test                - Test endpoint`);
  console.log(`   POST /api/risks/report    - Submit risk report`);
  console.log(`   GET  /api/weather/:city   - Get weather for city`);
  console.log(`   GET  /api/alerts          - Get all alerts`);
  console.log(`   GET  /api/reports         - Get all reports`);
  console.log('\n🔧 To test with curl:');
  console.log(`   curl http://localhost:${PORT}/test`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/risks/report -H "Content-Type: application/json" -d '{"city":"Delhi","risk_type":"flood"}'`);
  console.log('='.repeat(50));
});
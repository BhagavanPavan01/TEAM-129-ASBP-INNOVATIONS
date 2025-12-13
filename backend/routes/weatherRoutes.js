const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Get weather by city name
router.get('/city/:city', weatherController.getWeatherByCity);

// Get weather by coordinates
router.get('/coordinates', weatherController.getWeatherByCoordinates);

// Get multiple cities weather
router.get('/multiple', weatherController.getMultipleCities);

// Get weather forecast
router.get('/forecast/:city', weatherController.getForecast);

// Get historical weather data
router.get('/history/:city', weatherController.getHistoricalData);

// Check for alerts in a city
router.get('/alerts/:city', weatherController.checkCityAlerts);

// Get all cities with alerts
router.get('/alerted-cities', weatherController.getAlertedCities);

// Manual alert check (admin)
router.post('/check-alerts', weatherController.manualAlertCheck);

module.exports = router;
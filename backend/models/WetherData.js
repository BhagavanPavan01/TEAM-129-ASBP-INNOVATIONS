const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    index: true
  },
  state: {
    type: String,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  feels_like: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  pressure: {
    type: Number,
    required: true
  },
  wind_speed: {
    type: Number,
    required: true
  },
  wind_deg: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  visibility: {
    type: Number,
    required: true
  },
  sunrise: {
    type: Date,
    required: true
  },
  sunset: {
    type: Date,
    required: true
  },
  rain_last_3h: {
    type: Number,
    default: 0
  },
  alerts: [{
    type: {
      type: String,
      enum: ['heatwave', 'flood', 'cyclone', 'heavy_rain', 'high_wind', 'other']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'severe']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  risk_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  coordinates: {
    lat: Number,
    lon: Number
  },
  last_updated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for faster queries
weatherSchema.index({ city: 1, last_updated: -1 });
weatherSchema.index({ 'alerts.severity': 1 });
weatherSchema.index({ risk_score: -1 });

module.exports = mongoose.model('WeatherData', weatherSchema);
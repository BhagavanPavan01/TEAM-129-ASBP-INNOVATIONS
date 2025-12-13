const mongoose = require('mongoose');

const disasterAlertSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['heatwave', 'flood', 'cyclone', 'earthquake', 'landslide', 'tsunami', 'drought', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'severe'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['weather_api', 'ai_prediction', 'user_report', 'government'],
    default: 'weather_api'
  },
  affected_area: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lon: Number
  },
  valid_from: {
    type: Date,
    default: Date.now
  },
  valid_until: {
    type: Date,
    required: true
  },
  instructions: [String],
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  reported_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmed_by_system: {
    type: Boolean,
    default: false
  },
  ai_confidence: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes
disasterAlertSchema.index({ type: 1, severity: 1 });
disasterAlertSchema.index({ status: 1, valid_until: 1 });
disasterAlertSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('DisasterAlert', disasterAlertSchema);
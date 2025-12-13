const mongoose = require('mongoose');

const riskReportSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  location: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lon: Number
    }
  },
  risk_type: {
    type: String,
    enum: ['flood', 'earthquake', 'cyclone', 'heatwave', 'landslide', 'other'],
    required: true
  },
  risk_level: {
    type: String,
    enum: ['low', 'medium', 'high', 'severe'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  evidence: [String], // URLs or descriptions
  people_affected: {
    type: Number,
    min: 0
  },
  property_damage: {
    type: String,
    enum: ['none', 'minor', 'moderate', 'severe', 'catastrophic']
  },
  immediate_actions_taken: [String],
  help_needed: [String],
  contact_number: String,
  status: {
    type: String,
    enum: ['pending', 'verified', 'responded', 'resolved', 'false_alarm'],
    default: 'pending'
  },
  verified_by: {
    type: String,
    enum: ['system', 'admin', 'authority']
  },
  verification_time: Date,
  response_time: Number, // in minutes
  resolution_time: Date,
  ai_analysis: {
    confidence: Number,
    pattern_matched: Boolean,
    similar_reports: Number
  }
}, {
  timestamps: true
});

// Indexes for quick queries
riskReportSchema.index({ location: 1, risk_level: 1 });
riskReportSchema.index({ status: 1, created_at: -1 });
riskReportSchema.index({ risk_type: 1, created_at: -1 });

module.exports = mongoose.model('RiskReport', riskReportSchema);
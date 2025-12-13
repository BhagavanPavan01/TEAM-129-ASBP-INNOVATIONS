const RiskReport = require('../models/RiskReport');
const DisasterAlert = require('../models/DisasterAlert');

class RiskController {
  
  // Submit a new risk report
  async submitRiskReport(req, res) {
    try {
      const {
        userId,
        location,
        risk_type,
        risk_level,
        description,
        evidence,
        people_affected,
        property_damage,
        immediate_actions_taken,
        help_needed,
        contact_number
      } = req.body;
      
      // Validate required fields
      if (!risk_type || !risk_level || !description || !location?.city) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // Create risk report
      const riskReport = new RiskReport({
        user_id: userId || 'anonymous',
        location,
        risk_type,
        risk_level,
        description,
        evidence: evidence || [],
        people_affected: people_affected || 0,
        property_damage: property_damage || 'none',
        immediate_actions_taken: immediate_actions_taken || [],
        help_needed: help_needed || [],
        contact_number,
        status: 'pending',
        ai_analysis: await this.analyzeRiskReport(req.body)
      });
      
      const savedReport = await riskReport.save();
      
      // Check if this should trigger a disaster alert
      if (risk_level === 'high' || risk_level === 'severe') {
        await this.createDisasterAlertFromReport(savedReport);
        
        // Send real-time notification
        req.app.get('io').emit('new-risk-report', {
          report_id: savedReport._id,
          city: location.city,
          risk_type,
          risk_level,
          timestamp: new Date().toISOString(),
          message: `New ${risk_level} risk reported in ${location.city}`
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Risk report submitted successfully',
        report_id: savedReport._id,
        data: savedReport,
        next_steps: [
          'Your report is under review',
          'Emergency services have been notified',
          'Check back for updates on response'
        ]
      });
      
    } catch (error) {
      console.error('Risk report error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit risk report'
      });
    }
  }
  
  // AI analysis of risk report
  async analyzeRiskReport(reportData) {
    // This is a simplified AI analysis
    // In production, you would use ML models
    
    let confidence = 70; // Base confidence
    
    // Increase confidence based on evidence
    if (reportData.evidence && reportData.evidence.length > 0) {
      confidence += 15;
    }
    
    if (reportData.people_affected > 10) {
      confidence += 10;
    }
    
    // Check for similar reports in database
    const similarReports = await RiskReport.countDocuments({
      'location.city': reportData.location.city,
      risk_type: reportData.risk_type,
      created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    return {
      confidence: Math.min(confidence, 95),
      pattern_matched: similarReports > 0,
      similar_reports: similarReports
    };
  }
  
  // Create disaster alert from risk report
  async createDisasterAlertFromReport(riskReport) {
    const alert = new DisasterAlert({
      city: riskReport.location.city,
      type: riskReport.risk_type,
      severity: riskReport.risk_level,
      message: `User-reported ${riskReport.risk_type} in ${riskReport.location.city}: ${riskReport.description.substring(0, 100)}...`,
      source: 'user_report',
      affected_area: riskReport.location.city,
      coordinates: riskReport.location.coordinates,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      instructions: this.getInstructionsForRisk(riskReport.risk_type, riskReport.risk_level),
      status: 'active',
      reported_by: riskReport._id,
      confirmed_by_system: false,
      ai_confidence: riskReport.ai_analysis.confidence
    });
    
    return await alert.save();
  }
  
  // Get instructions based on risk type
  getInstructionsForRisk(riskType, riskLevel) {
    const baseInstructions = [
      'Stay calm and assess the situation',
      'Follow local authority instructions',
      'Keep emergency contacts ready'
    ];
    
    if (riskLevel === 'severe') {
      baseInstructions.unshift('⚠️ EVACUATE IF POSSIBLE');
      baseInstructions.push('Contact emergency services immediately');
    }
    
    if (riskLevel === 'high') {
      baseInstructions.unshift('⚠️ TAKE IMMEDIATE PRECAUTIONS');
    }
    
    return baseInstructions;
  }
  
  // Get all risk reports
  async getAllRiskReports(req, res) {
    try {
      const { page = 1, limit = 20, status, sortBy = 'created_at', order = 'desc' } = req.query;
      
      const query = {};
      if (status) query.status = status;
      
      const reports = await RiskReport.find(query)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      const total = await RiskReport.countDocuments(query);
      
      res.json({
        success: true,
        page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_reports: total,
        reports
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get risk reports by city
  async getRiskReportsByCity(req, res) {
    try {
      const { city } = req.params;
      const { days = 7 } = req.query;
      
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const reports = await RiskReport.find({
        'location.city': new RegExp(city, 'i'),
        created_at: { $gte: startDate }
      }).sort({ created_at: -1 });
      
      const stats = {
        total: reports.length,
        by_risk_level: {
          severe: reports.filter(r => r.risk_level === 'severe').length,
          high: reports.filter(r => r.risk_level === 'high').length,
          medium: reports.filter(r => r.risk_level === 'medium').length,
          low: reports.filter(r => r.risk_level === 'low').length
        },
        by_status: {
          pending: reports.filter(r => r.status === 'pending').length,
          verified: reports.filter(r => r.status === 'verified').length,
          responded: reports.filter(r => r.status === 'responded').length,
          resolved: reports.filter(r => r.status === 'resolved').length
        }
      };
      
      res.json({
        success: true,
        city,
        time_period: `${days} days`,
        stats,
        reports
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get risk statistics
  async getRiskStatistics(req, res) {
    try {
      const { days = 30 } = req.query;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const [reportsByType, reportsByLevel, responseStats, recentReports] = await Promise.all([
        // Reports by type
        RiskReport.aggregate([
          { $match: { created_at: { $gte: startDate } } },
          { $group: { _id: '$risk_type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Reports by risk level
        RiskReport.aggregate([
          { $match: { created_at: { $gte: startDate } } },
          { $group: { _id: '$risk_level', count: { $sum: 1 } } }
        ]),
        
        // Response statistics
        RiskReport.aggregate([
          { $match: { response_time: { $exists: true } } },
          { $group: {
            _id: null,
            avg_response_time: { $avg: '$response_time' },
            min_response_time: { $min: '$response_time' },
            max_response_time: { $max: '$response_time' }
          }}
        ]),
        
        // Recent high-risk reports
        RiskReport.find({
          risk_level: { $in: ['high', 'severe'] },
          created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).limit(10).sort({ created_at: -1 })
      ]);
      
      const totalReports = reportsByType.reduce((sum, type) => sum + type.count, 0);
      
      res.json({
        success: true,
        period: `${days} days`,
        total_reports: totalReports,
        by_type: reportsByType,
        by_level: reportsByLevel,
        response_stats: responseStats[0] || {},
        recent_high_risk: recentReports,
        cities_affected: await this.getAffectedCities(startDate)
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get affected cities
  async getAffectedCities(startDate) {
    const cities = await RiskReport.aggregate([
      { $match: { created_at: { $gte: startDate } } },
      { $group: {
        _id: '$location.city',
        report_count: { $sum: 1 },
        high_risk_count: {
          $sum: { $cond: [{ $in: ['$risk_level', ['high', 'severe']] }, 1, 0] }
        }
      }},
      { $sort: { high_risk_count: -1, report_count: -1 } },
      { $limit: 10 }
    ]);
    
    return cities;
  }
  
  // Update risk report status
  async updateRiskStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, verified_by, response_time, notes } = req.body;
      
      const updateData = { status };
      
      if (verified_by) updateData.verified_by = verified_by;
      if (response_time) updateData.response_time = response_time;
      
      if (status === 'verified') {
        updateData.verification_time = new Date();
      }
      
      if (status === 'resolved') {
        updateData.resolution_time = new Date();
      }
      
      const updatedReport = await RiskReport.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!updatedReport) {
        return res.status(404).json({
          success: false,
          error: 'Risk report not found'
        });
      }
      
      // Send status update notification
      req.app.get('io').emit('risk-status-update', {
        report_id: id,
        new_status: status,
        city: updatedReport.location.city,
        timestamp: new Date().toISOString()
      });
      
      res.json({
        success: true,
        message: `Risk report status updated to ${status}`,
        data: updatedReport
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Verify a risk report (admin action)
  async verifyRiskReport(req, res) {
    try {
      const { id } = req.params;
      const { verified_by } = req.body;
      
      const report = await RiskReport.findById(id);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Risk report not found'
        });
      }
      
      report.status = 'verified';
      report.verified_by = verified_by || 'admin';
      report.verification_time = new Date();
      
      await report.save();
      
      // Create or update disaster alert
      await this.updateDisasterAlertFromVerification(report);
      
      res.json({
        success: true,
        message: 'Risk report verified successfully',
        data: report,
        alert_created: true
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Update disaster alert after verification
  async updateDisasterAlertFromVerification(riskReport) {
    await DisasterAlert.findOneAndUpdate(
      { reported_by: riskReport._id },
      {
        confirmed_by_system: true,
        status: 'active',
        ai_confidence: 95,
        verified_at: new Date()
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = new RiskController();
const DisasterAlert = require('../models/DisasterAlert');
const WeatherData = require('../models/WeatherData');
const nodemailer = require('nodemailer');

class AlertService {
  
  // Send email alerts
  async sendEmailAlert(alert, recipients) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      const mailOptions = {
        from: 'Disaster Alert System <alerts@disasterwarning.com>',
        to: recipients.join(', '),
        subject: `🚨 ${alert.severity.toUpperCase()} ALERT: ${alert.type} in ${alert.city}`,
        html: this.generateAlertEmail(alert)
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`📧 Email alert sent for ${alert.city}`);
      
    } catch (error) {
      console.error('Email alert error:', error);
    }
  }
  
  // Generate email HTML
  generateAlertEmail(alert) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .alert-box { 
            border: 3px solid ${this.getAlertColor(alert.severity)};
            border-radius: 10px; 
            padding: 20px; 
            margin: 20px 0;
            background-color: ${this.getAlertBgColor(alert.severity)}15;
          }
          .severity-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            color: white;
            background-color: ${this.getAlertColor(alert.severity)};
            font-weight: bold;
          }
          .instructions { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="alert-box">
          <h1>🚨 Disaster Alert: ${alert.type.toUpperCase()}</h1>
          <p><strong>Location:</strong> ${alert.city}, ${alert.affected_area}</p>
          <p><strong>Severity:</strong> <span class="severity-badge">${alert.severity.toUpperCase()}</span></p>
          <p><strong>Time:</strong> ${new Date(alert.valid_from).toLocaleString()}</p>
          
          <div class="instructions">
            <h3>📋 What to Do:</h3>
            <ul>
              ${alert.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ul>
          </div>
          
          <p><strong>Valid Until:</strong> ${new Date(alert.valid_until).toLocaleString()}</p>
          <p><em>This is an automated alert from the Disaster Warning System.</em></p>
        </div>
      </body>
      </html>
    `;
  }
  
  // Get color based on severity
  getAlertColor(severity) {
    const colors = {
      severe: '#dc2626', // Red
      high: '#ea580c',   // Orange
      medium: '#ca8a04', // Yellow
      low: '#16a34a'     // Green
    };
    return colors[severity] || '#6b7280';
  }
  
  // Get background color
  getAlertBgColor(severity) {
    const colors = {
      severe: '#dc2626',
      high: '#ea580c',
      medium: '#ca8a04',
      low: '#16a34a'
    };
    return colors[severity] || '#6b7280';
  }
  
  // Check for expired alerts
  async checkExpiredAlerts() {
    try {
      const expiredAlerts = await DisasterAlert.updateMany(
        {
          status: 'active',
          valid_until: { $lt: new Date() }
        },
        { status: 'expired' }
      );
      
      if (expiredAlerts.modifiedCount > 0) {
        console.log(`📭 Marked ${expiredAlerts.modifiedCount} alerts as expired`);
      }
      
    } catch (error) {
      console.error('Error checking expired alerts:', error);
    }
  }
  
  // Get active alerts for a city
  async getActiveAlerts(city) {
    return await DisasterAlert.find({
      city: new RegExp(city, 'i'),
      status: 'active',
      valid_until: { $gt: new Date() }
    }).sort({ severity: -1, created_at: -1 });
  }
  
  // Get alert statistics
  async getAlertStats(days = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const stats = await DisasterAlert.aggregate([
      { $match: { created_at: { $gte: startDate } } },
      { $group: {
        _id: {
          type: '$type',
          severity: '$severity'
        },
        count: { $sum: 1 },
        cities: { $addToSet: '$city' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    const totalAlerts = stats.reduce((sum, stat) => sum + stat.count, 0);
    const uniqueCities = [...new Set(stats.flatMap(stat => stat.cities))];
    
    return {
      total_alerts: totalAlerts,
      unique_cities: uniqueCities.length,
      by_type_severity: stats,
      period: `${days} days`
    };
  }
  
  // Send SMS alert (placeholder - integrate with SMS service)
  async sendSMSAlert(alert, phoneNumbers) {
    // This is a placeholder for SMS integration
    // In production, integrate with Twilio, TextLocal, etc.
    
    const message = `ALERT: ${alert.severity} ${alert.type} in ${alert.city}. ${alert.message}`;
    
    console.log(`📱 SMS would be sent to: ${phoneNumbers.join(', ')}`);
    console.log(`Message: ${message}`);
    
    return { success: true, simulated: true };
  }
}

module.exports = new AlertService();
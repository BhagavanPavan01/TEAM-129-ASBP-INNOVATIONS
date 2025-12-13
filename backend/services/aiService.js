// AI Service for risk analysis and suggestions
class AIService {
    constructor() {
        this.riskKeywords = {
            critical: ['flood', 'cyclone', 'tsunami', 'earthquake', 'fire', 'emergency', 'help', 'trapped', 'danger'],
            high: ['heavy rain', 'storm', 'landslide', 'evacuate', 'warning', 'alert', 'severe'],
            medium: ['rain', 'wind', 'hot', 'cold', 'humid', 'cloudy', 'thunder'],
            low: ['weather', 'forecast', 'temperature', 'humidity', 'normal', 'clear']
        };

        this.disasterTypes = {
            flood: ['flood', 'water', 'rain', 'river', 'overflow'],
            cyclone: ['cyclone', 'storm', 'wind', 'hurricane', 'typhoon'],
            heatwave: ['heat', 'hot', 'temperature', 'sun', 'burn'],
            earthquake: ['earthquake', 'shake', 'tremor', 'seismic'],
            landslide: ['landslide', 'mud', 'slide', 'hill', 'erosion']
        };
    }

    // Analyze risk from message
    async analyzeRisk(message, location, weatherData) {
        const lowerMessage = message.toLowerCase();
        
        // Detect disaster type
        let disasterType = 'general';
        let disasterConfidence = 0;
        
        for (const [type, keywords] of Object.entries(this.disasterTypes)) {
            const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
            if (matches.length > 0) {
                disasterType = type;
                disasterConfidence = matches.length / keywords.length;
                break;
            }
        }

        // Calculate risk level
        let riskLevel = 'low';
        let riskScore = 0;

        // Check for urgent keywords
        for (const [level, keywords] of Object.entries(this.riskKeywords)) {
            const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
            if (matches.length > 0) {
                riskScore += matches.length * this.getRiskWeight(level);
            }
        }

        // Adjust based on weather data
        if (weatherData) {
            riskScore += this.calculateWeatherRisk(weatherData);
        }

        // Determine risk level
        if (riskScore >= 10) riskLevel = 'critical';
        else if (riskScore >= 7) riskLevel = 'high';
        else if (riskScore >= 4) riskLevel = 'medium';
        else riskLevel = 'low';

        // Generate risk message
        const riskMessage = this.generateRiskMessage(riskLevel, disasterType, location);

        return {
            riskLevel,
            riskScore,
            disasterType,
            disasterConfidence,
            riskMessage,
            detectedKeywords: this.extractKeywords(lowerMessage),
            timestamp: new Date().toISOString()
        };
    }

    // Generate suggestions based on risk analysis
    async generateSuggestions(message, riskAnalysis) {
        const suggestions = [];
        const { riskLevel, disasterType } = riskAnalysis;

        // Base suggestions for all risk levels
        suggestions.push('Stay informed through official channels');
        suggestions.push('Have an emergency kit ready');

        // Level-specific suggestions
        if (riskLevel === 'critical' || riskLevel === 'high') {
            suggestions.push('🚨 EVACUATE if instructed by authorities');
            suggestions.push('Move to higher ground if flooding is possible');
            suggestions.push('Secure important documents and medications');
            suggestions.push('Charge all electronic devices');
        }

        if (riskLevel === 'medium') {
            suggestions.push('Monitor weather updates regularly');
            suggestions.push('Prepare emergency supplies');
            suggestions.push('Identify safe locations in your area');
        }

        // Disaster-specific suggestions
        if (disasterType === 'flood') {
            suggestions.push('Avoid walking or driving through flood waters');
            suggestions.push('Turn off electricity at main switch if flooding occurs');
        } else if (disasterType === 'cyclone') {
            suggestions.push('Stay indoors and away from windows');
            suggestions.push('Secure loose outdoor items');
        } else if (disasterType === 'earthquake') {
            suggestions.push('Drop, Cover, and Hold On during shaking');
            suggestions.push('Stay away from buildings after shaking stops');
        }

        // Add location-specific suggestion if available
        if (message.includes('area') || message.includes('location')) {
            suggestions.push('Check local government alerts for specific instructions');
        }

        return suggestions.slice(0, 6); // Return max 6 suggestions
    }

    // Helper methods
    getRiskWeight(level) {
        const weights = { critical: 3, high: 2, medium: 1, low: 0.5 };
        return weights[level] || 1;
    }

    calculateWeatherRisk(weatherData) {
        let score = 0;
        
        if (weatherData.temperature > 40) score += 2; // Extreme heat
        if (weatherData.temperature < 0) score += 2;  // Extreme cold
        if (weatherData.windSpeed > 50) score += 3;   // High wind
        if (weatherData.humidity > 90) score += 1;    // High humidity
        if (weatherData.condition?.includes('thunder')) score += 2;
        if (weatherData.condition?.includes('storm')) score += 3;
        
        return score;
    }

    generateRiskMessage(riskLevel, disasterType, location) {
        const locationText = location ? ` in ${location}` : '';
        
        const messages = {
            critical: `CRITICAL ${disasterType.toUpperCase()} RISK detected${locationText}! Immediate action required.`,
            high: `HIGH ${disasterType.toUpperCase()} risk${locationText}. Prepare for possible emergency.`,
            medium: `MODERATE ${disasterType} risk${locationText}. Stay alert and monitor conditions.`,
            low: `Low risk${locationText}. Conditions appear normal but stay informed.`
        };

        return messages[riskLevel] || `Risk assessment complete${locationText}.`;
    }

    extractKeywords(message) {
        const allKeywords = [
            ...this.riskKeywords.critical,
            ...this.riskKeywords.high,
            ...this.riskKeywords.medium,
            ...this.riskKeywords.low
        ];
        
        return allKeywords.filter(keyword => message.includes(keyword));
    }
}

module.exports = new AIService();
const fs = require('fs').promises;
const path = require('path');
const { analyzeRisk, generateSuggestions } = require('../services/aiService');
const { createAlert } = require('./alertController');

// Path to store chat history
const CHAT_HISTORY_PATH = path.join(__dirname, '../data/chatHistory.json');

class MessageController {
    // Process user message and get AI response
    async processMessage(req, res) {
        try {
            const { message, location, weatherData } = req.body;
            
            if (!message) {
                return res.status(400).json({ 
                    error: 'Message is required',
                    success: false 
                });
            }

            // 1. Analyze message for risk assessment
            const riskAnalysis = await analyzeRisk(message, location, weatherData);
            
            // 2. Generate AI suggestions based on message
            const suggestions = await generateSuggestions(message, riskAnalysis);
            
            // 3. Create alert if risk is high
            let alert = null;
            if (riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical') {
                alert = await createAlert({
                    message: riskAnalysis.riskMessage,
                    location: location || 'Unknown',
                    riskLevel: riskAnalysis.riskLevel,
                    type: riskAnalysis.disasterType
                });
            }

            // 4. Save message to history
            await this.saveMessage({
                id: Date.now().toString(),
                text: message,
                sender: 'user',
                timestamp: new Date().toISOString(),
                location,
                riskAnalysis,
                suggestions
            });

            // 5. Prepare AI response
            const aiResponse = {
                id: Date.now().toString() + '-ai',
                text: this.formatAIResponse(riskAnalysis, suggestions),
                sender: 'ai',
                timestamp: new Date().toISOString(),
                riskAnalysis,
                suggestions,
                alert: alert ? {
                    id: alert.id,
                    message: alert.message,
                    riskLevel: alert.riskLevel
                } : null
            };

            // Save AI response
            await this.saveMessage(aiResponse);

            res.json({
                success: true,
                response: aiResponse,
                riskAnalysis,
                suggestions,
                alert: alert
            });

        } catch (error) {
            console.error('Error processing message:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to process message',
                message: 'Our AI assistant is currently unavailable. Please try again.'
            });
        }
    }

    // Save message to history
    async saveMessage(messageData) {
        try {
            let chatHistory = [];
            
            // Read existing history
            try {
                const data = await fs.readFile(CHAT_HISTORY_PATH, 'utf8');
                chatHistory = JSON.parse(data);
            } catch (err) {
                // File doesn't exist, start with empty array
                chatHistory = [];
            }

            // Add new message
            chatHistory.push(messageData);
            
            // Keep only last 100 messages
            if (chatHistory.length > 100) {
                chatHistory = chatHistory.slice(-100);
            }

            // Save to file
            await fs.writeFile(CHAT_HISTORY_PATH, JSON.stringify(chatHistory, null, 2));
            
            return true;
        } catch (error) {
            console.error('Error saving message:', error);
            return false;
        }
    }

    // Get chat history
    async getChatHistory(req, res) {
        try {
            const data = await fs.readFile(CHAT_HISTORY_PATH, 'utf8');
            const history = JSON.parse(data);
            
            // Get only messages with risk analysis for dashboard
            const analyzedMessages = history.filter(msg => msg.riskAnalysis);
            
            res.json({
                success: true,
                history: history.slice(-50), // Last 50 messages
                analyzedMessages,
                totalMessages: history.length
            });
        } catch (error) {
            console.error('Error reading chat history:', error);
            res.json({
                success: true,
                history: [],
                analyzedMessages: [],
                totalMessages: 0
            });
        }
    }

    // Format AI response based on risk analysis
    formatAIResponse(riskAnalysis, suggestions) {
        const riskLevel = riskAnalysis.riskLevel;
        
        const responses = {
            critical: `🚨 CRITICAL RISK DETECTED! ${riskAnalysis.riskMessage}\n\nIMMEDIATE ACTIONS:\n${suggestions.join('\n')}\n\n⚠️ Please take immediate precautions and follow local authority instructions.`,
            high: `⚠️ HIGH RISK WARNING: ${riskAnalysis.riskMessage}\n\nRecommended actions:\n${suggestions.join('\n')}\n\nStay alert and monitor weather updates.`,
            medium: `🔶 MODERATE RISK: ${riskAnalysis.riskMessage}\n\nSuggestions:\n${suggestions.join('\n')}\n\nKeep monitoring the situation.`,
            low: `✅ LOW RISK: ${riskAnalysis.riskMessage}\n\nSafety tips:\n${suggestions.join('\n')}\n\nNo immediate action required, but stay informed.`
        };

        return responses[riskLevel] || `Analysis: ${riskAnalysis.riskMessage}\n\n${suggestions.join('\n')}`;
    }

    // Learn from messages (train AI model)
    async learnFromMessages(req, res) {
        try {
            const { messages, feedback } = req.body;
            
            // Read existing training data
            let trainingData = [];
            const TRAINING_PATH = path.join(__dirname, '../data/trainingData.json');
            
            try {
                const data = await fs.readFile(TRAINING_PATH, 'utf8');
                trainingData = JSON.parse(data);
            } catch (err) {
                trainingData = [];
            }

            // Add new training data
            const newTrainingData = messages.map(msg => ({
                input: msg.text,
                output: {
                    riskLevel: msg.riskAnalysis?.riskLevel || 'low',
                    suggestions: msg.suggestions || []
                },
                feedback: feedback || 'positive',
                timestamp: new Date().toISOString()
            }));

            trainingData.push(...newTrainingData);
            
            // Save training data
            await fs.writeFile(TRAINING_PATH, JSON.stringify(trainingData, null, 2));

            res.json({
                success: true,
                message: `Learned from ${newTrainingData.length} messages`,
                totalTrainingSamples: trainingData.length
            });

        } catch (error) {
            console.error('Error in learning:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to learn from messages' 
            });
        }
    }
}

module.exports = new MessageController();
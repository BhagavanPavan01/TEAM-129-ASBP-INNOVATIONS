const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Process new message
router.post('/process', messageController.processMessage);

// Get chat history
router.get('/history', messageController.getChatHistory);

// AI learning endpoint
router.post('/learn', messageController.learnFromMessages);

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Message API is working',
        endpoints: [
            'POST /api/messages/process - Process new message',
            'GET /api/messages/history - Get chat history',
            'POST /api/messages/learn - Train AI from messages'
        ]
    });
});

module.exports = router;
import express from 'express';
import { analyzeMessage } from '../ai-model';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, location } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process through AI model
    const analysis = await analyzeMessage(message, location);
    
    res.json({
      response: analysis.answer,
      alerts: analysis.alerts,
      confidence: analysis.confidence,
      suggestions: analysis.suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
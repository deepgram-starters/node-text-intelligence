import express from 'express';
import { createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

// Text Intelligence Interface Compliant Endpoint (implements minimal starter-contracts specification)
// Minimal text-based approach: accepts JSON with text
app.post('/text-intelligence/analyze', async (req, res) => {
  try {
    // Echo X-Request-Id header if provided
    const requestId = req.headers['x-request-id'];
    if (requestId) {
      res.setHeader('X-Request-Id', requestId);
    }

    // Validate request body exists and has text
    if (!req.body || !req.body.text) {
      return res.status(400).json({
        error: {
          type: "validation_error",
          code: "INVALID_TEXT",
          message: "Request body must contain 'text' field",
          details: {}
        }
      });
    }

    const { text } = req.body;

    // Check for empty text
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: {
          type: "validation_error",
          code: "EMPTY_TEXT",
          message: "Text field cannot be empty",
          details: {}
        }
      });
    }

    // Extract only the language and summarize query parameters (minimal contract)
    const { language, summarize } = req.query;

    // Build Deepgram options
    const options = {
      language: language || 'en'
    };

    // Handle summarize parameter (boolean or string)
    if (summarize === 'true' || summarize === true) {
      options.summarize = true;
    } else if (summarize === 'v1' || summarize === 'v2') {
      options.summarize = summarize;
    }

    // Call Deepgram API (SDK v4 returns { result, error })
    const { result, error } = await deepgram.read.analyzeText({ text }, options);

    // Handle SDK errors
    if (error) {
      console.error('Deepgram API Error:', error);
      return res.status(400).json({
        error: {
          type: "processing_error",
          code: "INVALID_TEXT",
          message: error.message || 'Failed to process text',
          details: {}
        }
      });
    }

    // Return simplified response matching contract
    res.json({
      results: {
        summary: result.results?.summary || {}
      }
    });

  } catch (err) {
    console.error('Text Intelligence Error:', err);

    // Echo X-Request-Id even in errors
    const requestId = req.headers['x-request-id'];
    if (requestId) {
      res.setHeader('X-Request-Id', requestId);
    }

    // Determine appropriate error code
    let errorCode = "INVALID_TEXT";
    let statusCode = 500;

    if (err.message && err.message.includes('text')) {
      errorCode = "INVALID_TEXT";
      statusCode = 400;
    } else if (err.message && err.message.includes('too long')) {
      errorCode = "TEXT_TOO_LONG";
      statusCode = 400;
    }

    res.status(statusCode).json({
      error: {
        type: "processing_error",
        code: errorCode,
        message: err.message || "Text processing failed",
        details: {}
      }
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'text-intelligence' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Text Intelligence server running on http://localhost:${PORT}`);
  console.log(`📊 Test endpoint: POST http://localhost:${PORT}/text-intelligence/analyze`);
});


import express from 'express';
import { createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();

// Configure Multer for multipart/form-data (stores in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

// Text Intelligence Interface Compliant Endpoint (implements minimal starter-contracts specification)
// Accepts multipart/form-data with either text or url
app.post('/text-intelligence/analyze', upload.none(), async (req, res) => {
  try {
    // Echo X-Request-Id header if provided
    const requestId = req.headers['x-request-id'];
    if (requestId) {
      res.setHeader('X-Request-Id', requestId);
    }

    // Extract text or url from multipart form data
    const { text, url } = req.body;

    // Validate that either text or url is provided (but not neither)
    if (!text && !url) {
      return res.status(400).json({
        error: {
          type: "validation_error",
          code: "INVALID_TEXT",
          message: "Request must contain either 'text' or 'url' field",
          details: {}
        }
      });
    }

    // Get the text content (either directly or from URL)
    let textContent;

    if (url) {
      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({
          error: {
            type: "validation_error",
            code: "INVALID_URL",
            message: "Invalid URL format",
            details: {}
          }
        });
      }

      // Fetch text from URL
      try {
        const response = await fetch(url);
        if (!response.ok) {
          return res.status(400).json({
            error: {
              type: "validation_error",
              code: "INVALID_URL",
              message: `Failed to fetch URL: ${response.statusText}`,
              details: {}
            }
          });
        }
        textContent = await response.text();
      } catch (e) {
        return res.status(400).json({
          error: {
            type: "validation_error",
            code: "INVALID_URL",
            message: `Failed to fetch URL: ${e.message}`,
            details: {}
          }
        });
      }
    } else {
      textContent = text;
    }

    // Check for empty text
    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({
        error: {
          type: "validation_error",
          code: "EMPTY_TEXT",
          message: "Text content cannot be empty",
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
    const { result, error } = await deepgram.read.analyzeText({ text: textContent }, options);

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


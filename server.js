/**
 * Node Text Intelligence Starter - Backend Server
 *
 * Simple REST API server providing text intelligence analysis
 * powered by Deepgram's Text Intelligence service.
 *
 * Key Features:
 * - Contract-compliant API endpoint: POST /text-intelligence/analyze
 * - Accepts text or URL in JSON body
 * - Supports multiple intelligence features: summarization, topics, sentiment, intents
 * - CORS-enabled for frontend communication
 */

require("dotenv").config();

const express = require("express");
const { createClient } = require("@deepgram/sdk");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const toml = require("toml");

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  port: process.env.PORT || 8081,
  host: process.env.HOST || '0.0.0.0',
  frontendPort: process.env.FRONTEND_PORT || 8080,
};

// ============================================================================
// API KEY LOADING
// ============================================================================

function loadApiKey() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    console.error('\n❌ ERROR: Deepgram API key not found!\n');
    console.error('Please set your API key in .env file:');
    console.error('   DEEPGRAM_API_KEY=your_api_key_here\n');
    console.error('Get your API key at: https://console.deepgram.com\n');
    process.exit(1);
  }

  return apiKey;
}

const apiKey = loadApiKey();

// Initialize Deepgram client
const deepgram = createClient(apiKey);

// Initialize Express app
const app = express();

// Middleware for parsing JSON request bodies
app.use(express.json());

// Enable CORS for frontend
app.use(cors({
  origin: [
    `http://localhost:${CONFIG.frontendPort}`,
    `http://127.0.0.1:${CONFIG.frontendPort}`
  ],
  credentials: true
}));

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * POST /text-intelligence/analyze
 *
 * Contract-compliant text intelligence endpoint per starter-contracts specification.
 * Accepts:
 * - Query parameters: summarize, topics, sentiment, intents, language (all optional)
 * - Body: JSON with either text or url field (required, not both)
 *
 * Returns:
 * - Success (200): JSON with results object containing requested intelligence features
 * - Error (4XX): JSON error response matching contract format
 */
app.post('/text-intelligence/analyze', async (req, res) => {
  try {
    // Extract text or url from JSON body
    const { text, url } = req.body;

    // Validate that exactly one of text or url is provided
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

    if (text && url) {
      return res.status(400).json({
        error: {
          type: "validation_error",
          code: "INVALID_TEXT",
          message: "Request must contain either 'text' or 'url', not both",
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

    // Extract query parameters for intelligence features
    const { language, summarize, topics, sentiment, intents } = req.query;

    // Build Deepgram options
    const options = {
      language: language || 'en'
    };

    // Handle summarize parameter (boolean or string)
    if (summarize === 'true' || summarize === true) {
      options.summarize = true;
    } else if (summarize === 'v2') {
      options.summarize = summarize;
    } else if (summarize === 'v1') {
      // v1 is no longer supported
      return res.status(400).json({
        error: {
          type: "validation_error",
          code: "INVALID_TEXT",
          message: "Summarization v1 is no longer supported. Please use v2 or true.",
          details: {}
        }
      });
    }

    // Handle topics parameter
    if (topics === 'true' || topics === true) {
      options.topics = true;
    }

    // Handle sentiment parameter
    if (sentiment === 'true' || sentiment === true) {
      options.sentiment = true;
    }

    // Handle intents parameter
    if (intents === 'true' || intents === true) {
      options.intents = true;
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

    // Return full results object (includes all requested features)
    res.json({
      results: result.results || {}
    });

  } catch (err) {
    console.error('Text Intelligence Error:', err);

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

// Metadata endpoint (required for standardization)
app.get('/api/metadata', (req, res) => {
  try {
    const tomlPath = path.join(__dirname, 'deepgram.toml');
    const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
    const config = toml.parse(tomlContent);

    if (!config.meta) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Missing [meta] section in deepgram.toml'
      });
    }

    res.json(config.meta);
  } catch (error) {
    console.error('Error reading metadata:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to read metadata from deepgram.toml'
    });
  }
});

// ============================================================================
// SERVER START
// ============================================================================

app.listen(CONFIG.port, CONFIG.host, () => {
  console.log('');
  console.log('======================================================================');
  console.log(`🚀 Backend API Server running at http://localhost:${CONFIG.port}`);
  console.log(`📡 CORS enabled for http://localhost:${CONFIG.frontendPort}`);
  console.log('');
  console.log(`💡 Frontend should be running on http://localhost:${CONFIG.frontendPort}`);
  console.log('======================================================================');
  console.log('');
});

/**
 * Node Text Intelligence Starter - Backend Server
 *
 * This is a simple Express server that provides a text intelligence API endpoint
 * powered by Deepgram's Text Intelligence service. It's designed to be easily
 * modified and extended for your own projects.
 *
 * Key Features:
 * - Contract-compliant API endpoint: POST /text-intelligence/analyze
 * - Accepts text or URL in JSON body
 * - Supports multiple intelligence features: summarization, topics, sentiment, intents
 * - Proxies to Vite dev server in development
 * - Serves static frontend in production
 */

import express from 'express';
import { createClient } from '@deepgram/sdk';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  vitePort: process.env.VITE_PORT || 5173,
  isDevelopment: process.env.NODE_ENV === 'development',
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

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * POST /text-intelligence/analyze
 *
 * Contract-compliant text intelligence endpoint per starter-contracts specification.
 * Accepts:
 * - Query parameters: summarize, topics, sentiment, intents, language (all optional)
 * - Header: X-Request-Id (optional, echoed back)
 * - Body: JSON with either text or url field (required, not both)
 *
 * Returns:
 * - Success (200): JSON with results object containing requested intelligence features
 * - Error (4XX): JSON error response matching contract format
 */
app.post('/text-intelligence/analyze', async (req, res) => {
  // Echo X-Request-Id header if provided
  const requestId = req.headers['x-request-id'];
  if (requestId) {
    res.setHeader('X-Request-Id', requestId);
  }

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

// ============================================================================
// FRONTEND SERVING - Development proxy or production static files
// ============================================================================

/**
 * In development: Proxy all requests to Vite dev server for hot reload
 * In production: Serve pre-built static files from frontend/dist
 *
 * IMPORTANT: This MUST come AFTER your API routes to avoid conflicts
 */
if (CONFIG.isDevelopment) {
  // Development: Proxy to Vite dev server
  app.use(
    '/',
    createProxyMiddleware({
      target: `http://localhost:${CONFIG.vitePort}`,
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying for Vite HMR (Hot Module Reload)
    })
  );
} else {
  // Production: Serve static files from frontend/dist
  const distPath = path.join(__dirname, 'frontend', 'dist');
  app.use(express.static(distPath));
}

// ============================================================================
// SERVER START
// ============================================================================

app.listen(CONFIG.port, CONFIG.host, () => {
  console.log("\n" + "=".repeat(70));
  console.log(
    `🚀 Text Intelligence Backend Server running at http://localhost:${CONFIG.port}`
  );
  if (CONFIG.isDevelopment) {
    console.log(
      `📡 Proxying frontend from Vite dev server on port ${CONFIG.vitePort}`
    );
    console.log(`\n⚠️  Open your browser to http://localhost:${CONFIG.port}`);
  } else {
    console.log(`📦 Serving built frontend from frontend/dist`);
  }
  console.log("=".repeat(70) + "\n");
});


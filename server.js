/**
 * Node Text Intelligence Starter - Backend Server
 *
 * Simple REST API server providing text intelligence analysis
 * powered by Deepgram's Text Intelligence service.
 *
 * Key Features:
 * - Contract-compliant API endpoint: POST /api/text-intelligence
 * - Accepts text or URL in JSON body
 * - Supports multiple intelligence features: summarization, topics, sentiment, intents
 * - CORS-enabled for frontend communication
 * - JWT session auth with page nonce (production only)
 */

require("dotenv").config();

const { createClient } = require("@deepgram/sdk");
const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const toml = require("toml");

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  port: process.env.PORT || 8081,
  host: process.env.HOST || '0.0.0.0',
};

// ============================================================================
// SESSION AUTH - JWT tokens with page nonce for production security
// ============================================================================

/**
 * Session secret for signing JWTs. When set (production/Fly.io), nonce
 * validation is enforced. When unset (local dev), tokens are issued freely.
 */
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const REQUIRE_NONCE = !!process.env.SESSION_SECRET;

/** In-memory nonce store: nonce -> expiry timestamp */
const sessionNonces = new Map();

/** Nonce expiry time (5 minutes) */
const NONCE_TTL_MS = 5 * 60 * 1000;

/** JWT expiry time (1 hour) */
const JWT_EXPIRY = "1h";

/**
 * Generates a single-use nonce and stores it with an expiry
 * @returns {string} The generated nonce
 */
function generateNonce() {
  const nonce = crypto.randomBytes(16).toString("hex");
  sessionNonces.set(nonce, Date.now() + NONCE_TTL_MS);
  return nonce;
}

/**
 * Validates and consumes a nonce (single-use)
 * @param {string} nonce - The nonce to validate
 * @returns {boolean} True if the nonce was valid and consumed
 */
function consumeNonce(nonce) {
  const expiry = sessionNonces.get(nonce);
  if (!expiry) return false;
  sessionNonces.delete(nonce);
  return Date.now() < expiry;
}

/** Periodically clean up expired nonces (every 60 seconds) */
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiry] of sessionNonces) {
    if (now >= expiry) sessionNonces.delete(nonce);
  }
}, 60_000);

/**
 * Reads frontend/dist/index.html and injects a session nonce meta tag.
 * Returns null in dev mode (no built frontend).
 */
let indexHtmlTemplate = null;
try {
  indexHtmlTemplate = fs.readFileSync(
    path.join(__dirname, "frontend", "dist", "index.html"),
    "utf-8"
  );
} catch {
  // No built frontend (dev mode) — index.html served by Vite
}

/**
 * Express middleware that validates JWT from Authorization header.
 * Returns 401 with JSON error if token is missing or invalid.
 */
function requireSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        type: "AuthenticationError",
        code: "MISSING_TOKEN",
        message: "Authorization header with Bearer token is required",
      },
    });
  }

  try {
    const token = authHeader.slice(7);
    jwt.verify(token, SESSION_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        type: "AuthenticationError",
        code: "INVALID_TOKEN",
        message:
          err.name === "TokenExpiredError"
            ? "Session expired, please refresh the page"
            : "Invalid session token",
      },
    });
  }
}

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

// Enable CORS (wildcard is safe -- same-origin via Vite proxy / Caddy in production)
app.use(cors());

// ============================================================================
// SESSION ROUTES - Auth endpoints (unprotected)
// ============================================================================

/**
 * GET / — Serve index.html with injected session nonce (production only).
 * In dev mode, Vite serves the frontend directly.
 */
app.get("/", (req, res) => {
  if (!indexHtmlTemplate) {
    return res.status(404).send("Frontend not built. Run make build first.");
  }
  const nonce = generateNonce();
  const html = indexHtmlTemplate.replace(
    "</head>",
    `<meta name="session-nonce" content="${nonce}">\n</head>`
  );
  res.type("html").send(html);
});

/**
 * GET /api/session — Issues a JWT. In production (SESSION_SECRET set),
 * requires a valid single-use nonce via X-Session-Nonce header.
 */
app.get("/api/session", (req, res) => {
  if (REQUIRE_NONCE) {
    const nonce = req.headers["x-session-nonce"];
    if (!nonce || !consumeNonce(nonce)) {
      return res.status(403).json({
        error: {
          type: "AuthenticationError",
          code: "INVALID_NONCE",
          message: "Valid session nonce required. Please refresh the page.",
        },
      });
    }
  }

  const token = jwt.sign({ iat: Math.floor(Date.now() / 1000) }, SESSION_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
  res.json({ token });
});

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * POST /api/text-intelligence
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
app.post('/api/text-intelligence', requireSession, async (req, res) => {
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
  console.log("\n" + "=".repeat(70));
  console.log(`🚀 Backend API running at http://localhost:${CONFIG.port}`);
  console.log(`📡 GET  /api/session${REQUIRE_NONCE ? " (nonce required)" : ""}`);
  console.log(`📡 POST /api/text-intelligence (auth required)`);
  console.log(`📡 GET  /api/metadata`);
  console.log("=".repeat(70) + "\n");
});

import express from 'express';
import { createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Ajv for schema validation
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Load schemas from starter-contracts
const contractsPath = '../starter-contracts/interfaces/text-intelligence/schema';
const requestSchema = JSON.parse(readFileSync(join(__dirname, contractsPath, 'request.json'), 'utf8'));
const validateRequest = ajv.compile(requestSchema);

// Initialize Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

// Helper function to send structured errors
function sendError(res, statusCode, errorCode, message, details = {}) {
  res.status(statusCode).json({
    error: {
      type: 'VALIDATION_ERROR',
      code: errorCode,
      message: message,
      details: details
    }
  });
}

// Custom JSON error handler middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'INVALID_REQUEST', 'Malformed JSON in request body');
  }
  next();
});

// Text Intelligence endpoint
app.post('/text-intelligence/analyze', async (req, res) => {
  try {
    // Check for empty body first
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendError(res, 400, 'MISSING_TEXT_OR_URL', 'Request must include either text or url field');
    }

    // Validate request body
    const valid = validateRequest(req.body);
    if (!valid) {
      // Check if it's missing both text and url
      const { text, url } = req.body;
      if (!text && !url) {
        return sendError(res, 400, 'MISSING_TEXT_OR_URL', 'Request must include either text or url field');
      }
      return sendError(res, 400, 'INVALID_REQUEST', 'Request validation failed', {
        errors: validateRequest.errors
      });
    }

    // Extract parameters
    const { text, url } = req.body;
    const queryParams = req.query;

    // Build Deepgram options
    const options = {
      language: queryParams.language || 'en'
    };
    if (queryParams.summarize === 'true') options.summarize = true;
    if (queryParams.sentiment === 'true') options.sentiment = true;
    if (queryParams.topics === 'true') options.topics = true;
    if (queryParams.intents === 'true') options.intents = true;
    if (queryParams.custom_topic) {
      options.topics = true;
      options.custom_topic = Array.isArray(queryParams.custom_topic) ? queryParams.custom_topic : [queryParams.custom_topic];
    }
    if (queryParams.custom_intent) {
      options.intents = true;
      options.custom_intent = Array.isArray(queryParams.custom_intent) ? queryParams.custom_intent : [queryParams.custom_intent];
    }

    // Call Deepgram API (SDK v4 returns { result, error })
    let dgResponse;
    if (text) {
      dgResponse = await deepgram.read.analyzeText({ text }, options);
    } else if (url) {
      try {
        dgResponse = await deepgram.read.analyzeUrl({ url }, options);
      } catch (urlError) {
        return sendError(res, 400, 'URL_FETCH_FAILED', 'Failed to fetch content from URL');
      }
    }

    // Handle SDK errors
    if (dgResponse.error) {
      console.error('Deepgram API Error:', dgResponse.error);
      return sendError(res, 400, 'TEXT_PROCESSING_FAILED', dgResponse.error.message || 'Failed to process text');
    }

    const result = dgResponse.result;

    // Transform response to match contract
    const response = {
      metadata: {
        request_id: result.metadata?.request_id || crypto.randomUUID(),
        created: result.metadata?.created || new Date().toISOString(),
        language: result.metadata?.language || 'en'
      },
      results: {}
    };

    // Add feature-specific info to metadata
    if (result.metadata?.summary_info) {
      response.metadata.summary_info = result.metadata.summary_info;
    }
    if (result.metadata?.sentiment_info) {
      response.metadata.sentiment_info = result.metadata.sentiment_info;
    }
    if (result.metadata?.topics_info) {
      response.metadata.topics_info = result.metadata.topics_info;
    }
    if (result.metadata?.intents_info) {
      response.metadata.intents_info = result.metadata.intents_info;
    }

    // Add results
    if (result.results?.summary) {
      response.results.summary = result.results.summary;
    }
    if (result.results?.sentiments) {
      response.results.sentiments = result.results.sentiments;
    }
    if (result.results?.topics) {
      response.results.topics = result.results.topics;
    }
    if (result.results?.intents) {
      response.results.intents = result.results.intents;
    }

    res.json(response);

  } catch (error) {
    console.error('Text Intelligence Error:', error);

    // Handle Deepgram API errors
    if (error.message) {
      return sendError(res, 400, 'TEXT_PROCESSING_FAILED', error.message);
    }

    sendError(res, 500, 'TEXT_PROCESSING_FAILED', 'Internal server error processing text');
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


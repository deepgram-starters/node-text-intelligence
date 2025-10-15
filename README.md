# Text Intelligence Starter App

Simple Node.js backend for testing Text Intelligence conformance tests.

> THIS APP SHOULD BE REFACTORED BEFORE MAKING PUBLIC. IS DOES NOT MEET OUR STANDARDS.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp sample.env .env
   # Edit .env and add your DEEPGRAM_API_KEY
   ```

3. **Start the server:**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

4. **Test it:**
   ```bash
   curl -X POST http://localhost:3000/text-intelligence/analyze \
     -H "Content-Type: application/json" \
     -d '{"text": "Deepgram is amazing!"}' \
     -G -d summarize=true
   ```

## Run Conformance Tests

```bash
cd ../starter-contracts
BASE_URL=http://localhost:3000 npm run test:text-intelligence
```

## Endpoints

### `POST /text-intelligence/analyze`

Analyzes text with optional intelligence features.

**Query Parameters:**
- `summarize=true` - Generate summary
- `sentiment=true` - Analyze sentiment
- `topics=true` - Detect topics
- `intents=true` - Recognize intents

**Request Body:**
```json
{
  "text": "Your text here..."
}
```

Or URL-based:
```json
{
  "url": "https://example.com/article.txt"
}
```

## Architecture

This starter implements the Text Intelligence interface contract from `starter-contracts`. It:
- Validates requests using Ajv + JSON schemas
- Calls Deepgram's Text Intelligence API
- Transforms responses to match the contract
- Handles errors with structured error codes

Built specifically to validate conformance tests work correctly!

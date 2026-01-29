# Node Text Intelligence Starter

Text intelligence demo using Deepgram's Read API with Node.js backend and web frontend.

## Prerequisites

- [Deepgram API Key](https://console.deepgram.com/signup?jump=keys) (sign up for free)
- Node.js 24+ and pnpm 10+

**Note:** This project uses strict supply chain security measures. npm and yarn will NOT work - pnpm 10.0.0+ is required. See [SECURITY.md](SECURITY.md) for details.

## Quick Start

1. **Clone the repository**

Clone the repository with submodules (the frontend is a shared submodule):

```bash
git clone --recurse-submodules https://github.com/deepgram-starters/node-text-intelligence.git
cd node-text-intelligence
```

2. **Install dependencies**

```bash
# Option 1: Use the helper script (recommended)
pnpm run install:all

# Option 2: Manual two-step install
pnpm install
cd frontend && pnpm install && cd ..
```

**Note:** Due to security settings (`ignore-scripts=true`), frontend dependencies must be installed separately. The `install:all` script handles both steps. See [SECURITY.md](SECURITY.md) for details.

3. **Set your API key**

Create a `.env` file:

```bash
DEEPGRAM_API_KEY=your_api_key_here
```

4. **Run the app**

**Development mode** (with hot reload):

```bash
pnpm dev
```

**Production mode** (build and serve):

```bash
pnpm build
pnpm start
```

### 🌐 Open the App

[http://localhost:8080](http://localhost:8080)

## How It Works

This application:
1. Analyze text or URLs for intelligence insights for multiple analysis types:
  - **Summarization**: Generate concise summaries
  - **Topic Detection**: Identify key topics
  - **Sentiment Analysis**: Detect positive, negative, or neutral sentiment
  - **Intent Recognition**: Understand user intentions
2. Returns analysis history

## Makefile Commands

This project includes a Makefile for framework-agnostic operations:

```bash
make help              # Show all available commands
make init              # Initialize submodules and install dependencies
make dev               # Start development servers
make build             # Build frontend for production
make start             # Start production server
make update            # Update submodules to latest
make clean             # Remove node_modules and build artifacts
make status            # Show git and submodule status
```

Use `make` commands for a consistent experience regardless of package manager.

## Getting Help

- [Open an issue](https://github.com/deepgram-starters/node-text-intelligence/issues/new)
- [Join our Discord](https://discord.gg/xWRaCDBtW4)
- [Deepgram Documentation](https://developers.deepgram.com/)

## Contributing

See our [Contributing Guidelines](./CONTRIBUTING.md) to learn about contributing to this project.

## Code of Conduct

This project follows the [Deepgram Code of Conduct](./CODE_OF_CONDUCT.md).

## Security

For security policy and procedures, see our [Security Policy](./SECURITY.md).

## License

MIT - See [LICENSE](./LICENSE)

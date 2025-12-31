# Veo 3.1 Video Generator

Batch video generation using Google Flow (Veo 3.1) with browser automation and cookie-based authentication.

## Features

- 🍪 **Cookie Import** - Authenticate using exported browser cookies
- 📝 **Batch Processing** - Enter multiple prompts or upload CSV
- 📊 **Real-time Status** - Monitor generation progress
- 💾 **Auto Download** - Automatically save completed videos
- 🔄 **Retry Failed** - Automatic retry for failed generations

## Prerequisites

- Node.js 18+
- Google AI Pro or Ultra subscription
- Browser cookies from Google Flow session

## Installation

```bash
npm install
npx playwright install chromium
```

## Usage

1. **Export cookies from Google Flow**:
   - Install "Cookie Editor" browser extension
   - Go to https://labs.google/fx/flow
   - Export cookies as JSON

2. **Run the app**:
   ```bash
   npm run dev
   ```

3. **Import cookies** and start generating!

## Development

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## License

MIT

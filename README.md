# RAG Backend

A Retrieval-Augmented Generation (RAG) backend built with Bun.js, using Weaviate for vector storage and Anthropic's Claude for generation.

## Prerequisites

- [Bun.js](https://bun.sh) installed
- Weaviate instance running (local or cloud)
- Anthropic API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Weaviate Configuration
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=your-weaviate-api-key

# Anthropic Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key

# Server Configuration
PORT=3000
```

## Installation

1. Install dependencies:
```bash
bun install
```

2. Start the development server:
```bash
bun run dev
```

Or for production:
```bash
bun run start
```

## API Endpoints

### POST /v1/upload-documents

Upload documents to be stored in the vector database.

Request body:
```json
{
  "documents": [
    {
      "title": "What is Bun?",
      "content": "Bun is a fast JavaScript runtime like Node or Deno."
    }
  ]
}
```

Response:
```json
{
  "message": "Documents uploaded successfully"
}
```

### POST /v1/ask

Ask a question and get an answer based on the stored documents.

Request body:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is Bun used for?"
    }
  ],
  "options": {
    "num_predict": 100,
    "temperature": 1
  }
}
```

Response:
```json
{
  "answer": "Based on the context, Bun is a fast JavaScript runtime similar to Node.js or Deno. It's used for running JavaScript and TypeScript applications with improved performance..."
}
```

## Features

- Document storage with vector embeddings using Weaviate
- Semantic search for relevant context
- Answer generation using Anthropic's Claude
- Document deduplication based on title
- CORS support
- TypeScript support
- Environment variable configuration

## Development

The project uses TypeScript and follows a modular structure:

- `src/index.ts` - Main server and API endpoints
- `src/weaviate.ts` - Weaviate client and operations
- `src/claude.ts` - Claude API integration

## License

MIT 
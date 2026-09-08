# CodeLens AI

> **GitHub Copilot explains code. CodeLens AI understands an entire software project.**

CodeLens AI is a full-stack AI-powered repository intelligence platform. Point it at any GitHub repository and it clones, indexes, and lets you explore the entire codebase through semantic search, a conversational AI assistant, an interactive dependency graph, and a syntax-highlighted code explorer — all without leaving the browser.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [How the RAG Pipeline Works](#how-the-rag-pipeline-works)
- [Screenshots](#screenshots)

---

## Features

| Feature | Description |
|---|---|
| **Repository Indexing** | Clone any public GitHub repo and automatically scan, chunk, embed, and index every file |
| **Semantic Search** | Search your codebase in natural language — powered by Gemini embeddings and Qdrant vector search |
| **AI Chat** | Conversational RAG assistant with full session history, context-aware follow-up questions, and source references |
| **Dependency Graph** | Interactive React Flow graph showing internal file imports resolved across Python and TypeScript/JavaScript |
| **Code Explorer** | Browse all indexed files with full syntax highlighting (Python, TypeScript, JavaScript) and line numbers |
| **Background Worker** | BullMQ + Redis job queue processes indexing asynchronously — the UI polls and updates automatically |
| **Auth** | JWT-based authentication with bcrypt password hashing |

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js v5 |
| ORM | Prisma 7 |
| Database | PostgreSQL 17 |
| Vector Database | Qdrant |
| Job Queue | BullMQ + Redis 7 |
| AI / Embeddings | Google Gemini API (`gemini-embedding-001`, `gemini-2.5-flash`) |
| Git Cloning | simple-git |
| Auth | JWT + bcrypt |
| Validation | Zod |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Routing | React Router v7 |
| Dependency Graph | React Flow (`@xyflow/react`) |
| Syntax Highlighting | react-syntax-highlighter (Atom One Dark) |
| Markdown Rendering | react-markdown |
| Icons | Lucide React |

### Infrastructure
| Service | Purpose |
|---|---|
| PostgreSQL | Stores users, repositories, files, chunks, dependencies, chat sessions |
| Qdrant | Stores and searches vector embeddings of code chunks |
| Redis | BullMQ job queue broker for background indexing |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│   Dashboard │ Code Explorer │ Search │ Architecture │ Chat   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js API Server                     │
│  /auth  /repositories  /files  /search  /chat  /deps        │
└────────┬──────────────────────────────────────┬─────────────┘
         │                                      │
         │ Prisma ORM                           │ BullMQ Job
         ▼                                      ▼
┌─────────────────┐                  ┌──────────────────────┐
│   PostgreSQL    │                  │    Redis (Queue)      │
│                 │                  └──────────┬───────────┘
│  Users          │                             │
│  Repositories   │                             ▼
│  Files          │                  ┌──────────────────────┐
│  Chunks         │◄─────────────────│  Indexing Worker     │
│  Dependencies   │                  │                      │
│  ChatSessions   │                  │  1. Clone (git)      │
│  ChatMessages   │                  │  2. Scan files       │
│  IndexingJobs   │                  │  3. Chunk code       │
└─────────────────┘                  │  4. Embed (Gemini)   │
                                     │  5. Store → Qdrant   │
                                     │  6. Parse deps       │
                                     └──────────────────────┘
                                                │
                                                ▼
                                     ┌──────────────────────┐
                                     │   Qdrant             │
                                     │   Vector Database    │
                                     │   (embeddings)       │
                                     └──────────────────────┘
```

### Indexing Pipeline (step by step)

```
GitHub URL
    │
    ▼
Clone repository (simple-git)
    │
    ▼
File Scanner — walks directory tree, detects language
    │
    ▼
Code Chunker — splits files into overlapping chunks (preserving line numbers)
    │
    ▼
Gemini Embeddings — embeds each chunk as a 768-dim vector
    │
    ▼
Qdrant — stores vectors with metadata (filePath, language, startLine, endLine)
    │
    ▼
Dependency Parser — extracts imports (Python + TypeScript/JavaScript)
    │
    ▼
Dependency Resolver — maps import paths to actual files in the repo
    │
    ▼
PostgreSQL — stores resolved dependency edges
    │
    ▼
Repository status → READY
```

### RAG Query Pipeline

```
User question
    │
    ▼
Gemini Embedding (RETRIEVAL_QUERY)
    │
    ▼
Qdrant vector search (top-K chunks by cosine similarity)
    │
    ▼
Load chunk content from PostgreSQL
    │
    ▼
Build prompt (question + code context + conversation history)
    │
    ▼
Gemini AI → answer
    │
    ▼
Return answer + source references to frontend
```

---

## Project Structure

```
CodeLens-AI/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/                # Prisma, Gemini, Qdrant, Redis clients
│   │   ├── controllers/           # Express route handlers
│   │   ├── middleware/            # Auth middleware, error handler
│   │   ├── parsers/               # dependency.parser.ts (Python + TS/JS)
│   │   ├── queues/                # BullMQ queue definition
│   │   ├── repositories/          # Prisma data access layer
│   │   ├── routes/                # Express routers
│   │   ├── services/              # Business logic
│   │   │   ├── chat.service.ts
│   │   │   ├── dependency-resolver.service.ts
│   │   │   ├── embedding.service.ts
│   │   │   ├── file-scanner.service.ts
│   │   │   ├── prompt-builder.service.ts
│   │   │   ├── qdrant.service.ts
│   │   │   ├── search.service.ts
│   │   │   └── ...
│   │   ├── workers/
│   │   │   └── repository-index.worker.ts   # BullMQ worker
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── DependencyGraph.tsx      # React Flow graph
│   │   │   │   └── ImportRepositoryForm.tsx
│   │   │   ├── layout/                      # AppLayout, Sidebar, Topbar
│   │   │   └── ui/                          # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── RepositoryDetails.tsx        # All 5 tabs
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── dependency.service.ts
│   │   │   └── repository.service.ts
│   │   └── types/
│   └── package.json
│
├── docker-compose.yml             # PostgreSQL + Qdrant + Redis
└── README.md
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `User` | Registered users (email + bcrypt password) |
| `Repository` | Imported GitHub repos with indexing status |
| `File` | Every scanned file (path, language, content) |
| `Chunk` | Code chunks with line ranges and embedding IDs |
| `Dependency` | Resolved import edges between files |
| `ChatSession` | Conversation sessions per repository |
| `ChatMessage` | Individual messages (USER / ASSISTANT) |
| `IndexingJob` | Background job tracking (step + progress) |

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v20+
- **npm** v10+
- **Docker** + **Docker Compose** (for PostgreSQL, Qdrant, Redis)
- **Google Gemini API key** — get one free at [aistudio.google.com](https://aistudio.google.com)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/CodeLens-AI.git
cd CodeLens-AI
```

### 2. Start infrastructure services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Qdrant on `localhost:6333`
- Redis on `localhost:6379`

### 3. Set up the backend

```bash
cd backend
cp .env.example .env
```

Fill in your `.env` (see [Environment Variables](#environment-variables) below), then:

```bash
npm install
npx prisma migrate dev
npm run dev
```

> **Note:** `npx prisma migrate dev` automatically runs `prisma generate` after applying migrations, so you don't need to run it separately. Only run `npx prisma generate` explicitly if you need to regenerate the Prisma client without running migrations (e.g., in production using `prisma migrate deploy`).

This starts both the **API server** (`localhost:5000`) and the **indexing worker** concurrently.

### 4. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 5. Open the app

Go to `http://localhost:5173`, register an account, and import a GitHub repository URL.

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
# Server
PORT=5000

# PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codelens"

# JWT
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN=7d

# Google Gemini
GEMINI_API_KEY="your-gemini-api-key"
EMBEDDING_MODEL="gemini-embedding-001"
CHAT_MODEL="gemini-2.5-flash"

# Qdrant
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY=""
QDRANT_COLLECTION="repository_chunks"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Search
SEARCH_TOP_K=5
SEARCH_MIN_SCORE=0
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and receive JWT |
| GET | `/api/v1/auth/me` | Get current user |

### Repositories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/repositories` | List all repositories |
| POST | `/api/v1/repositories` | Import a new repository |
| GET | `/api/v1/repositories/:id` | Get repository details |
| DELETE | `/api/v1/repositories/:id` | Delete a repository |
| GET | `/api/v1/repositories/:id/files` | List all files |
| GET | `/api/v1/repositories/:id/files/:fileId/chunks` | Get file chunks |
| GET | `/api/v1/repositories/:id/dependencies` | Get dependency graph edges |

### Search
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/search` | Semantic search across a repository |

Request body:
```json
{
  "repositoryId": "...",
  "query": "Where is authentication implemented?",
  "limit": 5
}
```

### Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/chat/sessions` | Create a new chat session |
| GET | `/api/v1/chat/sessions` | List all sessions |
| GET | `/api/v1/chat/sessions/:id/messages` | Get session messages |
| POST | `/api/v1/chat/sessions/:id/messages` | Send a message |
| DELETE | `/api/v1/chat/sessions/:id` | Delete a session |

---

## How the RAG Pipeline Works

**Indexing** (happens once per repository):

1. The repository is cloned locally using `simple-git`
2. Every source file is scanned and its language detected
3. Files are split into overlapping chunks (preserving line numbers)
4. Each chunk is embedded using `gemini-embedding-001` into a 768-dimensional vector
5. Vectors are stored in Qdrant with metadata (filePath, language, startLine, endLine)
6. Import statements are parsed from Python and TypeScript/JavaScript files
7. Import paths are resolved to actual files in the repository and stored as dependency edges in PostgreSQL

**Querying** (happens on every search or chat message):

1. The user's question is embedded using the same Gemini model with `RETRIEVAL_QUERY` task type
2. Qdrant performs a cosine similarity search and returns the top-K most relevant chunks
3. Chunk content is loaded from PostgreSQL
4. A structured prompt is built containing the question, retrieved code context, and conversation history
5. Gemini generates a grounded answer using only the repository context
6. The answer and source file references are returned to the frontend

---

## Scripts

### Backend

```bash
npm run dev          # Start API server + worker (concurrently)
npm run dev:server   # Start API server only
npm run dev:worker   # Start indexing worker only
npm run build        # Compile TypeScript
```

### Frontend

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## License

Licensed under the [Apache License 2.0](./LICENSE).

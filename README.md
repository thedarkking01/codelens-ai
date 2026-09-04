# CodeLens AI

> **GitHub Copilot explains code. CodeLens understands an entire software project.**

CodeLens AI is an AI-powered repository intelligence platform that helps developers understand large software repositories through **semantic code search, Retrieval-Augmented Generation (RAG), conversational AI, dependency graphs, and an interactive code explorer**.

Instead of asking developers to manually navigate hundreds of files, CodeLens AI indexes an entire repository and lets them ask questions about the codebase in natural language.

---

## 🚀 Overview

Understanding an unfamiliar codebase can be difficult.

Developers often need to:

- Search across many files
- Understand how modules depend on each other
- Trace where functionality is implemented
- Understand unfamiliar architecture
- Find relevant code before making changes
- Ask follow-up questions while maintaining context

CodeLens AI solves this by creating an intelligent representation of a repository.

### How it works

```text
GitHub Repository
        │
        ▼
     Clone
        │
        ▼
   File Scanner
        │
        ▼
   Code Chunking
        │
        ▼
 Gemini Embeddings
        │
        ▼
      Qdrant
        │
        ├───────────────┐
        ▼               ▼
 Semantic Search    Dependency Graph
        │               │
        └───────┬───────┘
                ▼
              RAG
                │
                ▼
         Gemini AI Reasoning
                │
                ▼
          React Frontend
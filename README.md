# Prime

Prime is a self-hosted AI assistant foundation designed for long-term development.

## Architecture

- Express API
- Prime-owned local authentication and sessions
- JSON-backed persistent user/chat storage (replaceable with SQL later)
- Short-term per-chat memory
- Long-term per-user memory
- Local knowledge/RAG pipeline
- Multi-source web search with keyless public indexes, optional Brave Search, browser-backed local fallback, webpage extraction, caching and citations
- Provider-fallback image generation (Replicate/OpenAI/Stability/local)
- Optional local Ollama model for advanced conversation and coding
- Security middleware, rate limits, validation and regression tests

## Run

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Tests

```bash
npm test
```

The application does not require Firebase, Firebase Admin, or external browser SDKs.


## Web search

Prime's canonical search layer uses independent public sources such as DuckDuckGo HTML, Google News RSS, Wikimedia, arXiv, OpenAlex, Crossref, Hacker News and Wikibooks. Brave Search is an optional dedicated web index. A local Chrome/Chromium/Edge fallback can be enabled with `SEARCH_BROWSER_FALLBACK=true`. Search results are normalized, deduplicated, freshness/ranking scored, and top web pages can be fetched for additional evidence. 
## Render

The included `render.yaml` uses `npm ci --omit=dev`, `npm start`, `/health`, binds on `0.0.0.0`, and disables the local model unless you provide a reachable remote model endpoint. See `docs/RENDER_DEPLOYMENT.md`.


## Vision
Prime can inspect attached images using a vision-capable model. For local Ollama, install the official Qwen3-VL model and keep `PRIME_VISION_MODEL=qwen3-vl:8b` (or another installed vision model):

```bash
ollama pull qwen3-vl:8b
```

Image analysis uses the real uploaded pixels and never substitutes search snippets or filenames for visual evidence.


## Image understanding

For local image analysis, run a vision-capable Ollama model such as `qwen3-vl:8b` and keep `PRIME_VISION_ENABLED=true`. On Render, configure `PRIME_VISION_MODEL_URL` to a reachable remote vision endpoint before enabling vision.


## Prime intelligence model setup

Prime separates general reasoning from web retrieval and visual reasoning. For the best local experience, configure a capable general model with `PRIME_MODEL_URL`/`PRIME_MODEL_NAME` and a vision-capable model with `PRIME_VISION_MODEL`/`PRIME_VISION_MODEL_URL`. Prime will use conversation history, saved profile memory, tools, and current web evidence as appropriate. If a model is temporarily unavailable, current/search requests fall back to evidence-limited answers instead of fabricating results.

## Prime Intelligence Stack v3.5

Prime now has an integrated, provider-optional intelligence layer: agent planning, model fallback/routing, query decomposition, SearXNG metasearch, hybrid lexical+semantic retrieval, optional BGE-M3/BGE reranking, evidence verification, semantic long-term memory, Docling document parsing, vision memory, text/speech emotion guidance, voice service adapters, and continuous regression/evaluation hooks.

The large upstream runtimes are intentionally optional. Prime keeps lightweight JavaScript adapters in the main runtime and provides a Windows setup script plus `infra/docker-compose.ai.yml` for SearXNG and Qdrant.

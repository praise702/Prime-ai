# Prime serious-deployment setup

## Account names

Account display names are intentionally flexible. Prime accepts normal Unicode names, spaces, punctuation, symbols and emoji up to 80 characters. It rejects only empty/whitespace-only names and low-level control characters. User-provided names are rendered with DOM text APIs in the frontend and are not treated as HTML.

## Web search

Prime uses one canonical multi-source search orchestrator. Keyless sources include DuckDuckGo HTML search, Google News RSS, Wikimedia/Wikipedia, arXiv, OpenAlex, Crossref, Hacker News and Wikibooks. Brave Search is an optional dedicated web index. On supported local machines, Prime can also use an installed Chrome/Chromium/Edge browser as a fallback.

Search results are gathered concurrently, normalized, deduplicated, scored for relevance/authority/freshness, and optionally enriched by safely fetching the top public HTML pages. The server rejects private/local targets and re-checks every redirect before page fetching.

Browser-side capabilities include Fetch for API communication, IndexedDB for short-lived search-result caching, Web Speech for voice input/output, Geolocation for opt-in nearby searches, localStorage for search preferences, and Canvas/WebGL capability detection for progressive search visualizations.

The removed hosted search provider is not used anywhere in this release.

Optional environment variables:

```env
BRAVE_SEARCH_API_KEY=
SEARCH_COUNTRY=IN
SEARCH_LANGUAGE=en
SEARCH_BROWSER_FALLBACK=true
SEARCH_BROWSER_PATH=
SEARCH_FETCH_PAGES=true
SEARCH_PAGE_FETCH_TOP_RESULTS=5
SEARCH_PAGE_FETCH_TIMEOUT_MS=7000
SEARCH_PAGE_MAX_BYTES=1500000
SEARCH_PAGE_TEXT_MAX_LENGTH=1600
```

## Image generation

The image layer is provider-independent and uses a fallback chain. The Render-friendly default is:

```env
IMAGE_PROVIDER_ORDER=replicate,openai,stability,local
REPLICATE_API_TOKEN=
REPLICATE_IMAGE_MODEL=google/imagen-4
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1
STABILITY_API_KEY=
```

The local provider remains available for a machine that runs a local image service. External providers are usage-limited/billed; there is no reliable unlimited-free high-quality image API.

Image requests are now reconnected to the chat controller, and a protected `/api/images` route is available for future UI expansion.

## Render

The server listens on `0.0.0.0` and the configured `PORT`. Provider credentials are read only from environment variables; never commit `.env`.

Render’s free service filesystem is not a durable database/object store. For a serious long-term deployment, move users/chats to a managed database and generated images to durable object storage. The current provider/search interfaces are intentionally separated so that migration can happen without redesigning the chat brain.

## Required local setup

```powershell
copy .env.example .env
npm install
npm start
```

Then open `http://localhost:3000/`.


## Vision
Prime can inspect attached images using a vision-capable model. For local Ollama, install the official Qwen3-VL model and keep `PRIME_VISION_MODEL=qwen3-vl:8b` (or another installed vision model):

```bash
ollama pull qwen3-vl:8b
```

Image analysis uses the real uploaded pixels and never substitutes search snippets or filenames for visual evidence.


### Vision on Render

The Render blueprint leaves `PRIME_VISION_ENABLED=false` by default because Render does not run your local Ollama instance. To enable image understanding in production, set `PRIME_VISION_ENABLED=true`, set `PRIME_VISION_MODEL_URL` to a reachable OpenAI-compatible or Ollama vision endpoint, and set `PRIME_VISION_MODEL` to the deployed vision model (for example `qwen3-vl:8b`).

# Prime Ultimate — setup after the security/chat fixes

1. Copy `.env.example` to `.env`.
2. Set your own secrets in `.env`.
3. Install dependencies:
   `npm install`
4. Start Prime:
   `npm start`
5. Check:
   `http://localhost:3000/health`
6. Open:
   `http://localhost:3000/`

## Local model

If Ollama is installed, keep `PRIME_MODEL_ENABLED=true` and make sure the model named by
`PRIME_MODEL_NAME` is installed and running.

If the local model is unavailable, Prime still starts and uses its deterministic knowledge
pipeline where possible.

## Important security action

The previous project archive contained live provider credentials. Those credentials should be
rotated/revoked and replaced with fresh values before deploying this cleaned project.

Never commit `.env`, session files, user files, chat files, or uploaded files.


## Long-term web search

Prime uses DuckDuckGo HTML, Google News RSS, Wikimedia/Wikipedia, arXiv, OpenAlex, Crossref, Hacker News and Wikibooks without requiring a search API key. Brave Search is optional. A local Chrome/Chromium/Edge browser can be enabled as a fallback with `SEARCH_BROWSER_FALLBACK=true`.

Top web results can be fetched for additional page evidence. The fetcher validates public destinations and redirects before requesting a page. Search results are normalized, deduplicated, ranked and briefly cached. The removed hosted search provider is completely removed.

Browser-side support includes Fetch, IndexedDB search caching, Web Speech, opt-in Geolocation for nearby searches, localStorage preferences, and Canvas/WebGL capability detection.

## Long-term image generation

External image providers are optional and are selected through a fallback chain. The default order is:

```env
IMAGE_PROVIDER_ORDER=replicate,openai,stability,local
REPLICATE_IMAGE_MODEL=google/imagen-4
```

Replicate is the recommended Render-compatible primary provider when you have a token. OpenAI and Stability remain fallback providers, and the local provider is useful for a machine running a local image service. Provider APIs are usage-billed or quota-limited; there is no reliable promise of unlimited free high-quality image generation.

## Render

Render can start the service without any model/search/image credentials because every external provider is optional. Add provider secrets only in Render Environment Variables. The server binds to `0.0.0.0` and uses the Render `PORT` value.

The default local JSON/database and generated-file storage is not a durable production data store on an ephemeral Render filesystem. For true long-term persistence, replace the JSON storage and image-file persistence with a managed database/object-storage layer later. The provider architecture is designed so that migration does not require rewriting the chat/search/image routing.


## Vision
Prime can inspect attached images using a vision-capable model. For local Ollama, install the official Qwen3-VL model and keep `PRIME_VISION_MODEL=qwen3-vl:8b` (or another installed vision model):

```bash
ollama pull qwen3-vl:8b
```

Image analysis uses the real uploaded pixels and never substitutes search snippets or filenames for visual evidence.

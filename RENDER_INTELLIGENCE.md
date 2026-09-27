# Render deployment notes for Prime Intelligence Stack

The core Prime service remains deployable on one Render Web Service. Heavy local ML components are optional and should not be forced into the web process.

Recommended Render variables for the core service:
- `PRIME_MODEL_PROVIDER` and `PRIME_MODEL_URL` for a reachable model endpoint
- `PRIME_MODEL_NAME`
- `SEARXNG_URL` only when a reachable SearXNG service is available
- `PRIME_EMBEDDING_URL` and `PRIME_RERANKER_URL` only when external retrieval services are available
- `PRIME_DOCLING_URL` only when a reachable Docling service is available
- `PRIME_VOICE_SERVICE_URL` only when a reachable voice service is available

Prime always has graceful fallbacks when the optional services are unavailable. Do not start GPU-heavy voice, BGE, or vision model servers inside a small Render web service.

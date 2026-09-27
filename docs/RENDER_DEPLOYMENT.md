# Prime Render Deployment

## Web service

Use the included `render.yaml` or create a Render Web Service from this repository.

Build command: `npm ci --omit=dev`
Start command: `npm start`
Health check: `/health`

Prime binds to `0.0.0.0` and uses Render's `PORT` automatically.

## Environment

The included Render blueprint disables the local model by default. Set `PRIME_MODEL_ENABLED=true` only when `PRIME_MODEL_URL` points to a reachable remote model service.

Set any model/search/image secrets in Render's Environment settings. Do not commit `.env` or provider secrets.

`CORS_ALLOWED_ORIGINS` may remain empty when the browser uses the same Render origin. External origins must be explicitly listed.

Web search works without a provider key through public reference/news sources and DuckDuckGo HTML. `BRAVE_SEARCH_API_KEY` is optional. Keep `SEARCH_BROWSER_FALLBACK=false` on Render unless you intentionally provide a compatible browser executable. `SEARCH_FETCH_PAGES=true` is supported; Prime validates public URLs and redirect targets before fetching page evidence.

## Image generation

The self-hosted Prime image engine is `local-image-engine/server.py`. It is designed to run on the same machine as Prime and binds to localhost by default. It does not require an image-provider API key.

A Render Free web service is not suitable for persistent model/image storage: its filesystem is ephemeral and the service can spin down. Render's current documentation states that persistent disks are available to paid services, while Free services cannot use them. For a production Render deployment, use a paid service with a persistent disk for local files, or configure one of Prime's optional remote image adapters. The local image engine can also be deployed separately on suitable compute and kept private.

## Persistent Prime data

Set `PRIME_DATA_DIR` to the mounted persistent directory (for example `/var/data`) on a paid Render service with a persistent disk. Prime stores users, sessions, chats, long-term memory, uploads, image history, image jobs, and generated images below that directory.

## Security

Production cookies are Secure + HttpOnly + SameSite=Strict. Rate limits cover authentication, signup, chat, uploads and image creation. Same-origin requests work without wildcard CORS, while other origins must be explicitly allowed.


Render note: the web service does not assume a local Ollama process exists. Set a reachable remote model endpoint and credentials for general/vision inference, or run Prime with model-backed features disabled and use its deterministic tools/search fallbacks.

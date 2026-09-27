# Prime Local Image Engine

Prime now defaults to its self-hosted image engine. No image API key is required for this path.

## Local development
1. Install Node dependencies with `npm install`.
2. Install Python 3.10+ and an appropriate PyTorch build.
3. Run `local-image-engine\scripts\start_windows.bat` on Windows.
4. Keep `IMAGE_PROVIDER_ORDER=local` in `.env`.
5. Start Prime with `npm start`.

The local engine uses `PRIME_IMAGE_MODEL_ID=auto` by default: SDXL is selected for CUDA GPUs with at least 8 GB VRAM, while SD 1.5 is selected otherwise. CPU mode is supported for compatibility but can be very slow. The Windows launcher writes generated files to `data\images\generated`, matching Prime's Node-side data directory.

## Render / separate compute

The Node/Express Prime service is deployable to Render without an image-provider API key. Practical diffusion generation requires suitable compute, so the self-hosted Python engine is intentionally separable from the web service. When the image engine is hosted elsewhere, Prime requests a bounded base64 PNG response, validates it, stores it in its own configured data directory, and then serves the validated copy through the authenticated `/generated` route.

On a Render service with persistent storage, set `PRIME_DATA_DIR` to the mounted persistent directory. A Render Free service does not provide a persistent filesystem, so local users, uploads, image history, jobs, and generated images should not be treated as durable there.

## User-facing privacy

Search evidence is retained internally for answer quality, but source names and URLs are not rendered in the chat UI. Image provider names and low-level provider errors are not returned to the user in image-generation responses.

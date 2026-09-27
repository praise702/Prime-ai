# Prime setup

Prime is self-hosted. It does **not** require Firebase.

## 1. Install

```bash
npm install
```

## 2. Configure

Copy `.env.example` to `.env` and set the values you need.

## 3. Start

```bash
npm start
```

Open `http://localhost:3000`.

## 4. Accounts and data

Prime provides its own password-hashed accounts, secure sessions, chat persistence, and memory storage under `data/`. Keep that directory backed up. Do not commit `.env` or production data.

## 5. Local AI

For stronger conversation and coding, install Ollama separately and pull the model named in `PRIME_MODEL_NAME`. Prime communicates with the OpenAI-compatible local chat endpoint configured by `PRIME_MODEL_URL`.

The deterministic knowledge, math, memory, search, safety, and fallback systems remain available when the local model is offline.


## Vision
Prime can inspect attached images using a vision-capable model. For local Ollama, install the official Qwen3-VL model and keep `PRIME_VISION_MODEL=qwen3-vl:8b` (or another installed vision model):

```bash
ollama pull qwen3-vl:8b
```

Image analysis uses the real uploaded pixels and never substitutes search snippets or filenames for visual evidence.

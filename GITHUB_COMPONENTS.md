# Prime open-source intelligence stack

Prime now contains adapters/integration points for these open-source projects. They are **not all vendored into the main runtime** because several contain large ML runtimes/model weights and would make a production ZIP unnecessarily huge.

1. Letta — stateful agent/memory concepts
2. LangGraph — stateful agent orchestration concepts
3. Mem0 — persistent semantic memory concepts
4. llama.cpp — local LLM/VLM runtime
5. FlagEmbedding — BGE-M3 embeddings + BGE reranking
6. Qdrant — optional vector database with dense/sparse/hybrid retrieval
7. Docling — structured document parsing
8. SearXNG — self-hosted metasearch
9. emotion2vec — speech emotion recognition
10. faster-whisper — local speech-to-text
11. OpenVoice — expressive TTS/voice style control
12. DeepEval — continuous LLM/RAG evaluation

Run `scripts/setup_open_source_components.ps1` on Windows to clone the upstream repositories into `third_party/` when you want their full source locally. Prime itself keeps the runtime adapters optional so it still runs without those heavy components.

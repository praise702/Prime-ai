from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI(title="Prime Retrieval Service")

EMBEDDER = None
RERANKER = None

class EmbeddingRequest(BaseModel):
    input: str | list[str]

class RerankRequest(BaseModel):
    query: str
    documents: list[str]

def load_models():
    global EMBEDDER, RERANKER
    from FlagEmbedding import BGEM3FlagModel, FlagReranker
    EMBEDDER = BGEM3FlagModel(os.getenv("BGE_EMBED_MODEL", "BAAI/bge-m3"), use_fp16=os.getenv("BGE_FP16", "true").lower() == "true")
    RERANKER = FlagReranker(os.getenv("BGE_RERANK_MODEL", "BAAI/bge-reranker-v2-m3"), use_fp16=os.getenv("BGE_FP16", "true").lower() == "true")

@app.on_event("startup")
def startup():
    if os.getenv("PRIME_LOAD_BGE", "false").lower() == "true":
        load_models()

@app.post("/embed")
def embed(req: EmbeddingRequest):
    if EMBEDDER is None: load_models()
    values = req.input if isinstance(req.input, list) else [req.input]
    out = EMBEDDER.encode(values, return_dense=True)
    dense = out["dense_vecs"]
    return {"embeddings": [v.tolist() for v in dense]}

@app.post("/rerank")
def rerank(req: RerankRequest):
    if RERANKER is None: load_models()
    pairs = [[req.query, d] for d in req.documents]
    scores = RERANKER.compute_score(pairs, normalize=True)
    if not isinstance(scores, list): scores = [scores]
    return {"scores": [float(s) for s in scores]}

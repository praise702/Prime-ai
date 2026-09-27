#!/usr/bin/env python3
"""
Prime Local Image Engine

A self-hosted text-to-image service for Prime.
- No paid image API is required.
- Model weights are downloaded once from Hugging Face and then reused locally.
- Uses GPU automatically when available; CPU remains supported for correctness.
- Writes generated images only inside PRIME_IMAGE_OUTPUT_DIR.
"""

from __future__ import annotations

import base64
import json
import os
import secrets
import threading
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

MODEL_SETTING = os.getenv("PRIME_IMAGE_MODEL_ID", "auto").strip()
MODEL_SD15 = "stable-diffusion-v1-5/stable-diffusion-v1-5"
MODEL_SDXL = "stabilityai/stable-diffusion-xl-base-1.0"
MODEL_ID = MODEL_SETTING
DEFAULT_WIDTH = int(os.getenv("PRIME_IMAGE_DEFAULT_WIDTH", "512"))
DEFAULT_HEIGHT = int(os.getenv("PRIME_IMAGE_DEFAULT_HEIGHT", "512"))
HOST = os.getenv("PRIME_IMAGE_HOST", "127.0.0.1")
PORT = int(os.getenv("PRIME_IMAGE_PORT", "7861"))
OUTPUT_ROOT = Path(os.getenv("PRIME_IMAGE_OUTPUT_DIR", "../src/image/outputs/generated")).expanduser().resolve()
MAX_WIDTH = int(os.getenv("PRIME_IMAGE_MAX_WIDTH", "1024"))
MAX_HEIGHT = int(os.getenv("PRIME_IMAGE_MAX_HEIGHT", "1024"))
MAX_STEPS = int(os.getenv("PRIME_IMAGE_MAX_STEPS", "40"))
ENGINE_TOKEN = os.getenv("PRIME_IMAGE_ENGINE_TOKEN", "").strip()
MAX_PROMPT_LENGTH = int(os.getenv("PRIME_IMAGE_MAX_PROMPT_LENGTH", "12000"))
MAX_RETURN_IMAGE_BYTES = int(os.getenv("PRIME_IMAGE_MAX_RETURN_BYTES", "8000000"))

_pipeline = None
_pipeline_error: str | None = None
_pipeline_lock = threading.Lock()
cancelled = set[str]()


def safe_output_path(raw: str | None) -> Path:
    if not raw:
        raise ValueError("outputPath is required")
    candidate = Path(raw).expanduser().resolve()
    root = OUTPUT_ROOT.resolve()
    if candidate == root or root not in candidate.parents:
        raise ValueError("outputPath must stay inside the configured Prime generated-image directory")
    if candidate.suffix.lower() != ".png":
        raise ValueError("outputPath must use the .png extension")
    return candidate


def resolve_model():
    import torch
    use_cuda = torch.cuda.is_available() and os.getenv("PRIME_IMAGE_FORCE_CPU", "false").lower() != "true"
    if MODEL_SETTING and MODEL_SETTING.lower() != "auto":
        return MODEL_SETTING, use_cuda
    if use_cuda:
        total_vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        if total_vram_gb >= 8:
            return MODEL_SDXL, True
    return MODEL_SD15, use_cuda

def load_pipeline():
    global _pipeline, _pipeline_error
    if _pipeline is not None:
        return _pipeline
    with _pipeline_lock:
        if _pipeline is not None:
            return _pipeline
        try:
            import torch
            from diffusers import AutoPipelineForText2Image, DPMSolverMultistepScheduler

            model_id, use_cuda = resolve_model()
            dtype = torch.float16 if use_cuda else torch.float32
            kwargs = {"torch_dtype": dtype, "use_safetensors": True}
            if use_cuda:
                kwargs["variant"] = "fp16"

            pipe = AutoPipelineForText2Image.from_pretrained(model_id, **kwargs)
            pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)

            if use_cuda:
                try:
                    pipe.enable_model_cpu_offload()
                except Exception:
                    pipe = pipe.to("cuda")
                try:
                    pipe.enable_attention_slicing()
                except Exception:
                    pass
                try:
                    pipe.enable_vae_slicing()
                except Exception:
                    pass
            else:
                pipe = pipe.to("cpu")
                try:
                    pipe.enable_attention_slicing()
                except Exception:
                    pass
                try:
                    pipe.enable_vae_slicing()
                except Exception:
                    pass

            global MODEL_ID
            MODEL_ID = model_id
            _pipeline = pipe
            _pipeline_error = None
            return _pipeline
        except Exception as exc:
            _pipeline_error = f"{type(exc).__name__}: {exc}"
            raise


def model_health() -> dict[str, Any]:
    try:
        import torch
        import diffusers  # noqa: F401
        device = "cuda" if torch.cuda.is_available() and os.getenv("PRIME_IMAGE_FORCE_CPU", "false").lower() != "true" else "cpu"
        selected_model, _ = resolve_model()
        return {
            "healthy": True,
            "model": {
                "available": True,
                "loaded": _pipeline is not None,
                "id": MODEL_ID if _pipeline is not None else selected_model,
                "device": device,
                "error": _pipeline_error,
            },
        }
    except Exception as exc:
        return {
            "healthy": False,
            "model": {
                "available": False,
                "loaded": False,
                "id": MODEL_ID,
                "device": "unknown",
                "error": f"{type(exc).__name__}: {exc}",
            },
        }


def generate(payload: dict[str, Any]) -> dict[str, Any]:
    request_id = str(payload.get("requestId") or secrets.token_urlsafe(12))
    if request_id in cancelled:
        return {"success": False, "requestId": request_id, "status": "cancelled", "error": "Generation was cancelled"}

    prompt = str(payload.get("prompt") or "").strip()
    if not prompt:
        return {"success": False, "requestId": request_id, "status": "error", "error": "Prompt is empty"}
    if len(prompt) > MAX_PROMPT_LENGTH:
        return {"success": False, "requestId": request_id, "status": "error", "error": "Prompt is too long"}

    output_path = safe_output_path(payload.get("outputPath"))
    width = max(256, min(MAX_WIDTH, int(payload.get("width") or DEFAULT_WIDTH)))
    height = max(256, min(MAX_HEIGHT, int(payload.get("height") or DEFAULT_HEIGHT)))
    width -= width % 8
    height -= height % 8
    steps = max(1, min(MAX_STEPS, int(payload.get("steps") or 30)))
    guidance = max(1.0, min(20.0, float(payload.get("guidance") or 7.0)))
    negative_prompt = str(payload.get("negativePrompt") or "").strip()
    seed = payload.get("seed")
    if isinstance(seed, bool):
        seed = None

    import torch

    pipe = load_pipeline()
    generator_device = "cuda" if torch.cuda.is_available() and os.getenv("PRIME_IMAGE_FORCE_CPU", "false").lower() != "true" else "cpu"
    if seed is None:
        seed = secrets.randbelow(2**31 - 1)
    seed = int(seed)
    generator = torch.Generator(device=generator_device).manual_seed(seed)

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    result = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt or None,
        width=width,
        height=height,
        num_inference_steps=steps,
        guidance_scale=guidance,
        generator=generator,
    )

    if request_id in cancelled:
        return {"success": False, "requestId": request_id, "status": "cancelled", "error": "Generation was cancelled"}

    image = result.images[0]
    image.save(output_path, format="PNG", optimize=True)

    response = {
        "success": True,
        "requestId": request_id,
        "status": "completed",
        "model": MODEL_ID,
        "seed": seed,
        "imagePath": str(output_path),
        "width": width,
        "height": height,
    }

    if bool(payload.get("returnBase64")):
        image_bytes = output_path.read_bytes()
        if len(image_bytes) <= MAX_RETURN_IMAGE_BYTES:
            response["imageBase64"] = base64.b64encode(image_bytes).decode("ascii")
        else:
            try:
                output_path.unlink()
            except OSError:
                pass
            return {
                "success": False,
                "requestId": request_id,
                "status": "error",
                "error": "Generated image is too large to transfer",
            }

    return response


class Handler(BaseHTTPRequestHandler):
    server_version = "PrimeLocalImageEngine/2.0"

    def _authorized(self) -> bool:
        if not ENGINE_TOKEN:
            return self.client_address[0] in {"127.0.0.1", "::1"}
        return secrets.compare_digest(self.headers.get("X-Prime-Engine-Token", ""), ENGINE_TOKEN)

    def _json(self, status: int, data: dict[str, Any]):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise ValueError("Invalid Content-Length")
        if length <= 0 or length > 2 * 1024 * 1024:
            raise ValueError("Invalid request body size")
        raw = self.rfile.read(length)
        value = json.loads(raw.decode("utf-8"))
        if not isinstance(value, dict):
            raise ValueError("JSON body must be an object")
        return value

    def do_GET(self):
        if self.path == "/health":
            health = model_health()
            self._json(200 if health["healthy"] else 503, health)
            return
        self._json(404, {"success": False, "error": "Not found"})

    def do_POST(self):
        if not self._authorized():
            self._json(401, {"success": False, "error": "Unauthorized"})
            return
        try:
            payload = self._read_json()
            path = self.path.split("?", 1)[0]
            if path == "/cancel":
                request_id = str(payload.get("requestId") or "")
                if len(request_id) > 128:
                    raise ValueError("Invalid request id")
                if request_id:
                    cancelled.add(request_id)
                self._json(200, {"success": True, "cancelled": bool(request_id)})
                return
            if path == "/generate":
                result = generate(payload)
                self._json(200 if result.get("success") or result.get("status") == "cancelled" else 500, result)
                return
            self._json(404, {"success": False, "error": "Not found"})
        except Exception as exc:
            traceback.print_exc()
            self._json(500, {"success": False, "error": f"{type(exc).__name__}: {exc}"})

    def log_message(self, format: str, *args):
        print("[PRIME IMAGE ENGINE] " + (format % args))


if __name__ == "__main__":
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    print(f"Prime Local Image Engine starting on http://{HOST}:{PORT}")
    print(f"Model setting: {MODEL_SETTING}")
    try:
        import torch
        selected_model, selected_cuda = resolve_model()
        print(f"Selected model: {selected_model}")
        print(f"Device: {'cuda' if selected_cuda else 'cpu'}")
    except Exception as exc:
        print(f"Hardware detection warning: {type(exc).__name__}: {exc}")
    print(f"Output: {OUTPUT_ROOT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()

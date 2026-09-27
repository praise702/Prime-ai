# Prime Local Image Engine

This is Prime's self-hosted image-generation service. It runs an open diffusion model locally instead of requiring a paid image API.

## Install

Create a Python 3.10+ virtual environment, install a PyTorch build appropriate for your GPU/CPU, then install this directory's requirements:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

For NVIDIA GPUs, install the CUDA-enabled PyTorch build recommended by the PyTorch installer before the remaining packages.

## Start

From the Prime project root on Windows:

```powershell
.\start_prime_image_engine.bat
```

Or from this directory:

```powershell
$env:PRIME_IMAGE_OUTPUT_DIR="..\data\images\generated"
python server.py
```

Keep the service running while Prime is using local image generation. The model is downloaded from Hugging Face on first generation and cached locally by the Python libraries.

The default `PRIME_IMAGE_MODEL_ID=auto` selection uses SDXL when a CUDA GPU with at least 8 GB VRAM is detected and SD 1.5 otherwise. You can explicitly set a model with `PRIME_IMAGE_MODEL_ID`.

## Prime configuration

In Prime's `.env`:

```env
IMAGE_PROVIDER_ORDER=local
PRIME_IMAGE_SERVICE_URL=http://127.0.0.1:7861
PRIME_IMAGE_ENGINE_TOKEN=
```

The local service is the primary image path. Cloud provider adapters remain in the repository as optional adapters, but they are not required for the self-hosted path.

## Separate image-engine host

The image engine can run separately from the Node web app. Prime asks the service for a PNG as base64 data and stores a validated copy under its own configured data directory. This allows the Node app to run on a hosting service while the diffusion model runs on a machine with suitable CPU/GPU resources.

Set the same engine token in the image service and Prime when the service is not restricted to localhost.

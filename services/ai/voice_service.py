from fastapi import FastAPI
from pydantic import BaseModel
import base64, os, tempfile

app = FastAPI(title="Prime Voice Service")

class AudioRequest(BaseModel):
    audio: str
    filename: str = "audio.webm"

class SpeechRequest(BaseModel):
    text: str
    style: str = "friendly"

@app.post("/transcribe")
def transcribe(req: AudioRequest):
    from faster_whisper import WhisperModel
    raw = base64.b64decode(req.audio)
    suffix = os.path.splitext(req.filename)[1] or ".webm"
    f = tempfile.NamedTemporaryFile(delete=False, suffix=suffix); f.write(raw); f.close()
    model = WhisperModel(os.getenv("WHISPER_MODEL", "small"), device=os.getenv("WHISPER_DEVICE", "cpu"), compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "int8"))
    segments, info = model.transcribe(f.name, beam_size=5)
    text = " ".join(s.text.strip() for s in segments).strip()
    os.unlink(f.name)
    return {"text": text, "language": info.language}

@app.post("/emotion")
def emotion(req: AudioRequest):
    from funasr import AutoModel
    raw = base64.b64decode(req.audio)
    suffix = os.path.splitext(req.filename)[1] or ".wav"
    f = tempfile.NamedTemporaryFile(delete=False, suffix=suffix); f.write(raw); f.close()
    model = AutoModel(model="iic/emotion2vec_plus_large")
    result = model.generate(f.name)
    os.unlink(f.name)
    return {"emotion": result}

@app.post("/synthesize")
def synthesize(req: SpeechRequest):
    # OpenVoice is intentionally loaded lazily because its models are large.
    # Wire the local installation here without forcing every Prime install to download voice weights.
    return {"available": False, "reason": "Install the OpenVoice runtime and expose its synthesis endpoint before enabling remote TTS."}

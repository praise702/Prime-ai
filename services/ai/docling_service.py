from fastapi import FastAPI
from pydantic import BaseModel
import base64, os, tempfile

app = FastAPI(title="Prime Docling Service")

class ConvertRequest(BaseModel):
    filePath: str | None = None
    mimeType: str | None = None
    data: str | None = None

@app.post("/convert")
def convert(req: ConvertRequest):
    from docling.document_converter import DocumentConverter
    temp = None
    path = req.filePath
    if req.data:
        suffix = ".bin"
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        temp.write(base64.b64decode(req.data)); temp.close(); path = temp.name
    if not path:
        return {"error": "No file supplied"}
    result = DocumentConverter().convert(path)
    markdown = result.document.export_to_markdown()
    if temp: os.unlink(temp.name)
    return {"markdown": markdown}

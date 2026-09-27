$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
if (-not (Test-Path .venv)) {
    py -3 -m venv .venv
}
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$projectRoot = (Resolve-Path "..\").Path
$env:PRIME_IMAGE_OUTPUT_DIR = Join-Path $projectRoot "data\images\generated"
.\.venv\Scripts\python.exe server.py

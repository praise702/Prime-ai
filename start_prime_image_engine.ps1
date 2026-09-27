$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
& powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\local-image-engine\scripts\start_windows.ps1"

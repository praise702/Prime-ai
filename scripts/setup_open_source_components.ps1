$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path "third_party" | Out-Null
$repos = @(
  @{ Name = "letta"; Url = "https://github.com/letta-ai/letta.git" },
  @{ Name = "langgraph"; Url = "https://github.com/langchain-ai/langgraph.git" },
  @{ Name = "mem0"; Url = "https://github.com/mem0ai/mem0.git" },
  @{ Name = "llama.cpp"; Url = "https://github.com/ggml-org/llama.cpp.git" },
  @{ Name = "FlagEmbedding"; Url = "https://github.com/FlagOpen/FlagEmbedding.git" },
  @{ Name = "qdrant"; Url = "https://github.com/qdrant/qdrant.git" },
  @{ Name = "docling"; Url = "https://github.com/docling-project/docling.git" },
  @{ Name = "searxng"; Url = "https://github.com/searxng/searxng.git" },
  @{ Name = "emotion2vec"; Url = "https://github.com/ddlBoJack/emotion2vec.git" },
  @{ Name = "faster-whisper"; Url = "https://github.com/SYSTRAN/faster-whisper.git" },
  @{ Name = "OpenVoice"; Url = "https://github.com/myshell-ai/OpenVoice.git" },
  @{ Name = "deepeval"; Url = "https://github.com/confident-ai/deepeval.git" }
)
foreach ($repo in $repos) {
  $target = Join-Path "third_party" $repo.Name
  if (-not (Test-Path $target)) { git clone --depth 1 $repo.Url $target }
}
Write-Host "Open-source component sources downloaded to third_party/"

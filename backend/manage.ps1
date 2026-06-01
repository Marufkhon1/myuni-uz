# MyUni backend — doim loyiha .venv orqali ishga tushiring
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
  Write-Host "[myuni] .venv topilmadi. Avval: python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt"
  exit 1
}

& $python manage.py @args

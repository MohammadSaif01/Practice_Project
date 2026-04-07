$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

$requiredFiles = @(
  '.env.prod',
  'docker-compose.prod.yml',
  'backend/Dockerfile.prod',
  'frontend/Dockerfile.prod'
)

$missing = @()
foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) { $missing += $file }
}

if ($missing.Count -gt 0) {
  Write-Host 'Missing required files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" }
  exit 1
}

$requiredEnv = @('JWT_SECRET','CLIENT_ORIGIN','VITE_API_URL')
$envContent = Get-Content '.env.prod' -ErrorAction Stop

foreach ($key in $requiredEnv) {
  if (-not ($envContent -match "^$key=")) {
    Write-Host "Missing key in .env.prod: $key" -ForegroundColor Red
    exit 1
  }
}

Write-Host 'Preflight checks passed.' -ForegroundColor Green

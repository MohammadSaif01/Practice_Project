param(
  [switch]$WithEdge
)

$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

if (-not (Test-Path '.env.prod')) {
  Write-Host 'Missing .env.prod. Creating from .env.prod.example...' -ForegroundColor Yellow
  Copy-Item '.env.prod.example' '.env.prod'
  Write-Host 'Update .env.prod and run again.' -ForegroundColor Yellow
  exit 1
}

$composeArgs = @('-f', 'docker-compose.prod.yml')
if ($WithEdge) {
  $composeArgs += @('-f', 'docker-compose.edge.yml')
}

Write-Host 'Starting production stack...' -ForegroundColor Cyan
& docker compose --env-file .env.prod @composeArgs up -d --build

Write-Host 'Stack started. Check status:' -ForegroundColor Green
& docker compose --env-file .env.prod @composeArgs ps

param(
  [string]$BaseUrl = "http://localhost:5000"
)

$ErrorActionPreference = 'Stop'

try {
  $health = Invoke-WebRequest -UseBasicParsing "$BaseUrl/api/health"
  Write-Host "Health: $($health.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

try {
  $ready = Invoke-WebRequest -UseBasicParsing "$BaseUrl/api/ready"
  Write-Host "Ready: $($ready.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "Ready check failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host 'Smoke test passed.' -ForegroundColor Green

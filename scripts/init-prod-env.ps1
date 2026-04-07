$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

function Read-Value($Prompt, $Default = '') {
  if ([string]::IsNullOrWhiteSpace($Default)) {
    return Read-Host $Prompt
  }

  $value = Read-Host "$Prompt [$Default]"
  if ([string]::IsNullOrWhiteSpace($value)) {
    return $Default
  }
  return $value
}

$domain = Read-Value 'Enter your primary domain (example: devhelp.com)'
$backendDomain = Read-Value 'Enter your backend domain (example: api.devhelp.com)' "api.$domain"
$frontendDomain = Read-Value 'Enter your frontend domain (example: app.devhelp.com)' $domain
$mongoUri = Read-Value 'Enter MongoDB URI' 'mongodb://mongo:27017/devhelp'
$jwtSecret = Read-Value 'Enter JWT secret (leave blank to auto-generate)'
if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
  $bytes = New-Object byte[] 48
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $jwtSecret = [Convert]::ToBase64String($bytes)
}
$deployHookBackend = Read-Value 'Enter Render backend deploy hook (optional)'
$deployHookFrontend = Read-Value 'Enter Render frontend deploy hook (optional)'

@"
# Core
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d
RATE_LIMIT_MAX=300

# Domain
DEVHELP_DOMAIN=$domain
CLIENT_ORIGIN=https://$frontendDomain
VITE_API_URL=https://$backendDomain/api

# Database
MONGO_URI=$mongoUri

# Optional GitHub Actions / Render hooks
RENDER_DEPLOY_HOOK_BACKEND=$deployHookBackend
RENDER_DEPLOY_HOOK_FRONTEND=$deployHookFrontend
BACKEND_BASE_URL=https://$backendDomain
FRONTEND_BASE_URL=https://$frontendDomain
"@ | Set-Content '.env.prod' -Encoding UTF8

Write-Host 'Created .env.prod' -ForegroundColor Green
Write-Host 'Review the file before deploying.' -ForegroundColor Yellow

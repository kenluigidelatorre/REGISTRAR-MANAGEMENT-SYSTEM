param(
  [string]$ServiceKey = $env:REGISTRAR_SERVICE_KEY
)
$ErrorActionPreference = "Stop"
$base = "http://localhost:5001"
if ([string]::IsNullOrWhiteSpace($ServiceKey)) {
  throw "Pass -ServiceKey or set the REGISTRAR_SERVICE_KEY environment variable before running this test."
}
$headers = @{ "X-Registrar-Service-Key" = $ServiceKey }
Write-Host "Checking Registrar health..."
Invoke-RestMethod -Uri "$base/health" | ConvertTo-Json -Depth 5
Write-Host "Checking limited student list contract..."
Invoke-RestMethod -Uri "$base/api/registrar/students" -Headers $headers | ConvertTo-Json -Depth 8
Write-Host "Checking one sample student..."
Invoke-RestMethod -Uri "$base/api/registrar/students/STU-1001" -Headers $headers | ConvertTo-Json -Depth 8

$uriLogin = "http://localhost:8080/login"
$uriGetApps = "http://localhost:8080/getapps"
$uriVerify = "http://localhost:8080/verify"
$uriCheckGroup = "http://localhost:8080/checkgroups"

$headers = @{
    "Content-Type" = "application/json"
}

$bodyLogin = @{
    username = "devteam"
    password = "abc123!!"
} | ConvertTo-Json

$responseLogin = Invoke-RestMethod -Uri $uriLogin -Method Post -Headers $headers -Body $bodyLogin
$token = $responseLogin.tmptoken

# Token Validation
$bodyVerify = @{
    tmptoken = $token
} | ConvertTo-Json

$responseVerify = Invoke-RestMethod -Uri $uriVerify -Method Post -Headers $headers -Body $bodyVerify

if ($responseVerify.error) {
    Write-Host "Token validation failed. Please log in."
    return $false
}

# Get Apps
$bodyGetApps = @{
    tmptoken = $token
} | ConvertTo-Json

$responseGetApps = Invoke-RestMethod -Uri $uriGetApps -Method Post -Headers $headers -Body $bodyGetApps

$final_result = $true
if ($responseGetApps.error) {
    $final_result = $false
}

return $final_result
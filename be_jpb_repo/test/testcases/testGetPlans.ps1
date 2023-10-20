$uriLogin = "http://localhost:8080/login"
$uriGetPlans = "http://localhost:8080/getplans"
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

# Get Plans
$bodyGetPlans = @{
    tmptoken = $token
    acronym = "Full Test App"
} | ConvertTo-Json

$responseGetPlans = Invoke-RestMethod -Uri $uriGetPlans -Method Post -Headers $headers -Body $bodyGetPlans

$final_result = $true
if ($responseGetPlans.error) {
    $final_result = $false
}

return $final_result
$uriLogin = "http://localhost:8080/login"
$uriCreatePlan = "http://localhost:8080/createplan"
$uriVerify = "http://localhost:8080/verify"
$uriCheckGroup = "http://localhost:8080/checkgroups"

$headers = @{
    "Content-Type" = "application/json"
}

$bodyLogin = @{
    username = "ProjectMan"
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

# Group Checking
$bodyCheckGroup = @{
    tmptoken = $token
    groupname = "ProjectManager"
} | ConvertTo-Json

$responseCheckGroup = Invoke-RestMethod -Uri $uriCheckGroup -Method Post -Headers $headers -Body $bodyCheckGroup

if ($responseCheckGroup.error) {
    Write-Host "User does not have required group. Please log in with appropriate privileges."
    return $false
}

$randomNumber = Get-Random -Maximum 9999

$planid = "Generated Plan" + $randomNumber

# Create Plan
$bodyCreatePlan = @{
    tmptoken = $token
    acronym = "Full Test App"
    name = $planid
    start_date = ""
    end_date = ""
    color = "#FFFFFF"
} | ConvertTo-Json

$responseCreatePlan = Invoke-RestMethod -Uri $uriCreatePlan -Method Post -Headers $headers -Body $bodyCreatePlan

$final_result = $true
if ($responseCreatePlan.error) {
    $final_result = $false
}

return $final_result
$uriLogin = "http://localhost:8080/login"
$uriCreateApp = "http://localhost:8080/createapp"
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
    return $true
}

# Group Checking
$bodyCheckGroup = @{
    tmptoken = $token
    groupname = "ProjectLeader"
} | ConvertTo-Json

$responseCheckGroup = Invoke-RestMethod -Uri $uriCheckGroup -Method Post -Headers $headers -Body $bodyCheckGroup

if ($responseCheckGroup.error) {
    Write-Host "User does not have required group. Please log in with appropriate privileges."
    return $true
}

$randomNumber = Get-Random -Maximum 9999

# Create App
$bodyCreateApp = @{
    tmptoken = $token
    acronym = "Full Test App"
    description = "This is a generated description"
    rnumber = $randomNumber
    start_date = $null
    end_date = $null
    permit_open = "ProjectManager"
    permit_todo = "devops"
    permit_doing = "devops"
    permit_done = "ProjectManager"
    permit_create = "ProjectLeader"
} | ConvertTo-Json

$responseCreateApp = Invoke-RestMethod -Uri $uriCreateApp -Method Post -Headers $headers -Body $bodyCreateApp

$final_result = $false
if ($responseCreateApp.error) {
    $final_result = $true
}

return $final_result
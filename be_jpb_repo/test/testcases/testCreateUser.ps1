$uriLogin = "http://localhost:8080/login"
$uriCreateUser = "http://localhost:8080/createuser"
$uriVerify = "http://localhost:8080/verify"
$uriCheckGroup = "http://localhost:8080/checkgroups"

$headers = @{
    "Content-Type" = "application/json"
}

$bodyLogin = @{
    username = "admin"
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
    groupname = "admin"
} | ConvertTo-Json

$responseCheckGroup = Invoke-RestMethod -Uri $uriCheckGroup -Method Post -Headers $headers -Body $bodyCheckGroup

if ($responseCheckGroup.error) {
    Write-Host "User does not have required group. Please log in with appropriate privileges."
    return $false
}

$randomNumber = Get-Random -Maximum 9999
$userID = "scriptTest" + $randomNumber

# Create User
$bodyCreateUser = @{
    tmptoken = $token
    newuserid = $userID
    newpassword = "abc123!!"
    newemail = ""
    newgroups = "devops"
} | ConvertTo-Json

$responseCreateUser = Invoke-RestMethod -Uri $uriCreateUser -Method Post -Headers $headers -Body $bodyCreateUser

$final_result = $true
if ($responseCreateUser.error) {
    $final_result = $false
}

return $final_result
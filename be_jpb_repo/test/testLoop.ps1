param(
    [string]$CI_COMMIT_REF_NAME,
    [string]$CI_PROJECT_NAME
)

$expectedOutput = @{
    "testCreateUser.ps1" = $true;
    "testCreateAppFail.ps1" = $true;
    "testCreateAppPass.ps1" = $true;
    "testGetApps.ps1" = $true;
    "testGetPlans.ps1" = $true;
    "testCreatePlanFail.ps1" = $true;
    "testCreatePlanPass.ps1"=$true; 
}

$testCasesPath = "C:\Users\l1ds\group3\$CI_PROJECT_NAME\$CI_COMMIT_REF_NAME\test\testcases\"

Get-ChildItem -Path $testCasesPath -Filter *.ps1 | ForEach-Object {
    $scriptName = $_.Name
    Write-Host "Running $scriptName"

    $output = & "$testCasesPath\$scriptname"
    $test = $expectedOutput[$scriptName]
    Write-Host "Output of test: $output"

    if($output -eq $test) {
        Write-Host "$scriptName PASSED" -ForegroundColor Green
    }
    else {
        Write-Host "$scriptName FAILED. Expected: $test but got $output" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Tests completed!!"
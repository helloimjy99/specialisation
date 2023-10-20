param(
    [string]$CI_COMMIT_REF_NAME,
    [string]$CI_PROJECT_NAME
)

# Load the Docker image from the tar file
try {
    Write-Host "C:\Users\l1ds\group3\$CI_PROJECT_NAME\$CI_COMMIT_REF_NAME\bin\$CI_COMMIT_REF_NAME.tar"
    docker load -i "C:\Users\l1ds\group3\$CI_PROJECT_NAME\$CI_COMMIT_REF_NAME\bin\$CI_COMMIT_REF_NAME.tar"

    # Run the Docker container
    $image_name = $CI_PROJECT_NAME + "_" + $CI_COMMIT_REF_NAME
    Write-Host "C:\Users\l1ds\group3\$CI_PROJECT_NAME\$CI_COMMIT_REF_NAME\config\application.properties"
    docker run --name $CI_PROJECT_NAME-$CI_COMMIT_REF_NAME --env-file "C:\Users\l1ds\group3\$CI_PROJECT_NAME\$CI_COMMIT_REF_NAME\config\application.properties" -p 8080:8080 -d $image_name
}
catch {
    Write-Warning "FAILED TO DEPLOY"
    exit 1
}
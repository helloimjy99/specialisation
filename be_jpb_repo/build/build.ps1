##################
#  BUILD SCRIPT  #
##################

#
# To run from build folder
#

Write-Host "--Beginning Build Tar----------------------------------------"

$image_name = $CI_PROJECT_NAME + "_" + $CI_COMMIT_REF_NAME

cd src

try {

    #build the jar file 
    ./mvnw clean package

    #build the docker image
    docker build . -f Dockerfile -t $image_name

    cd ..

    #create image
    New-Item -Path "$BUILD_SVR_PATH\$CI_PROJECT_NAME\$CI_COMMIT_REF_NAME\bin" -ItemType Directory -Force;

    docker save $image_name -o ".\bin\$CI_COMMIT_REF_NAME.tar"

    docker rmi $image_name
}
catch {

    Write-Warning "FAILED TO BUILD"
    exit 1
}

Write-Host "--Completed Building-----------------------------------------"
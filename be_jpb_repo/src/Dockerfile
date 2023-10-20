FROM amazoncorretto:17.0.8-alpine

WORKDIR /usr/src/app

COPY target/backend-0.0.1-SNAPSHOT.jar /usr/src/app/app.jar

RUN adduser -D -u 1000 -s /bin/bash defaultuser
USER defaultuser

EXPOSE 8080

ENTRYPOINT [ "java", "-jar", "app.jar" ]